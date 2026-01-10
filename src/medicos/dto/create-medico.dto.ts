import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMedicoDto {
    @ApiProperty({ example: 'Dr. Juan Pérez Actualizado', required: false })
    @IsOptional()
    @IsString()
    nombre?: string;

    @ApiProperty({ example: 'Cardiología', required: false })
    @IsOptional()
    @IsString()
    especialidad?: string;

    @ApiProperty({ example: true, required: false })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}