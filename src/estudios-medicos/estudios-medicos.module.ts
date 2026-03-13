import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstudiosMedicosController } from './estudios-medicos.controller';
import { EstudiosMedicosService } from './estudios-medicos.service';
import { EstudioMedico } from './entities/estudio-medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EstudioMedico, Paciente])],
  controllers: [EstudiosMedicosController],
  providers: [EstudiosMedicosService],
  exports: [EstudiosMedicosService],
})
export class EstudiosMedicosModule {}