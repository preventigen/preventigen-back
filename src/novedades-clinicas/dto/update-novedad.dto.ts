import { PartialType } from '@nestjs/swagger';
import { CreateNovedadDto } from './create-novedad.dto';

export class UpdateNovedadDto extends PartialType(CreateNovedadDto) {}