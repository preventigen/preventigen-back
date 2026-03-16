import { IsString, IsEnum, IsOptional, IsDateString, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Genero } from '../entities/paciente.entity';

export class CreateEstudioEnPacienteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombreEstudio: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CreateNovedadEnPacienteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipoEvento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  zonaAfectada?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gravedad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CreatePacienteDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  apellido: string;

  @ApiProperty()
  @IsDateString()
  fechaNacimiento: string;

  @ApiProperty({ enum: Genero })
  @IsEnum(Genero)
  genero: Genero;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  diagnosticoPrincipal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  antecedentesMedicos?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  medicacionActual?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  presionArterial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comentarios?: string;

  @ApiPropertyOptional({ type: [CreateEstudioEnPacienteDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEstudioEnPacienteDto)
  estudios?: CreateEstudioEnPacienteDto[];

  @ApiPropertyOptional({ type: [CreateNovedadEnPacienteDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateNovedadEnPacienteDto)
  novedades?: CreateNovedadEnPacienteDto[];
}