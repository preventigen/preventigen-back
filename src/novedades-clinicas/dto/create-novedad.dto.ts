import { IsString, IsOptional, IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gravedad } from '../entities/novedad-clinica.entity';

export class CreateNovedadDto {
  @ApiProperty()
  @IsUUID()
  pacienteId: string;

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

  @ApiPropertyOptional({ enum: Gravedad })
  @IsOptional()
  @IsEnum(Gravedad)
  gravedad?: Gravedad;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}