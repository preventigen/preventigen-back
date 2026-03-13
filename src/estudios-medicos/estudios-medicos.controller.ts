import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EstudiosMedicosService } from './estudios-medicos.service';
import { CreateEstudioDto } from './dto/create-estudio.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Medico } from '../medicos/entities/medico.entity';

@ApiTags('Estudios Médicos')
@Controller('estudios-medicos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EstudiosMedicosController {
  constructor(private readonly estudiosService: EstudiosMedicosService) {}

  @Post()
  @ApiOperation({ summary: 'Agregar estudio médico a un paciente' })
  create(@Body() dto: CreateEstudioDto, @CurrentUser() medico: Medico) {
    return this.estudiosService.create(dto, medico.id);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Listar estudios médicos de un paciente' })
  findByPaciente(@Param('pacienteId') pacienteId: string, @CurrentUser() medico: Medico) {
    return this.estudiosService.findByPaciente(pacienteId, medico.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar estudio médico' })
  remove(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.estudiosService.remove(id, medico.id);
  }
}