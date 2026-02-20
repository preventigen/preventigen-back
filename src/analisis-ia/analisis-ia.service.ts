import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalisisIA, TipoPrompt } from './entities/analisis-ia.entity';
import { PrevioIA } from './entities/previo-ia.entity';
import { DatoMedico } from '../datos-medicos/entities/dato-medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { CreateAnalisisIADto } from './dto/create-analisis-ia.dto';

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
  ) {}

  /**
   * Flujo principal: toma datos del paciente, construye el prompt,
   * llama a Gemini, guarda el resultado y actualiza el contexto previo.
   */
  async analizar(createDto: CreateAnalisisIADto): Promise<AnalisisIA> {
    const { pacienteId, datoMedicoId, tipoPrompt, promptUsuario } = createDto;

    // 1. Obtener paciente
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId },
    });
    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // 2. Obtener datos médicos (todos o uno específico)
    let datosMedicos: DatoMedico[] = [];
    if (datoMedicoId) {
      const dato = await this.datosMedicosRepository.findOne({
        where: { id: datoMedicoId, pacienteId },
      });
      if (!dato) {
        throw new NotFoundException('Dato médico no encontrado o no pertenece al paciente');
      }
      datosMedicos = [dato];
    } else {
      datosMedicos = await this.datosMedicosRepository.find({
        where: { pacienteId },
        order: { fechaCarga: 'ASC' },
      });
    }

    if (datosMedicos.length === 0) {
      throw new BadRequestException('El paciente no tiene datos médicos cargados para analizar');
    }

    // 3. Obtener contexto previo (memoria de interacciones anteriores)
    const previoIA = await this.previoIARepository.findOne({
      where: { pacienteId },
      order: { fechaRegistro: 'DESC' },
    });

    // 4. Construir el prompt completo
    const promptFinal = this.construirPrompt(paciente, datosMedicos, previoIA?.registroIA, promptUsuario);

    // 5. Llamar a Gemini
    const { respuesta, resumen } = await this.consultarGemini(promptFinal);

    // 6. Guardar el análisis en analisis_ia
    const analisis = this.analisisRepository.create({
      pacienteId,
      datoMedicoId: datoMedicoId || null,
      tipoPrompt: tipoPrompt || TipoPrompt.USUARIO,
      prompt: promptFinal,
      respuestaIA: respuesta,
      resumenContexto: resumen,
    });
    const analisisGuardado = await this.analisisRepository.save(analisis);

    // 7. Actualizar o crear el registro de contexto previo (previo_ia)
    await this.actualizarPrevioIA(pacienteId, resumen, previoIA);

    return analisisGuardado;
  }

  /**
   * Obtener todos los análisis de un paciente (historial completo).
   */
  async findByPaciente(pacienteId: string): Promise<AnalisisIA[]> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId },
    });
    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return await this.analisisRepository.find({
      where: { pacienteId },
      relations: ['datoMedico'],
      order: { fechaGeneracion: 'DESC' },
    });
  }

  /**
   * Obtener el último análisis de un paciente.
   */
  async findUltimo(pacienteId: string): Promise<AnalisisIA> {
    const analisis = await this.analisisRepository.findOne({
      where: { pacienteId },
      relations: ['datoMedico'],
      order: { fechaGeneracion: 'DESC' },
    });

    if (!analisis) {
      throw new NotFoundException('No hay análisis previos para este paciente');
    }

    return analisis;
  }

  /**
   * Obtener el contexto/memoria acumulado de un paciente.
   */
  async findContexto(pacienteId: string): Promise<PrevioIA | null> {
    return await this.previoIARepository.findOne({
      where: { pacienteId },
      order: { fechaRegistro: 'DESC' },
    });
  }

  /**
   * Obtener análisis por ID.
   */
  async findOne(id: string): Promise<AnalisisIA> {
    const analisis = await this.analisisRepository.findOne({
      where: { id },
      relations: ['paciente', 'datoMedico'],
    });

    if (!analisis) {
      throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    }

    return analisis;
  }

  // ─── Métodos privados ───────────────────────────────────────────────────────

  private construirPrompt(
    paciente: Paciente,
    datosMedicos: DatoMedico[],
    contextoAnterior?: string,
    promptUsuario?: string,
  ): string {
    const datosFormateados = datosMedicos
      .map(
        (d, i) =>
          `[Registro ${i + 1} - ${d.tipo} - ${d.fechaCarga.toLocaleDateString('es-AR')}]\n${d.contenido}`,
      )
      .join('\n\n');

    const contextoSection = contextoAnterior
      ? `\n**CONTEXTO DE INTERACCIONES PREVIAS:**\n${contextoAnterior}\n`
      : '';

    const promptSection = promptUsuario
      ? `\n**CONSULTA DEL MÉDICO:**\n${promptUsuario}\n`
      : '';

    return `Eres un asistente médico especializado en análisis clínico preventivo. 
Analiza la información del siguiente paciente y proporciona un análisis detallado.

**DATOS DEL PACIENTE:**
- Nombre: ${paciente.nombre}
- Edad: ${paciente.edad || 'No especificada'}
- Alergias conocidas: ${paciente.alergias?.join(', ') || 'Ninguna registrada'}
- Enfermedades crónicas: ${paciente.enfermedadesCronicas?.join(', ') || 'Ninguna registrada'}
${contextoSection}
**INFORMACIÓN MÉDICA:**
${datosFormateados}
${promptSection}
**INSTRUCCIONES:**
Proporciona:
1. Un análisis clínico de los datos presentados.
2. Observaciones relevantes y posibles áreas de atención.
3. Recomendaciones preventivas o de seguimiento.
4. Si hay alertas o datos que requieran atención urgente, menciónalos claramente.

Al final de tu respuesta, incluye una sección titulada exactamente "RESUMEN_CONTEXTO:" seguida de un resumen en no más de 200 caracteres de los puntos clave de esta interacción para uso como contexto futuro.`;
  }

  private async consultarGemini(prompt: string): Promise<{ respuesta: string; resumen: string }> {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new BadRequestException('GOOGLE_GEMINI_API_KEY no está configurada');
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent(prompt);
      const respuestaCompleta = result.response.text();

      // Extraer el resumen de contexto del final de la respuesta
      const resumenMatch = respuestaCompleta.match(/RESUMEN_CONTEXTO:\s*(.+?)(?:\n|$)/s);
      const resumen = resumenMatch
        ? resumenMatch[1].trim().substring(0, 200)
        : respuestaCompleta.substring(0, 200);

      // Respuesta sin la sección de resumen
      const respuestaLimpia = respuestaCompleta
        .replace(/RESUMEN_CONTEXTO:[\s\S]*$/, '')
        .trim();

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
      // Acumular contexto: mantener el anterior + agregar el nuevo
      const contextoAcumulado = `${previoExistente.registroIA} | ${nuevoResumen}`.substring(0, 1000);
      previoExistente.registroIA = contextoAcumulado;
      previoExistente.fechaRegistro = new Date();
      await this.previoIARepository.save(previoExistente);
    } else {
      // Primera interacción: crear registro nuevo
      const nuevo = this.previoIARepository.create({
        pacienteId,
        registroIA: nuevoResumen,
      });
      await this.previoIARepository.save(nuevo);
    }
  }
}