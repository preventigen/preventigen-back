import { PartialType } from '@nestjs/swagger';
import { CreateEstudioDto } from './create-estudio.dto';

export class UpdateEstudioDto extends PartialType(CreateEstudioDto) {}