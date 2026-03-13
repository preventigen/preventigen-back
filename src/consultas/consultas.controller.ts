import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultasService } from './consultas.service';
import { CreateConsultaDto } from './dto/create-consulta.dto';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Medico } from '../medicos/entities/medico.entity';

@ApiTags('Consultas')
@Controller('consultas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsultasController {
  constructor(private readonly consultasService: ConsultasService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva consulta' })
  create(@Body() dto: CreateConsultaDto, @CurrentUser() medico: Medico) {
    return this.consultasService.create(dto, medico.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las consultas del médico' })
  findAll(@CurrentUser() medico: Medico) {
    return this.consultasService.findAll(medico.id);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Listar consultas de un paciente' })
  findByPaciente(@Param('pacienteId') pacienteId: string, @CurrentUser() medico: Medico) {
    return this.consultasService.findByPaciente(pacienteId, medico.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver detalle de una consulta' })
  findOne(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.consultasService.findOne(id, medico.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar consulta' })
  update(@Param('id') id: string, @Body() dto: UpdateConsultaDto, @CurrentUser() medico: Medico) {
    return this.consultasService.update(id, dto, medico.id);
  }

  @Post(':id/cerrar')
  @ApiOperation({ summary: 'Cerrar consulta' })
  cerrar(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.consultasService.cerrar(id, medico.id);
  }
}