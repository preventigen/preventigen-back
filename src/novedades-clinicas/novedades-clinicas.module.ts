import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NovedadesClinicasController } from './novedades-clinicas.controller';
import { NovedadesClinicasService } from './novedades-clinicas.service';
import { NovedadClinica } from './entities/novedad-clinica.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NovedadClinica, Paciente])],
  controllers: [NovedadesClinicasController],
  providers: [NovedadesClinicasService],
  exports: [NovedadesClinicasService],
})
export class NovedadesClinicasModule {}