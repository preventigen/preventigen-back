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

    // Tratamiento propuesto
    @Column('text')
    tratamientoPropuesto: string;

    @Column('text', { nullable: true })
    dosisYDuracion: string;

    // Análisis de la IA
    @Column('jsonb')
    analisisIA: {
        efectividadEstimada: number; // 0-100
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

    // Predicción de respuesta
    @Column('jsonb')
    prediccionRespuesta: {
        tiempoMejoriaEstimado?: string;
        probabilidadExito: number; // 0-100
        factoresRiesgo: string[];
        parametrosMonitoreo: string[];
    };

    // Prompt usado y respuesta completa de la IA
    @Column('text')
    promptEnviado: string;

    @Column('text')
    respuestaCompletaIA: string;

    @Column({ default: 'claude-sonnet-4-20250514' })
    modeloIAUtilizado: string;

    @CreateDateColumn()
    createdAt: Date;
}
