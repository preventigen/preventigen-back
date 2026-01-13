import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsUUID } from "class-validator";

export class ActualizarGemeloDto {
    @ApiProperty({ example: 'uuid-de-consulta' })
    @IsNotEmpty()
    @IsUUID()
    consultaId: string;

    @ApiProperty({ example: 'Se inició tratamiento con Sumatriptán + Propranolol. Paciente toleró bien primera dosis. TA en control: 128/82' })
    @IsNotEmpty()
    cambiosRealizados: string;

    @ApiProperty({
        example: {
            enfermedadesCronicas: ['Migraña crónica', 'Hipertensión', 'Trastorno de ansiedad'],
            medicacionActual: ['Propranolol 40mg c/12hs', 'Losartán 50mg/día', 'Sumatriptán 50mg PRN'],
            signosVitales: { presionArterial: '128/82' },
        },
    })
    @IsObject()
    datosActualizados: any;
    }