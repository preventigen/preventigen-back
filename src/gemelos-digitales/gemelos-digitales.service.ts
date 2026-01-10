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

  // Crear gemelo digital
  async create(createGemeloDto: CreateGemeloDto, medicoId: string) {
    const { pacienteId, perfilMedico } = createGemeloDto;

    // Verificar que el paciente existe
    const paciente = await this.pacientesRepository.findOne({ where: { id: pacienteId } });
    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Verificar si ya existe un gemelo para este paciente
    const gemeloExistente = await this.gemelosRepository.findOne({
      where: { pacienteId, medicoId },
    });

    if (gemeloExistente) {
      throw new BadRequestException('Ya existe un gemelo digital para este paciente');
    }

    const gemelo = this.gemelosRepository.create({
      pacienteId,
      medicoId,
      perfilMedico,
      historialActualizaciones: [],
    });

    return await this.gemelosRepository.save(gemelo);
  }

  // Listar gemelos del médico
  async findAll(medicoId: string) {
    return await this.gemelosRepository.find({
      where: { medicoId },
      relations: ['paciente', 'simulaciones'],
      order: { updatedAt: 'DESC' },
    });
  }

  // Obtener gemelo específico
  async findOne(id: string, medicoId: string) {
    const gemelo = await this.gemelosRepository.findOne({
      where: { id, medicoId },
      relations: ['paciente', 'simulaciones'],
    });

    if (!gemelo) {
      throw new NotFoundException('Gemelo digital no encontrado');
    }

    return gemelo;
  }

  // Obtener gemelo por paciente
  async findByPaciente(pacienteId: string, medicoId: string) {
    const gemelo = await this.gemelosRepository.findOne({
      where: { pacienteId, medicoId },
      relations: ['paciente', 'simulaciones'],
    });

    if (!gemelo) {
      throw new NotFoundException('No existe gemelo digital para este paciente');
    }

    return gemelo;
  }

  // Simular tratamiento con IA
  async simularTratamiento(simularDto: SimularTratamientoDto, medicoId: string) {
    const { gemeloDigitalId, tratamientoPropuesto, dosisYDuracion } = simularDto;

    const gemelo = await this.findOne(gemeloDigitalId, medicoId);

    // Construir el prompt para Claude
    const prompt = this.construirPromptECAMM(gemelo, tratamientoPropuesto, dosisYDuracion);

    // Llamar a la API de Anthropic
    const analisisIA = await this.consultarGeminiIA(prompt);

    // Guardar la simulación
    const simulacion = this.simulacionesRepository.create({
      gemeloDigitalId,
      tratamientoPropuesto,
      dosisYDuracion,
      analisisIA: analisisIA.analisis,
      prediccionRespuesta: analisisIA.prediccion,
      promptEnviado: prompt,
      respuestaCompletaIA: analisisIA.respuestaCompleta,
      modeloIAUtilizado: 'gemini-2.0-flash-exp',
    });

    return await this.simulacionesRepository.save(simulacion);
  }

  // Actualizar gemelo con datos de consulta real
  async actualizarDesdeConsulta(id: string, actualizarDto: ActualizarGemeloDto, medicoId: string) {
    const gemelo = await this.findOne(id, medicoId);

    const { consultaId, cambiosRealizados, datosActualizados } = actualizarDto;

    // Actualizar perfil médico
    gemelo.perfilMedico = {
      ...gemelo.perfilMedico,
      ...datosActualizados,
    };

    // Agregar al historial
    gemelo.historialActualizaciones.push({
      fecha: new Date(),
      consultaId,
      cambios: cambiosRealizados,
      datosMedicos: datosActualizados,
    });

    gemelo.estado = EstadoGemelo.ACTUALIZADO;

    return await this.gemelosRepository.save(gemelo);
  }

  // Construir prompt ECAMM para Claude
  private construirPromptECAMM(gemelo: GemeloDigital, tratamiento: string, dosis?: string): string {
    const perfil = gemelo.perfilMedico;

    return `Eres un médico especialista en medicina de precisión utilizando la técnica ECAMM (Evaluación Clínica Avanzada con Modelos Médicos). 

Analiza el siguiente caso clínico y el tratamiento propuesto:

**PERFIL DEL PACIENTE (Gemelo Digital):**
- Edad: ${perfil.edad} años
- Sexo: ${perfil.sexo}
- Peso: ${perfil.peso || 'No especificado'} kg
- Altura: ${perfil.altura || 'No especificado'} cm
- Alergias: ${perfil.alergias.join(', ') || 'Ninguna'}
- Enfermedades crónicas: ${perfil.enfermedadesCronicas.join(', ') || 'Ninguna'}
- Medicación actual: ${perfil.medicacionActual.join(', ') || 'Ninguna'}
- Antecedentes quirúrgicos: ${perfil.antecedentesQuirurgicos?.join(', ') || 'Ninguno'}
- Antecedentes familiares: ${perfil.antecedentesFamiliares?.join(', ') || 'Ninguno'}
- Hábitos de vida: ${JSON.stringify(perfil.habitosVida || {}, null, 2)}
- Signos vitales actuales: ${JSON.stringify(perfil.signosVitales || {}, null, 2)}

**TRATAMIENTO PROPUESTO:**
${tratamiento}
${dosis ? `\n**DOSIS Y DURACIÓN:**\n${dosis}` : ''}

**ANÁLISIS REQUERIDO (responde SOLO en formato JSON):**
{
  "analisis": {
    "efectividadEstimada": <número 0-100>,
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
}

IMPORTANTE: Responde ÚNICAMENTE con el JSON, sin texto adicional.`;
  }

  // Llamar a Claude API
  private async consultarGeminiIA(prompt: string): Promise<any> {
    try {
      const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
      
      if (!apiKey) {
        throw new Error('GOOGLE_GEMINI_API_KEY no está configurada en las variables de entorno');
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  
      const result = await model.generateContent(prompt);
      const respuestaCompleta = result.response.text();
  
      // Parsear JSON de la respuesta
      const jsonMatch = respuestaCompleta.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('La IA no devolvió un JSON válido');
      }
  
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

  // Listar simulaciones de un gemelo
  async getSimulaciones(gemeloId: string, medicoId: string) {
    const gemelo = await this.findOne(gemeloId, medicoId);

    return await this.simulacionesRepository.find({
      where: { gemeloDigitalId: gemeloId },
      order: { createdAt: 'DESC' },
    });
  }
}