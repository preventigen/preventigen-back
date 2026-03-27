import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoPrompt } from '../entities/analisis-ia.entity';

export class CreateAnalisisIADto {
  @ApiProperty({ description: 'ID del paciente a analizar' })
  @IsUUID()
  pacienteId: string;

  @ApiPropertyOptional({ description: 'ID del dato médico específico a analizar (opcional, si no se envía usa todos los datos del paciente)' })
  @IsOptional()
  @IsUUID()
  datoMedicoId?: string;

  @ApiPropertyOptional({
    enum: TipoPrompt,
    description: 'Tipo de prompt: usuario (ingresado por el usuario) o sistema (generado automáticamente)',
    default: TipoPrompt.USUARIO,
  })
  @IsOptional()
  @IsEnum(TipoPrompt)
  tipoPrompt?: TipoPrompt;

  @ApiPropertyOptional({ description: 'Prompt adicional del usuario para orientar el análisis' })
  @IsOptional()
  @IsString()
  promptUsuario?: string;
}