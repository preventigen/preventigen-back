import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Medico } from '../../medicos/entities/medico.entity';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): Medico => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);