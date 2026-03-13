import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { UpdateDatosMedicosDto } from './dto/update-datos-medicos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Medico } from '../medicos/entities/medico.entity';

@ApiTags('Pacientes')
@Controller('pacientes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo paciente (asociado al médico logueado)' })
  create(@Body() dto: CreatePacienteDto, @CurrentUser() medico: Medico) {
    return this.pacientesService.create(dto, medico.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar pacientes del médico logueado' })
  findAll(@CurrentUser() medico: Medico) {
    return this.pacientesService.findAll(medico.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Ver ficha completa del paciente' })
  findOne(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.pacientesService.findOne(id, medico.id);
  }

  @Patch(':id/datos-personales')
  @ApiOperation({ summary: 'Editar datos personales del paciente' })
  updateDatosPersonales(
    @Param('id') id: string,
    @Body() dto: UpdatePacienteDto,
    @CurrentUser() medico: Medico,
  ) {
    return this.pacientesService.updateDatosPersonales(id, dto, medico.id);
  }

  @Patch(':id/datos-medicos')
  @ApiOperation({ summary: 'Editar datos médicos generales del paciente' })
  updateDatosMedicos(
    @Param('id') id: string,
    @Body() dto: UpdateDatosMedicosDto,
    @CurrentUser() medico: Medico,
  ) {
    return this.pacientesService.updateDatosMedicos(id, dto, medico.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar paciente' })
  remove(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.pacientesService.remove(id, medico.id);
  }
}