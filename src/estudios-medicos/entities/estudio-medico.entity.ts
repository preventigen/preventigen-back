import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';

@Entity('estudios_medicos')
export class EstudioMedico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pacienteId: string;

  @ManyToOne(() => Paciente, paciente => paciente.estudios)
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column()
  nombreEstudio: string;

  @Column({ type: 'date', nullable: true })
  fecha: Date;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @CreateDateColumn()
  createdAt: Date;
}