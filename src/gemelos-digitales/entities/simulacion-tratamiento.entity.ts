import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { GemeloDigital } from './gemelo-digital.entity';

@Entity('simulaciones_tratamiento')
export class SimulacionTratamiento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => GemeloDigital, gemelo => gemelo.simulaciones)
  @JoinColumn({ name: 'gemelo_digital_id' })
  gemeloDigital: GemeloDigital;

  @Column({ name: 'gemelo_digital_id' })
  gemeloDigitalId: string;

  @Column('text')
  motivoConsulta: string;

  @Column('text')
  tratamientoPropuesto: string;

  @Column('text', { nullable: true })
  dosisYDuracion: string;

  @Column('jsonb')
  analisisIA: {
    efectividadEstimada: number;
    coherenciaClinica: number;
    riesgos: string[];
    beneficios: string[];
    contraindicaciones: string[];
    interaccionesMedicamentosas: string[];
    efectosSecundariosProbables: string[];
    recomendaciones: string[];
    ajustesDosis?: string;
    monitoreoCritico?: string[];
    alternativasSugeridas?: Array<{
      medicamento: string;
      razon: string;
    }>;
  };

  @Column('jsonb')
  prediccionRespuesta: {
    tiempoMejoriaEstimado?: string;
    probabilidadExito: number;
    factoresRiesgo: string[];
    parametrosMonitoreo: string[];
  };

  @Column('text')
  promptEnviado: string;

  @Column('text')
  respuestaCompletaIA: string;

  // Flag si la IA detectó tratamiento no recomendado
  @Column({ default: false })
  noRecomendado: boolean;

  @Column({ default: 'gemini-2.5-flash' })
  modeloIAUtilizado: string;

  @CreateDateColumn()
  createdAt: Date;
}