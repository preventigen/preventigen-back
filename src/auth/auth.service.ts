import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Medico } from '../medicos/entities/medico.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Medico)
    private medicosRepository: Repository<Medico>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, nombre, especialidad } = registerDto;

    const existingMedico = await this.medicosRepository.findOne({ where: { email } });
    if (existingMedico) {
      throw new ConflictException('El email ya está registrado');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const medico = this.medicosRepository.create({
      email,
      passwordHash,
      nombre,
      especialidad,
    });

    await this.medicosRepository.save(medico);

    const { passwordHash: _, ...result } = medico;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const medico = await this.medicosRepository.findOne({ where: { email } });
    if (!medico) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, medico.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (!medico.activo) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    const payload = { sub: medico.id, email: medico.email };
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      medico: {
        id: medico.id,
        email: medico.email,
        nombre: medico.nombre,
        especialidad: medico.especialidad,
      },
    };
  }

  async getProfile(medicoId: string) {
    const medico = await this.medicosRepository.findOne({ where: { id: medicoId } });
    
    if (!medico) {
      throw new NotFoundException('Médico no encontrado');
    }
    
    const { passwordHash, ...result } = medico;
    return result;
  }
}