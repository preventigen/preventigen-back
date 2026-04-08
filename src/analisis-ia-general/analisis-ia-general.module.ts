import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalisisIAService } from './analisis-ia-general.service';
import { AnalisisIAController } from './analisis-ia-general.controller';
import { AnalisisIA } from './entities/analisis-ia.entity';
import { ContextoIA } from './entities/contexto-ia.entity';
import { DatoMedico } from '../datos-medicos/entities/dato-medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Consulta } from '../consultas/entities/consulta.entity';
import { GemelosDigitalesModule } from '../gemelos-digitales/gemelos-digitales.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AnalisisIA, ContextoIA, DatoMedico, Paciente, Consulta]),
    GemelosDigitalesModule,
  ],
  controllers: [AnalisisIAController],
  providers: [AnalisisIAService],
  exports: [AnalisisIAService, TypeOrmModule],
})
export class AnalisisIAModule {}