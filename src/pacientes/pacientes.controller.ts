import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Pacientes')
@Controller('pacientes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo paciente' })
  create(@Body() createPacienteDto: CreatePacienteDto) {
    return this.pacientesService.create(createPacienteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los pacientes' })
  findAll() {
    return this.pacientesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener paciente por ID' })
  findOne(@Param('id') id: string) {
    return this.pacientesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar paciente' })
  update(@Param('id') id: string, @Body() updatePacienteDto: UpdatePacienteDto) {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar paciente' })
  remove(@Param('id') id: string) {
    return this.pacientesService.remove(id);
  }
}