import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstudioMedico } from './entities/estudio-medico.entity';
import { CreateEstudioDto } from './dto/create-estudio.dto';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Injectable()
export class EstudiosMedicosService {
  constructor(
    @InjectRepository(EstudioMedico)
    private estudiosRepository: Repository<EstudioMedico>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  async create(dto: CreateEstudioDto, medicoId: string): Promise<EstudioMedico> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: dto.pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    const estudio = this.estudiosRepository.create(dto);
    return await this.estudiosRepository.save(estudio);
  }

  async findByPaciente(pacienteId: string, medicoId: string): Promise<EstudioMedico[]> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId, medicoId },
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');

    return await this.estudiosRepository.find({
      where: { pacienteId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, medicoId: string): Promise<{ message: string }> {
    const estudio = await this.estudiosRepository.findOne({
      where: { id },
      relations: ['paciente'],
    });
    if (!estudio) throw new NotFoundException('Estudio no encontrado');
    if (estudio.paciente.medicoId !== medicoId) throw new NotFoundException('Estudio no encontrado');

    await this.estudiosRepository.remove(estudio);
    return { message: 'Estudio eliminado correctamente' };
  }
}