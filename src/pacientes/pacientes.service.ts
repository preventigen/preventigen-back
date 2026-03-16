import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Paciente } from './entities/paciente.entity';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { UpdateDatosMedicosDto } from './dto/update-datos-medicos.dto';
import { EstudioMedico } from '../estudios-medicos/entities/estudio-medico.entity';
import { NovedadClinica } from '../novedades-clinicas/entities/novedad-clinica.entity';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
    @InjectRepository(EstudioMedico)
    private estudiosRepository: Repository<EstudioMedico>,
    @InjectRepository(NovedadClinica)
    private novedadesRepository: Repository<NovedadClinica>,
  ) {}

  async create(createPacienteDto: CreatePacienteDto, medicoId: string): Promise<Paciente> {
    const { estudios, novedades, ...datosPaciente } = createPacienteDto;

    // 1. Crear y guardar el paciente
    const paciente = this.pacientesRepository.create({ ...datosPaciente, medicoId });
    const pacienteGuardado = await this.pacientesRepository.save(paciente);

    // 2. Si vienen estudios, guardarlos asociados al paciente
    if (estudios && estudios.length > 0) {
      const estudiosEntidades = estudios.map(e =>
        this.estudiosRepository.create({ ...e, pacienteId: pacienteGuardado.id }),
      );
      await this.estudiosRepository.save(estudiosEntidades);
    }

    // 3. Si vienen novedades, guardarlas asociadas al paciente
   if (novedades && novedades.length > 0) {
    for (const n of novedades) {
      const novedad = this.novedadesRepository.create({
        ...n,
        pacienteId: pacienteGuardado.id,
        gravedad: n.gravedad as any,
      });
      await this.novedadesRepository.save(novedad);
    }
  }

    // 4. Devolver el paciente con todo cargado
    return await this.pacientesRepository.findOne({
      where: { id: pacienteGuardado.id },
      relations: ['estudios', 'novedades'],
    }) ?? pacienteGuardado;
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