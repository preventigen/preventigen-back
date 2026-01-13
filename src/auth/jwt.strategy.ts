import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Medico } from '../medicos/entities/medico.entity';
import { Admin } from '../auth/entities/admin.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Medico)
    private medicosRepository: Repository<Medico>,
    @InjectRepository(Admin)
    private adminsRepository: Repository<Admin>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production',
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string; email: string; rol?: string }) {
    // Si el payload tiene rol 'admin', buscar en admins
    if (payload.rol === 'admin') {
      const admin = await this.adminsRepository.findOne({
        where: { id: payload.sub, activo: true },
      });

      if (!admin) {
        throw new UnauthorizedException('Token inválido');
      }

      // Retornar admin con su rol
      return {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
        rol: 'admin'
      };
    }

    // Si no tiene rol, es un médico
    const medico = await this.medicosRepository.findOne({
      where: { id: payload.sub, activo: true },
    });

    if (!medico) {
      throw new UnauthorizedException('Token inválido');
    }

    // Retornar médico (sin rol)
    return medico;
  }
}