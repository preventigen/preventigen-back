import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalisisIAService } from './analisis-ia.service';
import { CreateAnalisisIADto } from './dto/create-analisis-ia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Medico } from '../medicos/entities/medico.entity';

@ApiTags('Análisis IA')
@Controller('analisis-ia')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalisisIAController {
  constructor(private readonly analisisIAService: AnalisisIAService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar datos del paciente a la IA para análisis' })
  analizar(@Body() createDto: CreateAnalisisIADto, @CurrentUser() medico: Medico) {
    return this.analisisIAService.analizar(createDto, medico.id);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Obtener historial completo de análisis de un paciente' })
  findByPaciente(@Param('pacienteId') pacienteId: string, @CurrentUser() medico: Medico) {
    return this.analisisIAService.findByPaciente(pacienteId, medico.id);
  }

  @Get('paciente/:pacienteId/ultimo')
  @ApiOperation({ summary: 'Obtener el último análisis de un paciente' })
  findUltimo(@Param('pacienteId') pacienteId: string, @CurrentUser() medico: Medico) {
    return this.analisisIAService.findUltimo(pacienteId, medico.id);
  }

  @Get('paciente/:pacienteId/contexto')
  @ApiOperation({ summary: 'Obtener el contexto acumulado de interacciones previas' })
  findContexto(@Param('pacienteId') pacienteId: string, @CurrentUser() medico: Medico) {
    return this.analisisIAService.findContexto(pacienteId, medico.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un análisis específico por ID' })
  findOne(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.analisisIAService.findOne(id, medico.id);
  }
}