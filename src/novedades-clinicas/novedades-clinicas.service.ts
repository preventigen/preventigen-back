import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NovedadClinica } from './entities/novedad-clinica.entity';
import { CreateNovedadDto } from './dto/create-novedad.dto';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Injectable()
export class NovedadesClinicasService {
  constructor(
    @InjectRepository(NovedadClinica)
    private novedadesRepository: Repository<NovedadClinica>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  async create(dto: CreateNovedadDto, medicoId: string): Promise<NovedadClinica> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: dto.pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    const novedad = this.novedadesRepository.create(dto);
    return await this.novedadesRepository.save(novedad);
  }

  async findByPaciente(pacienteId: string, medicoId: string): Promise<NovedadClinica[]> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    return await this.novedadesRepository.find({
      where: { pacienteId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, medicoId: string): Promise<{ message: string }> {
    const novedad = await this.novedadesRepository.findOne({
      where: { id },
      relations: ['paciente'],
    });
    if (!novedad) throw new NotFoundException('Novedad no encontrada');
    if (novedad.paciente.medicoId !== medicoId) throw new NotFoundException('Novedad no encontrada');

    await this.novedadesRepository.remove(novedad);
    return { message: 'Novedad eliminada correctamente' };
  }
}