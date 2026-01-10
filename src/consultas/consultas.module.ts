import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultasService } from './consultas.service';
import { ConsultasController } from './consultas.controller';
import { Consulta } from './entities/consulta.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consulta, Paciente])],
  controllers: [ConsultasController],
  providers: [ConsultasService],
})
export class ConsultasModule {}