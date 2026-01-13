import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GemelosDigitalesService } from './gemelos-digitales.service';
import { CreateGemeloDto } from './dto/create-gemelo.dto';
import { SimularTratamientoDto } from './dto/simular-tratamiento.dto';
import { ActualizarGemeloDto } from './dto/actualizar-gemelo.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Medico } from '../medicos/entities/medico.entity';

@ApiTags('Gemelos Digitales ECAMM')
@Controller('gemelos-digitales')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GemelosDigitalesController {
  constructor(private readonly gemelosService: GemelosDigitalesService) {}
  
  @Get('modelos-disponibles')
  @ApiOperation({ summary: 'Listar modelos de IA disponibles' })
  listarModelos() {
    return this.gemelosService.listarModelosDisponibles();
  }

  @Post()
  @ApiOperation({ summary: 'Crear gemelo digital de un paciente' })
  create(@Body() createGemeloDto: CreateGemeloDto, @CurrentUser() medico: Medico) {
    return this.gemelosService.create(createGemeloDto, medico.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los gemelos digitales del médico' })
  findAll(@CurrentUser() medico: Medico) {
    return this.gemelosService.findAll(medico.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener gemelo digital específico' })
  findOne(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.gemelosService.findOne(id, medico.id);
  }

  @Get('paciente/:pacienteId')
  @ApiOperation({ summary: 'Obtener gemelo digital de un paciente' })
  findByPaciente(@Param('pacienteId') pacienteId: string, @CurrentUser() medico: Medico) {
    return this.gemelosService.findByPaciente(pacienteId, medico.id);
  }

  @Get(':id/simulaciones')
  @ApiOperation({ summary: 'Ver historial de simulaciones' })
  getSimulaciones(@Param('id') id: string, @CurrentUser() medico: Medico) {
    return this.gemelosService.getSimulaciones(id, medico.id);
  }

  @Post('simular')
  @ApiOperation({ summary: 'Simular tratamiento con IA (ECAMM)' })
  simularTratamiento(@Body() simularDto: SimularTratamientoDto, @CurrentUser() medico: Medico) {
    return this.gemelosService.simularTratamiento(simularDto, medico.id);
  }

  @Patch(':id/actualizar')
  @ApiOperation({ summary: 'Actualizar gemelo con datos de consulta real' })
  actualizarDesdeConsulta(
    @Param('id') id: string,
    @Body() actualizarDto: ActualizarGemeloDto,
    @CurrentUser() medico: Medico,
  ) {
    return this.gemelosService.actualizarDesdeConsulta(id, actualizarDto, medico.id);
  }

}
