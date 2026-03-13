import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';

export enum EstadoConsulta {
  BORRADOR = 'borrador',
  CONFIRMADA = 'confirmada',
  CERRADA = 'cerrada',
}

@Entity('consultas')
export class Consulta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pacienteId: string;

  @ManyToOne(() => Paciente, paciente => paciente.consultas)
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column()
  medicoId: string;

  @ManyToOne(() => Medico, medico => medico.consultas)
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @Column({ type: 'text', nullable: true })
  detalles: string;

  @Column({ type: 'text', nullable: true })
  tratamientoIndicado: string;

  @Column({ type: 'enum', enum: EstadoConsulta, default: EstadoConsulta.BORRADOR })
  estado: EstadoConsulta;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}