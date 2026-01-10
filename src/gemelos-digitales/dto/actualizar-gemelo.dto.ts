import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject, IsUUID } from "class-validator";

export class ActualizarGemeloDto {
    @ApiProperty({ example: 'uuid-de-consulta' })
    @IsNotEmpty()
    @IsUUID()
    consultaId: string;

    @ApiProperty({ example: 'Se agregó diagnóstico de ansiedad. TA mejoró a 120/80' })
    @IsNotEmpty()
    cambiosRealizados: string;

    @ApiProperty({
        example: {
            enfermedadesCronicas: ['Migraña crónica', 'Hipertensión', 'Trastorno de ansiedad'],
            medicacionActual: ['Propranolol 40mg', 'Losartán 50mg', 'Sertralina 50mg'],
            signosVitales: { presionArterial: '120/80' },
        },
    })
    @IsObject()
    datosActualizados: any;
    }