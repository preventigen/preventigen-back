import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatoMedico } from './entities/dato-medico.entity';
import { CreateDatoMedicoDto } from './dto/create-dato-medico.dto';
import { UpdateDatoMedicoDto } from './dto/update-dato-medico.dto';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Injectable()
export class DatosMedicosService {
  constructor(
    @InjectRepository(DatoMedico)
    private datosMedicosRepository: Repository<DatoMedico>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
  ) {}

  async create(createDto: CreateDatoMedicoDto): Promise<DatoMedico> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: createDto.pacienteId },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const dato = this.datosMedicosRepository.create(createDto);
    return await this.datosMedicosRepository.save(dato);
  }

  async findAll(): Promise<DatoMedico[]> {
    return await this.datosMedicosRepository.find({
      relations: ['paciente'],
      order: { fechaCarga: 'DESC' },
    });
  }

  async findByPaciente(pacienteId: string): Promise<DatoMedico[]> {
    const paciente = await this.pacientesRepository.findOne({
      where: { id: pacienteId },
    });

    if (!paciente) {
      throw new NotFoundException('Paciente no encontrado');
    }

    return await this.datosMedicosRepository.find({
      where: { pacienteId },
      order: { fechaCarga: 'DESC' },
    });
  }

  async findOne(id: string): Promise<DatoMedico> {
    const dato = await this.datosMedicosRepository.findOne({
      where: { id },
      relations: ['paciente', 'analisis'],
    });

    if (!dato) {
      throw new NotFoundException(`Dato médico con ID ${id} no encontrado`);
    }

    return dato;
  }

  async update(id: string, updateDto: UpdateDatoMedicoDto): Promise<DatoMedico> {
    const dato = await this.findOne(id);
    Object.assign(dato, updateDto);
    return await this.datosMedicosRepository.save(dato);
  }

  async remove(id: string): Promise<{ message: string }> {
    const dato = await this.findOne(id);
    await this.datosMedicosRepository.remove(dato);
    return { message: 'Dato médico eliminado correctamente' };
  }
}