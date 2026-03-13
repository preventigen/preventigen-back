import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateDatosMedicosDto {
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