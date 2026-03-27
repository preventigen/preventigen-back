import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GemeloDigital, EstadoGemelo } from './entities/gemelo-digital.entity';
import { SimulacionTratamiento } from './entities/simulacion-tratamiento.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { CreateGemeloDto } from './dto/create-gemelo.dto';
import { SimularTratamientoDto } from './dto/simular-tratamiento.dto';
import { ActualizarGemeloDto } from './dto/actualizar-gemelo.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GemelosDigitalesService {
  constructor(
    @InjectRepository(GemeloDigital)
    private gemelosRepository: Repository<GemeloDigital>,
    @InjectRepository(SimulacionTratamiento)
    private simulacionesRepository: Repository<SimulacionTratamiento>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  async listarModelosDisponibles() {
    try {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('GOOGLE_GEMINI_API_KEY no está configurada');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      return await response.json();
    } catch (error) {
      throw new BadRequestException(`Error: ${error.message}`);
    }
  }

  async create(createGemeloDto: CreateGemeloDto, medicoId: string) {
    const { pacienteId } = createGemeloDto;

    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    const gemeloExistente = await this.gemelosRepository.findOne({
      where: { pacienteId, medicoId },
    });
    if (gemeloExistente) throw new BadRequestException('Ya existe un gemelo digital para este paciente');

    const gemelo = this.gemelosRepository.create({
      pacienteId,
      medicoId,
      historialActualizaciones: [],
    });

    return await this.gemelosRepository.save(gemelo);
  }

  async findAll(medicoId: string) {
    return await this.gemelosRepository.find({
      where: { medicoId },
      relations: ['paciente', 'simulaciones'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string, medicoId: string) {
    const gemelo = await this.gemelosRepository.findOne({
      where: { id, medicoId },
      relations: ['paciente', 'simulaciones'],
    });
    if (!gemelo) throw new NotFoundException('Gemelo digital no encontrado');
    return gemelo;
  }

  async findByPaciente(pacienteId: string, medicoId: string) {
    const gemelo = await this.gemelosRepository.findOne({
      where: { pacienteId, medicoId },
      relations: ['paciente', 'simulaciones'],
    });
    if (!gemelo) throw new NotFoundException('No existe gemelo digital para este paciente');
    return gemelo;
  }

  async getSimulaciones(gemeloId: string, medicoId: string) {
    await this.findOne(gemeloId, medicoId);
    return await this.simulacionesRepository.find({
      where: { gemeloDigitalId: gemeloId },
      order: { createdAt: 'DESC' },
    });
  }

  async simularTratamiento(simularDto: SimularTratamientoDto, medicoId: string) {
    const { gemeloDigitalId, motivoConsulta, tratamientoPropuesto, dosisYDuracion } = simularDto;

    // Cargar gemelo con paciente y sus relaciones clínicas
    const gemelo = await this.gemelosRepository.findOne({
      where: { id: gemeloDigitalId, medicoId },
      relations: ['paciente', 'paciente.novedades', 'paciente.estudios'],
    });
    if (!gemelo) throw new NotFoundException('Gemelo digital no encontrado');

    const prompt = this.construirPromptECAMM(gemelo, motivoConsulta, tratamientoPropuesto, dosisYDuracion);
    const analisisIA = await this.consultarGeminiIA(prompt);

    // Detectar si la IA marcó el tratamiento como no recomendado
    const noRecomendado = analisisIA.respuestaCompleta
      .toUpperCase()
      .includes('NO SE RECOMIENDA SEGUIR ESE TRATAMIENTO');

    const simulacion = this.simulacionesRepository.create({
      gemeloDigitalId,
      motivoConsulta,
      tratamientoPropuesto,
      dosisYDuracion,
      analisisIA: analisisIA.analisis,
      prediccionRespuesta: analisisIA.prediccion,
      promptEnviado: prompt,
      respuestaCompletaIA: analisisIA.respuestaCompleta,
      noRecomendado,
      modeloIAUtilizado: 'gemini-2.5-flash',
    });

    return await this.simulacionesRepository.save(simulacion);
  }

  async actualizarDesdeConsulta(id: string, actualizarDto: ActualizarGemeloDto, medicoId: string) {
    const gemelo = await this.findOne(id, medicoId);
    const { consultaId, cambiosRealizados, datosActualizados } = actualizarDto;

    gemelo.historialActualizaciones.push({
      fecha: new Date(),
      consultaId,
      cambios: cambiosRealizados,
      datosMedicos: datosActualizados,
    });

    gemelo.estado = EstadoGemelo.ACTUALIZADO;
    return await this.gemelosRepository.save(gemelo);
  }

  // ─── Privados ────────────────────────────────────────────────────────────────

  private calcularEdad(fechaNacimiento: Date): number {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  }

  private construirPromptECAMM(
    gemelo: GemeloDigital,
    motivoConsulta: string,
    tratamiento: string,
    dosis?: string,
  ): string {
    const paciente = gemelo.paciente;
    const edad = this.calcularEdad(paciente.fechaNacimiento);
    const fechaHoy = new Date().toLocaleDateString('es-AR');

    // ── Perfil del paciente ──────────────────────────────────────────────────
    const perfilPaciente = `**PERFIL DEL PACIENTE:**
- Nombre: ${paciente.nombre} ${paciente.apellido}
- Fecha de nacimiento: ${new Date(paciente.fechaNacimiento).toLocaleDateString('es-AR')} (Edad actual al ${fechaHoy}: ${edad} años)
- Género: ${paciente.genero}
- Diagnóstico principal: ${paciente.diagnosticoPrincipal || 'No registrado'}
- Antecedentes médicos: ${paciente.antecedentesMedicos || 'No registrados'}
- Alergias: ${paciente.alergias || 'Ninguna registrada'}
- Medicación actual: ${paciente.medicacionActual || 'Ninguna'}
- Presión arterial: ${paciente.presionArterial || 'No registrada'}
- Comentarios: ${paciente.comentarios || 'Ninguno'}`;

    // ── Eventos clínicos ─────────────────────────────────────────────────────
    const novedadesTexto = paciente.novedades && paciente.novedades.length > 0
      ? paciente.novedades
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((n, i) =>
            `${i + 1}. [${new Date(n.createdAt).toLocaleDateString('es-AR')}] Tipo: ${n.tipoEvento || 'N/D'} | Descripción: ${n.descripcion || 'N/D'} | Zona: ${n.zonaAfectada || 'N/D'} | Gravedad: ${n.gravedad || 'N/D'} | Observaciones: ${n.observaciones || 'N/D'}`,
          )
          .join('\n')
      : 'Sin eventos clínicos registrados.';

    // ── Estudios médicos ─────────────────────────────────────────────────────
    const estudiosTexto = paciente.estudios && paciente.estudios.length > 0
      ? paciente.estudios
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((e, i) =>
            `${i + 1}. [${e.fecha ? new Date(e.fecha).toLocaleDateString('es-AR') : 'Sin fecha'}] Estudio: ${e.nombreEstudio} | Observaciones: ${e.observaciones || 'N/D'}`,
          )
          .join('\n')
      : 'Sin estudios médicos registrados.';

    return `Eres un médico especialista en medicina de precisión, con enfoque en análisis clínico integral utilizando la metodología ECAMM (Evaluación Clínica Avanzada con Modelos Médicos).

Tu rol no es reemplazar al médico tratante, sino asistir en la interpretación clínica avanzada, identificando patrones, relaciones entre variables y posibles riesgos, en base a la información disponible.

Vas a trabajar sobre un "Gemelo Digital del Paciente", que representa una reconstrucción estructurada de su estado de salud a partir de datos personales, antecedentes, eventos clínicos y estudios médicos.

Debes considerar que:
- La información puede ser incompleta, heterogénea o contener omisiones.
- No todos los datos tienen el mismo peso clínico.
- Es fundamental priorizar el contexto general del paciente por sobre datos aislados.
- Los eventos clínicos y estudios deben analizarse en forma longitudinal (evolución en el tiempo).
- Debes identificar inconsistencias, vacíos de información relevantes y posibles riesgos clínicos.

En tu análisis:
- Integra toda la información disponible antes de emitir conclusiones.
- Evita suposiciones no fundamentadas.
- Señala cuando la información es insuficiente para una conclusión sólida.
- Prioriza criterios médicos basados en evidencia y razonamiento clínico.
- Si detectas datos críticos (riesgo alto, urgencia, contradicciones relevantes), debes destacarlo explícitamente.

${perfilPaciente}

**EVENTOS CLÍNICOS DEL PACIENTE (ordenados del más reciente al más antiguo):**
${novedadesTexto}

**ESTUDIOS MÉDICOS DEL PACIENTE (ordenados del más reciente al más antiguo):**
${estudiosTexto}

**DATOS DE LA CONSULTA ACTUAL:**
- Motivo de consulta: ${motivoConsulta}

**TRATAMIENTO PROPUESTO POR EL MÉDICO:**
${tratamiento}
${dosis ? `\n**DOSIS Y DURACIÓN:**\n${dosis}` : ''}

**INSTRUCCIÓN DE EVALUACIÓN DE TRATAMIENTO:**
Tu tarea es evaluar la coherencia, seguridad y viabilidad clínica del tratamiento propuesto en función del paciente.

Debes analizar:
- Relación entre motivo de consulta y tratamiento indicado
- Compatibilidad con antecedentes médicos
- Interacciones con medicación actual
- Alergias
- Riesgos potenciales
- Coherencia clínica general

CRITERIO CRÍTICO:
Si el tratamiento es claramente incorrecto, ilógico o potencialmente riesgoso para el paciente, debes anteponer al resultado el siguiente mensaje:

"NO SE RECOMIENDA SEGUIR ESE TRATAMIENTO"

(en mayúsculas, como primera línea del output)

Luego continúa con el análisis en formato JSON.

Si el tratamiento es válido pero mejorable, indícalo en recomendaciones.
Si la información es insuficiente, indícalo explícitamente.

**ANÁLISIS REQUERIDO (responde SOLO en formato JSON después del aviso si corresponde):**
{
  "analisis": {
    "efectividadEstimada": <número 0-100>,
    "coherenciaClinica": <número 0-100>,
    "riesgos": ["riesgo1", "riesgo2"],
    "beneficios": ["beneficio1", "beneficio2"],
    "contraindicaciones": ["contraindicacion1"],
    "interaccionesMedicamentosas": ["interaccion1"],
    "efectosSecundariosProbables": ["efecto1", "efecto2"],
    "recomendaciones": ["recomendacion1"],
    "ajustesDosis": "descripción de ajustes necesarios",
    "monitoreoCritico": ["parametro1", "parametro2"],
    "alternativasSugeridas": [
      {"medicamento": "nombre", "razon": "explicación"}
    ]
  },
  "prediccion": {
    "tiempoMejoriaEstimado": "X días/semanas",
    "probabilidadExito": <número 0-100>,
    "factoresRiesgo": ["factor1"],
    "parametrosMonitoreo": ["parametro1"]
  }
}`;
  }

  private async consultarGeminiIA(prompt: string): Promise<any> {
    try {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      if (!apiKey) throw new Error('GOOGLE_GEMINI_API_KEY no está configurada');

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(prompt);
      const respuestaCompleta = result.response.text();

      const jsonMatch = respuestaCompleta.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('La IA no devolvió un JSON válido');

      const resultado = JSON.parse(jsonMatch[0]);

      return {
        analisis: resultado.analisis,
        prediccion: resultado.prediccion,
        respuestaCompleta,
      };
    } catch (error) {
      throw new BadRequestException(`Error al consultar IA: ${error.message}`);
    }
  }
}