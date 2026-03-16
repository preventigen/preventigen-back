import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { Paciente } from './entities/paciente.entity';
import { EstudioMedico } from '../estudios-medicos/entities/estudio-medico.entity';
import { NovedadClinica } from '../novedades-clinicas/entities/novedad-clinica.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Paciente, EstudioMedico, NovedadClinica])],
  controllers: [PacientesController],
  providers: [PacientesService],
})
export class PacientesModule {}