import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NovedadesClinicasService } from './novedades-clinicas.service';
import { CreateNovedadDto } from './dto/create-novedad.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Medico } from '../medicos/entities/medico.entity';

@ApiTags('Novedades Clínicas')
@Controller('novedades-clinicas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NovedadesClinicasController {
  constructor(private readonly novedadesService: NovedadesClinicasService) {}

  @Post()
  @ApiOperation({ summary: 'Agregar novedad clínica a un paciente' })
  create(@Body() dto: CreateNovedadDto, @CurrentUser() medico: Medico) {
    return this.novedadesService.create(dto, medico.id);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Listar novedades clínicas de un paciente' })
  findByPaciente(@Param('pacienteId') pacienteId: string, @CurrentUser() medico: Medico) {
    return this.novedadesService.findByPaciente(pacienteId, medico.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar novedad clínica' })
  remove(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.novedadesService.remove(id, medico.id);
  }
}