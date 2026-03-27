import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';

@Entity('consultas_asistente')
export class ConsultaAsistente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  pacienteId: string;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: 'pacienteId' })
  paciente: Paciente;

  @Column()
  medicoId: string;

  @ManyToOne(() => Medico)
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @Column('text')
  consultaMedico: string;

  @Column('text')
  promptEnviado: string;

  @Column('text')
  respuestaIA: string;

  @Column({ default: 'gemini-2.5-flash' })
  modeloIAUtilizado: string;

  @CreateDateColumn()
  createdAt: Date;
}