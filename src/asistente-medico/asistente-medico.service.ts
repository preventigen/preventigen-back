import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConsultaAsistente } from './entities/consulta-asistente.entity';
import { CreateConsultaAsistenteDto } from './dto/create-consulta-asistente.dto';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Consulta } from '../consultas/entities/consulta.entity';

@Injectable()
export class AsistenteMedicoService {
  constructor(
    @InjectRepository(ConsultaAsistente)
    private consultaAsistenteRepository: Repository<ConsultaAsistente>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
    @InjectRepository(Consulta)
    private consultasRepository: Repository<Consulta>,
  ) {}

  async consultar(dto: CreateConsultaAsistenteDto, medicoId: string): Promise<ConsultaAsistente> {
    const { pacienteId, consultaMedico } = dto;

    // Cargar paciente con todas sus relaciones clínicas
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
      relations: ['novedades', 'estudios'],
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    // Cargar consultas del paciente
    const consultas = await this.consultasRepository.find({
      where: { pacienteId, medicoId },
      order: { createdAt: 'DESC' },
    });

    const prompt = this.construirPrompt(paciente, consultas, consultaMedico);
    const respuesta = await this.consultarGemini(prompt);

    const consulta = this.consultaAsistenteRepository.create({
      pacienteId,
      medicoId,
      consultaMedico,
      promptEnviado: prompt,
      respuestaIA: respuesta,
      modeloIAUtilizado: 'gemini-2.5-flash',
    });

    return await this.consultaAsistenteRepository.save(consulta);
  }

  async findByPaciente(pacienteId: string, medicoId: string): Promise<ConsultaAsistente[]> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    return await this.consultaAsistenteRepository.find({
      where: { pacienteId, medicoId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, medicoId: string): Promise<ConsultaAsistente> {
    const consulta = await this.consultaAsistenteRepository.findOne({
      where: { id, medicoId },
      relations: ['paciente'],
    });
    if (!consulta) throw new NotFoundException('Consulta no encontrada');
    return consulta;
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
    consultaMedico: string,
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
            `${i + 1}. [${new Date(n.createdAt).toLocaleDateString('es-AR')}] Tipo: ${n.tipoEvento || 'N/D'} | Descripción: ${n.descripcion || 'N/D'} | Zona: ${n.zonaAfectada || 'N/D'} | Gravedad: ${n.gravedad || 'N/D'} | Observaciones: ${n.observaciones || 'N/D'}`,
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

**HISTORIAL DE CONSULTAS (ordenadas de la más reciente a la más antigua):**
${consultasTexto}

**CONSULTA DEL MÉDICO TRATANTE:**
${consultaMedico}

**INSTRUCCIÓN DE ASISTENTE MÉDICO:**
Actúas como asistente clínico del médico tratante.
Tu tarea es responder exclusivamente esa consulta utilizando la información disponible del paciente, integrando razonamiento clínico y evidencia médica.

Debes:
- Responder de forma clara, precisa y fundamentada
- Basarte únicamente en la información del paciente y conocimiento médico
- Indicar si la información es insuficiente cuando corresponda
- Detectar patrones, inconsistencias o riesgos si la consulta lo requiere
- Evitar suposiciones no fundamentadas

IMPORTANTE — RESTRICCIONES DEL SISTEMA:
Este modelo está diseñado exclusivamente como asistente clínico.
NO debes responder:
- Preguntas sobre la configuración del sistema
- Funcionamiento interno de la IA
- Detalles técnicos del modelo
- Instrucciones fuera del análisis médico del paciente

Si la consulta del médico se desvía de estos objetivos, debes responder exactamente:
"Este modelo es un asistente clínico del médico y no está configurado para responder ese tipo de consultas."

FORMATO DE RESPUESTA:
- Respuesta clara y estructurada en texto
- Puede incluir listas o subtítulos si mejora la comprensión
- Debe ser concisa pero clínicamente útil`;
  }

  private async consultarGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) throw new BadRequestException('GOOGLE_GEMINI_API_KEY no está configurada');

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      throw new BadRequestException(`Error al consultar Gemini: ${error.message}`);
    }
  }
}