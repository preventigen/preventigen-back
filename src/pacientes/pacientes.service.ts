import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './entities/paciente.entity';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { UpdateDatosMedicosDto } from './dto/update-datos-medicos.dto';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  async create(createPacienteDto: CreatePacienteDto, medicoId: string): Promise<Paciente> {
    const paciente = this.pacientesRepository.create({
      ...createPacienteDto,
      medicoId,
    });
    return await this.pacientesRepository.save(paciente);
  }

  async findAll(medicoId: string): Promise<Paciente[]> {
    return await this.pacientesRepository.find({
      where: { medicoId },
      select: ['id', 'nombre', 'apellido', 'fechaNacimiento', 'genero'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, medicoId: string): Promise<Paciente> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id, medicoId },
      relations: ['consultas', 'estudios', 'novedades'],
    });
    if (!paciente) throw new NotFoundException('Paciente no encontrado');
    return paciente;
  }

  async updateDatosPersonales(id: string, dto: UpdatePacienteDto, medicoId: string): Promise<Paciente> {
    const paciente = await this.findOne(id, medicoId);
    Object.assign(paciente, dto);
    return await this.pacientesRepository.save(paciente);
  }

  async updateDatosMedicos(id: string, dto: UpdateDatosMedicosDto, medicoId: string): Promise<Paciente> {
    const paciente = await this.findOne(id, medicoId);
    Object.assign(paciente, dto);
    return await this.pacientesRepository.save(paciente);
  }

  async remove(id: string, medicoId: string): Promise<{ message: string }> {
    const paciente = await this.findOne(id, medicoId);
    await this.pacientesRepository.remove(paciente);
    return { message: 'Paciente eliminado correctamente' };
  }
}