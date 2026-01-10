import { IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'medico@preventigen.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ example: 'Dr. Juan Pérez' })
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ example: 'Medicina General', required: false })
    @IsOptional()
    especialidad?: string;
}
