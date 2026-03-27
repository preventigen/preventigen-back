import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, IsUUID } from "class-validator";

export class SimularTratamientoDto {
  @ApiProperty({ example: 'uuid-del-gemelo' })
  @IsNotEmpty()
  @IsUUID()
  gemeloDigitalId: string;

  @ApiProperty({ example: 'Paciente consulta por cefalea intensa de 3 días de evolución' })
  @IsNotEmpty()
  @IsString()
  motivoConsulta: string;

  @ApiProperty({ example: 'Sumatriptán 50mg VO al inicio del dolor + Propranolol 80mg c/12hs como profilaxis' })
  @IsNotEmpty()
  tratamientoPropuesto: string;

  @ApiProperty({ example: 'Sumatriptán: máximo 200mg/día. Propranolol: 3 meses mínimo', required: false })
  @IsOptional()
  dosisYDuracion?: string;
}