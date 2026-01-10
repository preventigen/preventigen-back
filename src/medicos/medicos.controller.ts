import { Controller, Get, Body, Patch, Param, Delete, UseGuards, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MedicosService } from './medicos.service';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Medicos')
@Controller('medicos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los médicos' })
  findAll() {
    return this.medicosService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener médico por ID' })
  findOne(@Param('id') id: string) {
    return this.medicosService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtener estadísticas del médico' })
  getStats(@Param('id') id: string) {
    return this.medicosService.getStats(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar médico' })
  update(@Param('id') id: string, @Body() updateMedicoDto: UpdateMedicoDto) {
    return this.medicosService.update(id, updateMedicoDto);
  }

  @Post(':id/toggle-active')
  @ApiOperation({ summary: 'Activar/Desactivar médico' })
  toggleActive(@Param('id') id: string) {
    return this.medicosService.toggleActive(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar médico' })
  remove(@Param('id') id: string) {
    return this.medicosService.remove(id);
  }
}