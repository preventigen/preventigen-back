import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoDatoMedico } from '../entities/dato-medico.entity';

export class CreateDatoMedicoDto {
  @ApiProperty({ description: 'ID del paciente al que pertenece el dato médico' })
  @IsUUID()
  pacienteId: string;

  @ApiProperty({ description: 'Contenido del dato médico en texto libre' })
  @IsString()
  contenido: string;

  @ApiPropertyOptional({
    enum: TipoDatoMedico,
    description: 'Tipo de dato médico',
    default: TipoDatoMedico.OTRO,
  })
  @IsOptional()
  @IsEnum(TipoDatoMedico)
  tipo?: TipoDatoMedico;
}