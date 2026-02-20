import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { DatoMedico } from '../../datos-medicos/entities/dato-medico.entity';
import { GemeloDigital } from '../../gemelos-digitales/entities/gemelo-digital.entity';

export enum TipoPrompt {
  USUARIO = 'usuario',
  SISTEMA = 'sistema',
}

@Entity('analisis_ia')
export class AnalisisIA {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Paciente, (paciente) => paciente.analisis)
  @JoinColumn({ name: 'paciente_id' })
  paciente: Paciente;

  @Column({ name: 'paciente_id' })
  pacienteId: string;

  @ManyToOne(() => DatoMedico, (dato) => dato.analisis, { nullable: true })
  @JoinColumn({ name: 'dato_medico_id' })
  datoMedico: DatoMedico;

  @Column({ name: 'dato_medico_id', nullable: true })
  datoMedicoId?: string;

  // Relación con el gemelo digital (se asigna automáticamente si el paciente lo tiene)
  @ManyToOne(() => GemeloDigital, (gemelo) => gemelo.analisisIA, { nullable: true })
  @JoinColumn({ name: 'gemelo_digital_id' })
  gemeloDigital: GemeloDigital;

  @Column({ name: 'gemelo_digital_id', nullable: true })
  gemeloDigitalId?: string;

  @Column({
    type: 'enum',
    enum: TipoPrompt,
    default: TipoPrompt.USUARIO,
    name: 'tipo_prompt',
  })
  tipoPrompt: TipoPrompt;

  @Column('text')
  prompt: string;

  @Column('text', { name: 'respuesta_ia' })
  respuestaIA: string;

  // Resumen corto para usar como contexto en próximas interacciones
  @Column('text', { name: 'resumen_contexto', nullable: true })
  resumenContexto?: string;

  @CreateDateColumn({ name: 'fecha_generacion' })
  fechaGeneracion: Date;
}