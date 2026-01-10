import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Medico } from '../medicos/entities/medico.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(Medico)
    private medicosRepository: Repository<Medico>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret-change-in-production',
      ignoreExpiration: false,
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<Medico> {
    const medico = await this.medicosRepository.findOne({
      where: { id: payload.sub, activo: true },
    });

    if (!medico) {
      throw new UnauthorizedException('Token inválido');
    }

    return medico;
  }
}