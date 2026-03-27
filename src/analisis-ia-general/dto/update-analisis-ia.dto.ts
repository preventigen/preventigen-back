import { PartialType } from '@nestjs/swagger';
import { CreateAnalisisIADto } from './create-analisis-ia.dto';

export class UpdateAnalisisIADto extends PartialType(CreateAnalisisIADto) {}