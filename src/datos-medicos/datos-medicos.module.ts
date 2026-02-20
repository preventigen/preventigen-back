import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatosMedicosService } from './datos-medicos.service';
import { DatosMedicosController } from './datos-medicos.controller';
import { DatoMedico } from './entities/dato-medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DatoMedico, Paciente])],
  controllers: [DatosMedicosController],
  providers: [DatosMedicosService],
  exports: [DatosMedicosService, TypeOrmModule],
})
export class DatosMedicosModule {}