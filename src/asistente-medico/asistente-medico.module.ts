import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenteMedicoController } from './asistente-medico.controller';
import { AsistenteMedicoService } from './asistente-medico.service';
import { ConsultaAsistente } from './entities/consulta-asistente.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConsultaAsistente, Paciente])],
  controllers: [AsistenteMedicoController],
  providers: [AsistenteMedicoService],
  exports: [AsistenteMedicoService],
})
export class AsistenteMedicoModule {}