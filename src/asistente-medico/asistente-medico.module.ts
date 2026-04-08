import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsistenteMedicoController } from './asistente-medico.controller';
import { AsistenteMedicoService } from './asistente-medico.service';
import { ConsultaAsistente } from './entities/consulta-asistente.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Consulta } from '../consultas/entities/consulta.entity';
import { ContextoIA } from '../analisis-ia-general/entities/contexto-ia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConsultaAsistente, Paciente, Consulta, ContextoIA])],
  controllers: [AsistenteMedicoController],
  providers: [AsistenteMedicoService],
  exports: [AsistenteMedicoService],
})
export class AsistenteMedicoModule {}