import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalisisIAService } from './analisis-ia.service';
import { AnalisisIAController } from './analisis-ia.controller';
import { AnalisisIA } from './entities/analisis-ia.entity';
import { PrevioIA } from './entities/previo-ia.entity';
import { DatoMedico } from '../datos-medicos/entities/dato-medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AnalisisIA, PrevioIA, DatoMedico, Paciente])],
  controllers: [AnalisisIAController],
  providers: [AnalisisIAService],
  exports: [AnalisisIAService],
})
export class AnalisisIAModule {}