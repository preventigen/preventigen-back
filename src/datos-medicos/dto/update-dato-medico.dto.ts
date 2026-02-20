import { PartialType } from '@nestjs/swagger';
import { CreateDatoMedicoDto } from './create-dato-medico.dto';

export class UpdateDatoMedicoDto extends PartialType(CreateDatoMedicoDto) {}