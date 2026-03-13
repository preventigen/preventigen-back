import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Genero } from '../entities/paciente.entity';

export class UpdatePacienteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  apellido?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiPropertyOptional({ enum: Genero })
  @IsOptional()
  @IsEnum(Genero)
  genero?: Genero;
}