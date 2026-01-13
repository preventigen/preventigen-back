import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
        
        // Si no hay roles requeridos, permitir acceso
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        
        // Verificar si el usuario tiene alguno de los roles requeridos
        const hasRole = requiredRoles.some((role) => user.rol === role);
        
        if (!hasRole) {
            throw new ForbiddenException('No tienes permisos para acceder a este recurso');
        }
        
        return true;
    }
}