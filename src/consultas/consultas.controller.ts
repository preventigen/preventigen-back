import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConsultasService } from './consultas.service';
import { UpdateConsultaDto } from './dto/update-consulta.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Medico } from '../medicos/entities/medico.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Consulta } from './entities/consulta.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { CreateConsultaAdminDto } from './dto/create-consulta-admin.dto';

@ApiTags('Consultas')
@Controller('consultas')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ConsultasController {
  constructor(
    private readonly consultasService: ConsultasService
  ) {}

  @Post('admin/create')
  @ApiOperation({ summary: 'Crear consulta pre-cargada (recepción)' })
  createFromAdmin(@Body() createConsultaAdminDto: CreateConsultaAdminDto) {
    return this.consultasService.createFromAdmin(createConsultaAdminDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las consultas del médico' })
  findAll(@CurrentUser() medico: Medico) {
    return this.consultasService.findAll(medico.id);
  }

  @Get('pendientes')
  @ApiOperation({ summary: 'Listar consultas pendientes (borradores)' })
  findPendientes(@CurrentUser() medico: Medico) {
    return this.consultasService.findPendientes(medico.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener consulta por ID' })
  findOne(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.consultasService.findOne(id, medico.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar consulta' })
  update(
    @Param('id') id: string,
    @Body() updateConsultaDto: UpdateConsultaDto,
    @CurrentUser() medico: Medico,
  ) {
    return this.consultasService.update(id, updateConsultaDto, medico.id);
  }

  @Post(':id/confirmar')
  @ApiOperation({ summary: 'Confirmar consulta' })
  confirmar(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.consultasService.confirmar(id, medico.id);
  }

  @Post(':id/cerrar')
  @ApiOperation({ summary: 'Cerrar consulta' })
  cerrar(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.consultasService.cerrar(id, medico.id);
  }
}