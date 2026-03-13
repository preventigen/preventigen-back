import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';

export enum Gravedad {
  LEVE = 'leve',
  MODERADA = 'moderada',
  GRAVE = 'grave',
}

@Entity('novedades_clinicas')
export class NovedadClinica {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pacienteId: string;

  @ManyToOne(() => Paciente, paciente => paciente.novedades)
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column({ nullable: true })
  tipoEvento: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ nullable: true })
  zonaAfectada: string;

  @Column({ type: 'enum', enum: Gravedad, nullable: true })
  gravedad: Gravedad;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;
}