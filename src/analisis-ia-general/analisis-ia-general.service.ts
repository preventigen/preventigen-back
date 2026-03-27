import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalisisIA, TipoPrompt } from './entities/analisis-ia.entity';
import { PrevioIA } from './entities/previo-ia.entity';
import { DatoMedico } from '../datos-medicos/entities/dato-medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { GemeloDigital, EstadoGemelo } from '../gemelos-digitales/entities/gemelo-digital.entity';
import { CreateAnalisisIADto } from './dto/create-analisis-ia.dto';
import { Consulta } from '../consultas/entities/consulta.entity';

@Injectable()
export class AnalisisIAService {
  constructor(
    @InjectRepository(AnalisisIA)
    private analisisRepository: Repository<AnalisisIA>,
    @InjectRepository(PrevioIA)
    private previoIARepository: Repository<PrevioIA>,
    @InjectRepository(DatoMedico)
    private datosMedicosRepository: Repository<DatoMedico>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
    @InjectRepository(GemeloDigital)
    private gemelosRepository: Repository<GemeloDigital>,
    @InjectRepository(Consulta)
    private consultasRepository: Repository<Consulta>,
  ) {}

  async analizar(createDto: CreateAnalisisIADto, medicoId: string): Promise<AnalisisIA> {
    const { pacienteId, datoMedicoId, tipoPrompt, promptUsuario } = createDto;

    // 1. Obtener paciente con sus relaciones
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
      relations: ['novedades', 'estudios'],
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    // 2. Obtener consultas del paciente
    const consultas = await this.consultasRepository.find({
      where: { pacienteId, medicoId },
      order: { createdAt: 'DESC' },
    });

    // 3. Obtener datos médicos (anotaciones libres)
    let datosMedicos: DatoMedico[] = [];
    if (datoMedicoId) {
      const dato = await this.datosMedicosRepository.findOne({
        where: { id: datoMedicoId, pacienteId, medicoId },
      });
      if (!dato) throw new NotFoundException('Dato médico no encontrado o no pertenece al paciente');
      datosMedicos = [dato];
    } else {
      datosMedicos = await this.datosMedicosRepository.find({
        where: { pacienteId, medicoId },
        order: { fechaCarga: 'ASC' },
      });
    }

    // 4. Buscar el GemeloDigital del paciente (puede no existir)
    const gemelo = await this.gemelosRepository.findOne({ where: { pacienteId, medicoId } });

    // 5. Recuperar contexto previo
    const previoIA = await this.previoIARepository.findOne({
      where: { pacienteId },
      order: { fechaRegistro: 'DESC' },
    });

    // 6. Construir prompt
    const promptFinal = this.construirPrompt(
      paciente,
      consultas,
      datosMedicos,
      gemelo ?? null,
      previoIA?.registroIA,
      promptUsuario,
    );

    // 7. Llamar a Gemini
    const { respuesta, resumen } = await this.consultarGemini(promptFinal);

    // 8. Guardar el análisis
    const analisis = this.analisisRepository.create({
      pacienteId,
      datoMedicoId: datoMedicoId ?? undefined,
      gemeloDigitalId: gemelo?.id ?? undefined,
      tipoPrompt: tipoPrompt || TipoPrompt.USUARIO,
      prompt: promptFinal,
      respuestaIA: respuesta,
      resumenContexto: resumen,
    });
    const analisisGuardado: AnalisisIA = await this.analisisRepository.save(analisis);

    // 9. Actualizar memoria (previo_ia)
    await this.actualizarPrevioIA(pacienteId, resumen, previoIA);

    // 10. Si hay gemelo, marcarlo como ACTUALIZADO
    if (gemelo) {
      gemelo.estado = EstadoGemelo.ACTUALIZADO;
      await this.gemelosRepository.save(gemelo);
    }

    return analisisGuardado;
  }

  async findByPaciente(pacienteId: string, medicoId: string): Promise<AnalisisIA[]> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    return await this.analisisRepository.find({
      where: { pacienteId },
      relations: ['datoMedico', 'gemeloDigital'],
      order: { fechaGeneracion: 'DESC' },
    });
  }

  async findUltimo(pacienteId: string, medicoId: string): Promise<AnalisisIA> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    const analisis = await this.analisisRepository.findOne({
      where: { pacienteId },
      relations: ['datoMedico', 'gemeloDigital'],
      order: { fechaGeneracion: 'DESC' },
    });
    if (!analisis) throw new NotFoundException('No hay análisis previos para este paciente');
    return analisis;
  }

  async findContexto(pacienteId: string, medicoId: string): Promise<PrevioIA | null> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    return await this.previoIARepository.findOne({
      where: { pacienteId },
      order: { fechaRegistro: 'DESC' },
    });
  }

  async findOne(id: string, medicoId: string): Promise<AnalisisIA> {
    const analisis = await this.analisisRepository.findOne({
      where: { id },
      relations: ['paciente', 'datoMedico', 'gemeloDigital'],
    });
    if (!analisis) throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    if (analisis.paciente.medicoId !== medicoId) throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    return analisis;
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

  private construirPrompt(
    paciente: Paciente,
    consultas: Consulta[],
    datosMedicos: DatoMedico[],
    gemelo: GemeloDigital | null,
    contextoAnterior?: string,
    promptUsuario?: string,
  ): string {
    const edad = this.calcularEdad(paciente.fechaNacimiento);
    const fechaHoy = new Date().toLocaleDateString('es-AR');

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

    const novedadesTexto = paciente.novedades && paciente.novedades.length > 0
      ? paciente.novedades
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((n, i) =>
            `${i + 1}. [${new Date(n.createdAt).toLocaleDateString('es-AR')}] Tipo: ${n.tipoEvento || 'N/D'} | Descripción: ${n.descripcion || 'N/D'} | Zona afectada: ${n.zonaAfectada || 'N/D'} | Gravedad: ${n.gravedad || 'N/D'} | Observaciones: ${n.observaciones || 'N/D'}`,
          )
          .join('\n')
      : 'Sin eventos clínicos registrados.';

    const estudiosTexto = paciente.estudios && paciente.estudios.length > 0
      ? paciente.estudios
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .map((e, i) =>
            `${i + 1}. [${e.fecha ? new Date(e.fecha).toLocaleDateString('es-AR') : 'Sin fecha'}] Estudio: ${e.nombreEstudio} | Observaciones: ${e.observaciones || 'N/D'}`,
          )
          .join('\n')
      : 'Sin estudios médicos registrados.';

    const consultasTexto = consultas && consultas.length > 0
      ? consultas
          .map((c, i) =>
            `${i + 1}. [${new Date(c.createdAt).toLocaleDateString('es-AR')}] Estado: ${c.estado} | Detalles: ${c.detalles || 'N/D'} | Tratamiento indicado: ${c.tratamientoIndicado || 'N/D'}`,
          )
          .join('\n')
      : 'Sin consultas registradas.';

    const anotacionesTexto = datosMedicos.length > 0
      ? datosMedicos
          .map((d, i) =>
            `${i + 1}. [${d.fechaCarga.toLocaleDateString('es-AR')}] Tipo: ${d.tipo} | ${d.contenido}`,
          )
          .join('\n')
      : 'Sin anotaciones adicionales.';

    const gemeloTexto = gemelo
      ? `\n**GEMELO DIGITAL ACTIVO:** Estado: ${gemelo.estado}`
      : '';

    const contextoTexto = contextoAnterior
      ? `\n**CONTEXTO DE INTERACCIONES PREVIAS:**\n${contextoAnterior}\n`
      : '';

    const consultaTexto = promptUsuario
      ? `\n**CONSULTA ESPECÍFICA DEL MÉDICO:**\n${promptUsuario}\n`
      : '';

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

A continuación se presenta el Gemelo Digital del Paciente para su análisis:
${gemeloTexto}

${perfilPaciente}

**EVENTOS CLÍNICOS DEL PACIENTE (ordenados del más reciente al más antiguo):**
${novedadesTexto}

**ESTUDIOS MÉDICOS DEL PACIENTE (ordenados del más reciente al más antiguo):**
${estudiosTexto}

**HISTORIAL DE CONSULTAS (ordenadas de la más reciente a la más antigua):**
${consultasTexto}

**ANOTACIONES DEL MÉDICO:**
${anotacionesTexto}
${contextoTexto}${consultaTexto}
**INSTRUCCIÓN DE ANÁLISIS GENERAL:**
Realiza un análisis clínico integral del paciente a partir del Gemelo Digital provisto.
El objetivo es brindar al médico tratante una visión rápida, clara y estructurada del estado general del paciente, priorizando:
- Diagnóstico presuntivo (si corresponde)
- Estado clínico actual
- Evolución reciente (especialmente últimos eventos clínicos y estudios)
- Identificación de riesgos actuales y potenciales

Debes:
- Priorizar los eventos clínicos más recientes como indicador del estado actual
- Detectar patrones relevantes (repetición de síntomas, evolución, empeoramiento/mejoría)
- Integrar antecedentes, medicación, consultas previas y estudios en un único razonamiento clínico
- Señalar inconsistencias o faltantes de información crítica
- Evitar conclusiones categóricas si la evidencia es insuficiente

**FORMATO DE RESPUESTA (texto estructurado, NO JSON):**
1. Resumen clínico:
2. Diagnóstico presuntivo:
3. Estado actual:
4. Evolución reciente:
5. Alertas clínicas:
6. Observaciones adicionales:

Al final, incluye una sección titulada exactamente "RESUMEN_CONTEXTO:" seguida de un resumen en no más de 200 caracteres de los puntos clave de esta interacción.`;
  }

  private async consultarGemini(prompt: string): Promise<{ respuesta: string; resumen: string }> {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new BadRequestException('GOOGLE_GEMINI_API_KEY no está configurada');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(prompt);
      const respuestaCompleta = result.response.text();

      const resumenMatch = respuestaCompleta.match(/RESUMEN_CONTEXTO:\s*(.+?)(?:\n|$)/s);
      const resumen = resumenMatch
        ? resumenMatch[1].trim().substring(0, 200)
        : respuestaCompleta.substring(0, 200);

      const respuestaLimpia = respuestaCompleta.replace(/RESUMEN_CONTEXTO:[\s\S]*$/, '').trim();

      return { respuesta: respuestaLimpia, resumen };
    } catch (error) {
      throw new BadRequestException(`Error al consultar Gemini: ${error.message}`);
    }
  }

  private async actualizarPrevioIA(
    pacienteId: string,
    nuevoResumen: string,
    previoExistente?: PrevioIA | null,
  ): Promise<void> {
    if (previoExistente) {
      const contextoAcumulado = `${previoExistente.registroIA} | ${nuevoResumen}`.substring(0, 1000);
      previoExistente.registroIA = contextoAcumulado;
      previoExistente.fechaRegistro = new Date();
      await this.previoIARepository.save(previoExistente);
    } else {
      const nuevo = this.previoIARepository.create({ pacienteId, registroIA: nuevoResumen });
      await this.previoIARepository.save(nuevo);
    }
  }
}