import { IsNotEmpty, IsOptional, IsUUID, IsArray, IsEmail, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConsultaAdminDto {
  // Datos del paciente (si no existe, se crea)
    @ApiProperty({ example: 'María García' })
    @IsNotEmpty()
    nombrePaciente: string;

    @ApiProperty({ example: 35, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    edadPaciente?: number;

    @ApiProperty({ example: '+54 9 11 1234-5678', required: false })
    @IsOptional()
    telefonoPaciente?: string;

    @ApiProperty({ example: 'maria@email.com', required: false })
    @IsOptional()
    @IsEmail()
    emailPaciente?: string;

    @ApiProperty({ example: ['Penicilina'], required: false })
    @IsOptional()
    @IsArray()
    alergias?: string[];

    @ApiProperty({ example: ['Diabetes tipo 2'], required: false })
    @IsOptional()
    @IsArray()
    enfermedadesCronicas?: string[];

    // ID del médico asignado
    @ApiProperty({ example: 'uuid-del-medico' })
    @IsNotEmpty()
    @IsUUID()
    medicoId: string;

    // Datos de la consulta
    @ApiProperty({ example: 'Dolor de cabeza persistente hace 3 días' })
    @IsNotEmpty()
    motivoConsulta: string;

    @ApiProperty({ example: 'Madre con migrañas', required: false })
    @IsOptional()
    antecedentesClave?: string;

    @ApiProperty({ example: 'Ibuprofeno 400mg cada 8hs', required: false })
    @IsOptional()
    medicacionActual?: string;

    @ApiProperty({ example: ['Presión arterial elevada: 145/95'], required: false })
    @IsOptional()
    @IsArray()
    alertas?: string[];
}