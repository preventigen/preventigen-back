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
  ) {}

  async analizar(createDto: CreateAnalisisIADto, medicoId: string): Promise<AnalisisIA> {
    const { pacienteId, datoMedicoId, tipoPrompt, promptUsuario } = createDto;

    // 1. Obtener paciente validando que pertenece al médico
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    // 2. Obtener datos médicos (todos o uno específico), validando por medicoId
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

    // Los datos médicos son opcionales — el análisis puede basarse solo en los datos del paciente
    // 3. Buscar el GemeloDigital del paciente (puede no existir)
    const gemelo = await this.gemelosRepository.findOne({ where: { pacienteId, medicoId } });

    // 4. Recuperar contexto previo
    const previoIA = await this.previoIARepository.findOne({
      where: { pacienteId },
      order: { fechaRegistro: 'DESC' },
    });

    // 5. Construir prompt unificado
    const promptFinal = this.construirPrompt(
      paciente,
      datosMedicos,
      gemelo ?? null,
      previoIA?.registroIA,
      promptUsuario,
    );

    // 6. Llamar a Gemini
    const { respuesta, resumen } = await this.consultarGemini(promptFinal);

    // 7. Guardar el análisis
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

    // 8. Actualizar memoria (previo_ia)
    await this.actualizarPrevioIA(pacienteId, resumen, previoIA);

    // 9. Si hay gemelo, marcarlo como ACTUALIZADO
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
    // Verificar que el paciente pertenece al médico
    if (analisis.paciente.medicoId !== medicoId) throw new NotFoundException(`Análisis con ID ${id} no encontrado`);
    return analisis;
  }

  // ─── Privados ────────────────────────────────────────────────────────────────

  private construirPrompt(
    paciente: Paciente,
    datosMedicos: DatoMedico[],
    gemelo: GemeloDigital | null,
    contextoAnterior?: string,
    promptUsuario?: string,
  ): string {
    // Calcular edad desde fechaNacimiento
    const hoy = new Date();
    const nacimiento = new Date(paciente.fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();

    const datosBasicos = `**DATOS DEL PACIENTE:**
- Nombre: ${paciente.nombre} ${paciente.apellido}
- Edad: ${edad} años
- Género: ${paciente.genero}
- Diagnóstico principal: ${paciente.diagnosticoPrincipal || 'No registrado'}
- Antecedentes médicos: ${paciente.antecedentesMedicos || 'No registrados'}
- Medicación actual: ${paciente.medicacionActual || 'Ninguna registrada'}
- Presión arterial: ${paciente.presionArterial || 'No registrada'}
- Comentarios: ${paciente.comentarios || 'Ninguno'}`;

    const perfilGemelo = gemelo
  ? `\n**GEMELO DIGITAL ACTIVO:** ID ${gemelo.id} — Estado: ${gemelo.estado}`
  : '';

    const datosTexto = datosMedicos.length > 0
      ? datosMedicos
          .map(
            (d, i) =>
              `[Registro ${i + 1} - ${d.tipo} - ${d.fechaCarga.toLocaleDateString('es-AR')}]\n${d.contenido}`,
          )
          .join('\n\n')
      : 'Sin registros adicionales cargados.';

    const contextoSection = contextoAnterior
      ? `\n**CONTEXTO DE INTERACCIONES PREVIAS:**\n${contextoAnterior}\n`
      : '';

    const promptSection = promptUsuario
      ? `\n**CONSULTA DEL MÉDICO:**\n${promptUsuario}\n`
      : '';

    return `Eres un asistente médico especializado en análisis clínico preventivo.
Analiza la información del siguiente paciente y proporciona un análisis detallado.

${datosBasicos}
${perfilGemelo}
${contextoSection}
**ANOTACIONES Y DATOS MÉDICOS ADICIONALES:**
${datosTexto}
${promptSection}
**INSTRUCCIONES:**
1. Análisis clínico integral considerando TODA la información disponible.
2. Observaciones relevantes y posibles áreas de atención.
3. Recomendaciones preventivas o de seguimiento.
4. Si hay alertas o datos que requieran atención urgente, menciónalos claramente.

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