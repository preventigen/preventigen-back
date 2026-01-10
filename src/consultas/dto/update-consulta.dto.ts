import { PartialType } from '@nestjs/swagger';
import { CreateConsultaAdminDto } from './create-consulta-admin.dto';

export class UpdateConsultaDto extends PartialType(CreateConsultaAdminDto) {}