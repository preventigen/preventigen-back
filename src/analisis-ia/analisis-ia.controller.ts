import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalisisIAService } from './analisis-ia.service';
import { CreateAnalisisIADto } from './dto/create-analisis-ia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Análisis IA')
@Controller('analisis-ia')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalisisIAController {
  constructor(private readonly analisisIAService: AnalisisIAService) {}

  @Post()
  @ApiOperation({
    summary: 'Enviar datos del paciente a la IA para análisis',
    description:
      'Toma los datos del paciente y su información médica, llama a Gemini y guarda el resultado. ' +
      'Si se omite datoMedicoId, se usan todos los datos médicos del paciente.',
  })
  analizar(@Body() createDto: CreateAnalisisIADto) {
    return this.analisisIAService.analizar(createDto);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Obtener historial completo de análisis de un paciente' })
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.analisisIAService.findByPaciente(pacienteId);
  }

  @Get('paciente/:pacienteId/ultimo')
  @ApiOperation({ summary: 'Obtener el último análisis de un paciente' })
  findUltimo(@Param('pacienteId') pacienteId: string) {
    return this.analisisIAService.findUltimo(pacienteId);
  }

  @Get('paciente/:pacienteId/contexto')
  @ApiOperation({ summary: 'Obtener el contexto/memoria acumulado de interacciones previas del paciente' })
  findContexto(@Param('pacienteId') pacienteId: string) {
    return this.analisisIAService.findContexto(pacienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un análisis específico por ID' })
  findOne(@Param('id') id: string) {
    return this.analisisIAService.findOne(id);
  }
}