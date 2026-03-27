import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AsistenteMedicoService } from './asistente-medico.service';
import { CreateConsultaAsistenteDto } from './dto/create-consulta-asistente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Medico } from '../medicos/entities/medico.entity';

@ApiTags('Asistente Médico')
@Controller('asistente-medico')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AsistenteMedicoController {
  constructor(private readonly asistenteMedicoService: AsistenteMedicoService) {}

  @Post()
  @ApiOperation({ summary: 'Realizar una consulta al asistente médico sobre un paciente' })
  consultar(@Body() dto: CreateConsultaAsistenteDto, @CurrentUser() medico: Medico) {
    return this.asistenteMedicoService.consultar(dto, medico.id);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Historial de consultas al asistente para un paciente' })
  findByPaciente(@Param('pacienteId') pacienteId: string, @CurrentUser() medico: Medico) {
    return this.asistenteMedicoService.findByPaciente(pacienteId, medico.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver una consulta específica del asistente' })
  findOne(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.asistenteMedicoService.findOne(id, medico.id);
  }
}