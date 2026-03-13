import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConsultaDto {
  @ApiProperty()
  @IsUUID()
  pacienteId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  detalles?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tratamientoIndicado?: string;
}