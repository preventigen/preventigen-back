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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Medico } from '../medicos/entities/medico.entity';

@ApiTags('Datos Médicos')
@Controller('datos-medicos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DatosMedicosController {
  constructor(private readonly datosMedicosService: DatosMedicosService) {}

  @Post()
  @ApiOperation({ summary: 'Cargar nuevo dato médico para un paciente' })
  create(@Body() createDto: CreateDatoMedicoDto, @CurrentUser() medico: Medico) {
    return this.datosMedicosService.create(createDto, medico.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los datos médicos del médico logueado' })
  findAll(@CurrentUser() medico: Medico) {
    return this.datosMedicosService.findAll(medico.id);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Listar datos médicos de un paciente específico' })
  findByPaciente(@Param('pacienteId') pacienteId: string, @CurrentUser() medico: Medico) {
    return this.datosMedicosService.findByPaciente(pacienteId, medico.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener dato médico por ID' })
  findOne(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.datosMedicosService.findOne(id, medico.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar dato médico' })
  update(@Param('id') id: string, @Body() updateDto: UpdateDatoMedicoDto, @CurrentUser() medico: Medico) {
    return this.datosMedicosService.update(id, updateDto, medico.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar dato médico' })
  remove(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.datosMedicosService.remove(id, medico.id);
  }
}