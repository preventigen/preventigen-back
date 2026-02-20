import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { Paciente } from '../../pacientes/entities/paciente.entity';
  
  @Entity('previo_ia')
  export class PrevioIA {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Paciente, (paciente) => paciente.previosIA)
    @JoinColumn({ name: 'paciente_id' })
    paciente: Paciente;
  
    @Column({ name: 'paciente_id' })
    pacienteId: string;
  
    // Resumen acumulado de todas las interacciones anteriores
    @Column('text', { name: 'registro_ia' })
    registroIA: string;
  
    @CreateDateColumn({ name: 'fecha_registro' })
    fechaRegistro: Date;
  }