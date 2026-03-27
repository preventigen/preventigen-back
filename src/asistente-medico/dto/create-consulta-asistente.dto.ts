import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsultaAsistenteDto {
  @ApiProperty({ example: 'uuid-del-paciente' })
  @IsNotEmpty()
  @IsUUID()
  pacienteId: string;

  @ApiProperty({ example: '¿El tratamiento actual es compatible con un posible inicio de metformina?' })
  @IsNotEmpty()
  @IsString()
  consultaMedico: string;
}