import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consulta, EstadoConsulta } from './entities/consulta.entity';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Injectable()
export class ConsultasService {
  constructor(
    @InjectRepository(Consulta)
    private consultasRepository: Repository<Consulta>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  async create(dto: CreateConsultaDto, medicoId: string): Promise<Consulta> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: dto.pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    const consulta = this.consultasRepository.create({ ...dto, medicoId });
    return await this.consultasRepository.save(consulta);
  }

  async findAll(medicoId: string): Promise<Consulta[]> {
    return await this.consultasRepository.find({
      where: { medicoId },
      relations: ['paciente'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPaciente(pacienteId: string, medicoId: string): Promise<Consulta[]> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    return await this.consultasRepository.find({
      where: { pacienteId, medicoId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, medicoId: string): Promise<Consulta> {
    const consulta = await this.consultasRepository.findOne({
      where: { id, medicoId },
      relations: ['paciente'],
    });
    if (!consulta) throw new NotFoundException('Consulta no encontrada');
    return consulta;
  }

  async update(id: string, dto: UpdateConsultaDto, medicoId: string): Promise<Consulta> {
    const consulta = await this.findOne(id, medicoId);
    if (consulta.estado === EstadoConsulta.CERRADA)
      throw new BadRequestException('No se puede modificar una consulta cerrada');
    Object.assign(consulta, dto);
    return await this.consultasRepository.save(consulta);
  }

  async cerrar(id: string, medicoId: string): Promise<Consulta> {
    const consulta = await this.findOne(id, medicoId);
    if (consulta.estado === EstadoConsulta.CERRADA)
      throw new BadRequestException('La consulta ya está cerrada');
    consulta.estado = EstadoConsulta.CERRADA;
    return await this.consultasRepository.save(consulta);
  }
}