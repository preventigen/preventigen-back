import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './entities/paciente.entity';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  async create(createPacienteDto: CreatePacienteDto) {
    const paciente = this.pacientesRepository.create(createPacienteDto);
    return await this.pacientesRepository.save(paciente);
  }

  async findAll() {
    return await this.pacientesRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const paciente = await this.pacientesRepository.findOne({
      where: { id },
      relations: ['consultas'],
    });

    if (!paciente) {
      throw new NotFoundException(`Paciente con ID ${id} no encontrado`);
    }

    return paciente;
  }

  async update(id: string, updatePacienteDto: UpdatePacienteDto) {
    const paciente = await this.findOne(id);
    Object.assign(paciente, updatePacienteDto);
    return await this.pacientesRepository.save(paciente);
  }

  async remove(id: string) {
    const paciente = await this.findOne(id);
    await this.pacientesRepository.remove(paciente);
    return { message: 'Paciente eliminado correctamente' };
  }
}