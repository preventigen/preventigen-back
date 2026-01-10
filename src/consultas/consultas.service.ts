import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consulta, EstadoConsulta } from './entities/consulta.entity';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { CreateConsultaAdminDto } from './dto/create-consulta-admin.dto';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Injectable()
export class ConsultasService {
  constructor(
    @InjectRepository(Consulta)
    private consultasRepository: Repository<Consulta>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  
  async findAll(medicoId: string) {
    return await this.consultasRepository.find({
      where: { medicoId },
      relations: ['paciente', 'medico'],
      order: { createdAt: 'DESC' },
    });
  }
  
  async findPendientes(medicoId: string) {
    return await this.consultasRepository.find({
      where: { 
        medicoId, 
        estado: EstadoConsulta.BORRADOR 
      },
      relations: ['paciente'],
      order: { createdAt: 'DESC' },
    });
  }

  async createFromAdmin(createConsultaAdminDto: CreateConsultaAdminDto) {
    const {
      nombrePaciente,
      edadPaciente,
      telefonoPaciente,
      emailPaciente,
      alergias,
      enfermedadesCronicas,
      medicoId,
      motivoConsulta,
      antecedentesClave,
      medicacionActual,
      alertas,
    } = createConsultaAdminDto;
  
    // 1. Buscar o crear paciente
    let paciente = await this.pacientesRepository.findOne({
      where: { nombre: nombrePaciente },
    });
  
    if (!paciente) {
      paciente = this.pacientesRepository.create({
        nombre: nombrePaciente,
        edad: edadPaciente,
        telefono: telefonoPaciente,
        email: emailPaciente,
        alergias: alergias || [],
        enfermedadesCronicas: enfermedadesCronicas || [],
      });
      await this.pacientesRepository.save(paciente);
    }
  
    // 2. Crear consulta pre-cargada
    const consulta = this.consultasRepository.create({
      pacienteId: paciente.id,
      medicoId,
      motivoConsulta,
      antecedentesClave,
      medicacionActual,
      alertas: alertas || [],
      estado: EstadoConsulta.BORRADOR,
    });
  
    return await this.consultasRepository.save(consulta);
  }

  async findOne(id: string, medicoId: string) {
    const consulta = await this.consultasRepository.findOne({
      where: { id, medicoId },
      relations: ['paciente', 'medico'],
    });

    if (!consulta) {
      throw new NotFoundException(`Consulta con ID ${id} no encontrada`);
    }

    return consulta;
  }

  async update(id: string, updateConsultaDto: UpdateConsultaDto, medicoId: string) {
    const consulta = await this.findOne(id, medicoId);
    
    if (consulta.estado === EstadoConsulta.CERRADA) {
      throw new BadRequestException('No se puede modificar una consulta cerrada');
    }

    Object.assign(consulta, updateConsultaDto);
    return await this.consultasRepository.save(consulta);
  }

  async confirmar(id: string, medicoId: string) {
    const consulta = await this.findOne(id, medicoId);
    
    if (consulta.estado !== EstadoConsulta.BORRADOR) {
      throw new BadRequestException('Solo se pueden confirmar consultas en borrador');
    }

    consulta.estado = EstadoConsulta.CONFIRMADA;
    return await this.consultasRepository.save(consulta);
  }

  async cerrar(id: string, medicoId: string) {
    const consulta = await this.findOne(id, medicoId);
    
    if (consulta.estado === EstadoConsulta.CERRADA) {
      throw new BadRequestException('La consulta ya está cerrada');
    }

    consulta.estado = EstadoConsulta.CERRADA;
    return await this.consultasRepository.save(consulta);
  }
}