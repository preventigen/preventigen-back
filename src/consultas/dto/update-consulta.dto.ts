import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateConsultaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detalles?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tratamientoIndicado?: string;
}