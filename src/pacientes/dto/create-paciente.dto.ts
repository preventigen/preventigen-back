import { IsString, IsEnum, IsOptional, IsDateString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Genero } from '../entities/paciente.entity';

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
}