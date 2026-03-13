import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGemeloDto {
  @ApiProperty({ example: 'uuid-del-paciente' })
  @IsNotEmpty()
  @IsUUID()
  pacienteId: string;
}