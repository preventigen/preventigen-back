import { PartialType } from '@nestjs/swagger';
import { CreateAnalisisIaDto } from './create-analisis-ia.dto';

export class UpdateAnalisisIaDto extends PartialType(CreateAnalisisIaDto) {}
