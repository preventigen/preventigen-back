import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medico } from './entities/medico.entity';
import { MedicosService } from './medicos.service';
import { MedicosController } from './medicos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Medico])],
  controllers: [MedicosController],
  providers: [MedicosService],
  exports: [TypeOrmModule],
})
export class MedicosModule {}