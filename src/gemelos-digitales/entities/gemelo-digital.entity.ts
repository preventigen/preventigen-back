import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn, OneToMany } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';
import { SimulacionTratamiento } from './simulacion-tratamiento.entity';

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

    // Datos médicos del gemelo (JSON)
    @Column('jsonb')
    perfilMedico: {
        edad: number;
        sexo: string;
        peso?: number;
        altura?: number;
        alergias: string[];
        enfermedadesCronicas: string[];
        medicacionActual: string[];
        antecedentesQuirurgicos?: string[];
        antecedentesFamiliares?: string[];
        habitosVida?: {
        tabaquismo?: boolean;
        alcohol?: boolean;
        ejercicio?: string;
        dieta?: string;
        };
        signosVitales?: {
        presionArterial?: string;
        frecuenciaCardiaca?: number;
        temperatura?: number;
        saturacionO2?: number;
        };
    };

    // Historial de actualizaciones desde consultas reales
    @Column('jsonb', { default: [] })
    historialActualizaciones: Array<{
        fecha: Date;
        consultaId: string;
        cambios: string;
        datosMedicos: any;
    }>;

    @OneToMany(() => SimulacionTratamiento, simulacion => simulacion.gemeloDigital)
    simulaciones: SimulacionTratamiento[];

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