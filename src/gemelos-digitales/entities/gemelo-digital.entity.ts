import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToMany,
  } from 'typeorm';
  import { Paciente } from '../../pacientes/entities/paciente.entity';
  import { Medico } from '../../medicos/entities/medico.entity';
  import { SimulacionTratamiento } from './simulacion-tratamiento.entity';
  import { AnalisisIA } from '../../analisis-ia/entities/analisis-ia.entity';
  
  export enum EstadoGemelo {
    ACTIVO = 'activo',
    DESACTUALIZADO = 'desactualizado',
    ACTUALIZADO = 'actualizado',
  }
  
  @Entity('gemelos_digitales')
  export class GemeloDigital {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => Paciente)
    @JoinColumn({ name: 'paciente_id' })
    paciente: Paciente;
  
    @Column({ name: 'paciente_id' })
    pacienteId: string;
  
    @ManyToOne(() => Medico)
    @JoinColumn({ name: 'medico_id' })
    medico: Medico;
  
    @Column({ name: 'medico_id' })
    medicoId: string;
  
    @Column('jsonb', { default: [] })
    historialActualizaciones: Array<{
      fecha: Date;
      consultaId?: string;
      datoMedicoId?: string;
      cambios: string;
      datosMedicos: any;
    }>;
  
    // Simulaciones de tratamiento (flujo ECAMM, sin cambios)
    @OneToMany(() => SimulacionTratamiento, (simulacion) => simulacion.gemeloDigital)
    simulaciones: SimulacionTratamiento[];
  
    // Análisis IA del flujo PREVENTIGEN simple (visibles desde el gemelo)
    @OneToMany(() => AnalisisIA, (analisis) => analisis.gemeloDigital)
    analisisIA: AnalisisIA[];
  
    @Column({
      type: 'enum',
      enum: EstadoGemelo,
      default: EstadoGemelo.ACTUALIZADO,
    })
    estado: EstadoGemelo;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }