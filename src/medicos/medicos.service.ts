import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from './entities/medico.entity';
import { UpdateMedicoDto } from './dto/update-medico.dto';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private medicosRepository: Repository<Medico>,
  ) {}

  async findAll() {
    return await this.medicosRepository.find({
      select: ['id', 'email', 'nombre', 'especialidad', 'activo', 'createdAt'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const medico = await this.medicosRepository.findOne({
      where: { id },
      select: ['id', 'email', 'nombre', 'especialidad', 'activo', 'createdAt'],
    });

    if (!medico) {
      throw new NotFoundException(`Médico con ID ${id} no encontrado`);
    }

    return medico;
  }

  async update(id: string, updateMedicoDto: UpdateMedicoDto) {
    const medico = await this.findOne(id);
    Object.assign(medico, updateMedicoDto);
    return await this.medicosRepository.save(medico);
  }

  async toggleActive(id: string) {
    const medico = await this.findOne(id);
    medico.activo = !medico.activo;
    return await this.medicosRepository.save(medico);
  }

  async remove(id: string) {
    const medico = await this.findOne(id);
    await this.medicosRepository.remove(medico);
    return { message: 'Médico eliminado correctamente' };
  }

  async getStats(id: string) {
    const medico = await this.medicosRepository.findOne({
      where: { id },
      relations: ['consultas'],
    });

    if (!medico) {
      throw new NotFoundException(`Médico con ID ${id} no encontrado`);
    }

    const totalConsultas = medico.consultas?.length || 0;
    const consultasPorEstado = medico.consultas?.reduce(
      (acc, consulta) => {
        acc[consulta.estado] = (acc[consulta.estado] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    ) || {};

    return {
      medico: {
        id: medico.id,
        nombre: medico.nombre,
        especialidad: medico.especialidad,
      },
      estadisticas: {
        totalConsultas,
        consultasPorEstado,
      },
    };
  }
}