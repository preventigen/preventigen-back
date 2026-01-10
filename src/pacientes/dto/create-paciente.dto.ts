import { IsNotEmpty, IsOptional, IsEmail, IsInt, Min, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePacienteDto {
    @ApiProperty({ example: 'María García' })
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 35, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    edad?: number;

    @ApiProperty({ example: '+54 9 11 1234-5678', required: false })
    @IsOptional()
    telefono?: string;

    @ApiProperty({ example: 'maria@email.com', required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ example: ['Penicilina', 'Maní'], required: false })
    @IsOptional()
    @IsArray()
    alergias?: string[];

    @ApiProperty({ example: ['Diabetes tipo 2', 'Hipertensión'], required: false })
    @IsOptional()
    @IsArray()
    enfermedadesCronicas?: string[];
}
