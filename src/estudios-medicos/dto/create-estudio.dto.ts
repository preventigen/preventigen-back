import { IsString, IsOptional, IsDateString, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEstudioDto {
  @ApiProperty()
  @IsUUID()
  pacienteId: string;

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