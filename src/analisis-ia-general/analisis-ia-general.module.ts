import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalisisIAService } from './analisis-ia-general.service';
import { AnalisisIAController } from './analisis-ia-general.controller';
import { AnalisisIA } from './entities/analisis-ia.entity';
import { PrevioIA } from './entities/previo-ia.entity';
import { DatoMedico } from '../datos-medicos/entities/dato-medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { GemelosDigitalesModule } from '../gemelos-digitales/gemelos-digitales.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalisisIA, PrevioIA, DatoMedico, Paciente]),
    GemelosDigitalesModule, // provee GemeloDigitalRepository via TypeOrmModule exportado
  ],
  controllers: [AnalisisIAController],
  providers: [AnalisisIAService],
  exports: [AnalisisIAService],
})
export class AnalisisIAModule {}