import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DatosMedicosService } from './datos-medicos.service';
import { CreateDatoMedicoDto } from './dto/create-dato-medico.dto';
import { UpdateDatoMedicoDto } from './dto/update-dato-medico.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Datos Médicos')
@Controller('datos-medicos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DatosMedicosController {
  constructor(private readonly datosMedicosService: DatosMedicosService) {}

  @Post()
  @ApiOperation({ summary: 'Cargar nuevo dato médico para un paciente' })
  create(@Body() createDto: CreateDatoMedicoDto) {
    return this.datosMedicosService.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los datos médicos' })
  findAll() {
    return this.datosMedicosService.findAll();
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Listar datos médicos de un paciente específico' })
  findByPaciente(@Param('pacienteId') pacienteId: string) {
    return this.datosMedicosService.findByPaciente(pacienteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener dato médico por ID' })
  findOne(@Param('id') id: string) {
    return this.datosMedicosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar dato médico' })
  update(@Param('id') id: string, @Body() updateDto: UpdateDatoMedicoDto) {
    return this.datosMedicosService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar dato médico' })
  remove(@Param('id') id: string) {
    return this.datosMedicosService.remove(id);
  }
}