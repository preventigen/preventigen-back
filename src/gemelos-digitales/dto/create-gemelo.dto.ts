import { IsNotEmpty, IsUUID, IsOptional, IsObject, IsNumber, IsString, IsArray, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGemeloDto {
    @ApiProperty({ example: 'uuid-del-paciente' })
    @IsNotEmpty()
    @IsUUID()
    pacienteId: string;

    @ApiProperty({
        example: {
        edad: 35,
        sexo: 'femenino',
        peso: 65,
        altura: 165,
        alergias: ['Penicilina'],
        enfermedadesCronicas: ['Migraña crónica', 'Hipertensión'],
        medicacionActual: ['Propranolol 40mg c/12hs', 'Losartán 50mg/día'],
        antecedentesQuirurgicos: ['Apendicectomía 2015'],
        antecedentesFamiliares: ['Madre: migrañas', 'Padre: diabetes tipo 2'],
        habitosVida: {
            tabaquismo: false,
            alcohol: 'ocasional',
            ejercicio: '3 veces/semana',
            dieta: 'balanceada',
        },
        signosVitales: {
            presionArterial: '130/85',
            frecuenciaCardiaca: 72,
            temperatura: 36.5,
            saturacionO2: 98,
        },
        },
    })
    @IsObject()
    perfilMedico: any;
}