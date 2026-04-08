import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';

export enum TipoContexto {
  NUEVO = 'nuevo',
  ACTUALIZACION = 'actualizacion',
  SIN_CAMBIOS = 'sin_cambios',
}

@Entity('contexto_ia')
export class ContextoIA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ name: 'paciente_id' })
  pacienteId: string;

  @Column('text', { name: 'contenido_contexto' })
  contenidoContexto: string;

  @Column({ type: 'enum', enum: TipoContexto, default: TipoContexto.NUEVO })
  tipo: TipoContexto;

  @UpdateDateColumn({ name: 'ultima_actualizacion' })
  ultimaActualizacion: Date;

  @CreateDateColumn({ name: 'fecha_creacion' })
  fechaCreacion: Date;
}