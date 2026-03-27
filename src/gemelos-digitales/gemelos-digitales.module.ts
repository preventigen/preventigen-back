import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GemelosDigitalesService } from './gemelos-digitales.service';
import { GemelosDigitalesController } from './gemelos-digitales.controller';
import { GemeloDigital } from './entities/gemelo-digital.entity';
import { SimulacionTratamiento } from './entities/simulacion-tratamiento.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Consulta } from '../consultas/entities/consulta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GemeloDigital, SimulacionTratamiento, Paciente, Consulta])],
  controllers: [GemelosDigitalesController],
  providers: [GemelosDigitalesService],
  exports: [TypeOrmModule],
})
export class GemelosDigitalesModule {}