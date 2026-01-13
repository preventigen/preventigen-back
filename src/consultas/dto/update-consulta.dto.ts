// dto/update-consulta.dto.ts
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConsultaDto {
    @ApiProperty({ 
        example: 'Paciente refiere dolor pulsátil en región temporal derecha, intensidad 8/10. Fotofobia y fonofobia presentes. No náuseas ni vómitos. Examen físico: TA 145/95, FC 78 lpm. Sin signos neurológicos focales. Fondo de ojo normal.',
        required: false 
    })
    @IsOptional()
    notasMedico?: string;

    @ApiProperty({ 
        example: 'Diagnóstico: Migraña con aura. Plan: 1) Iniciar Sumatriptán 50mg VO PRN (máx 200mg/día). 2) Propranolol 40mg c/12hs por 1 semana, luego 80mg c/12hs. 3) Solicitar TAC cerebral simple. 4) Diario de cefaleas. 5) Control en 2 semanas. 6) Derivar a neurología si no mejora.',
        required: false 
    })
    @IsOptional()
    recomendacion?: string;
}