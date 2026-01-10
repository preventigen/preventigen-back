import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
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

    @ManyToOne(() => Paciente, paciente => paciente.consultas)
    @JoinColumn({ name: 'paciente_id' })
    paciente: Paciente;

    @Column({ name: 'paciente_id' })
    pacienteId: string;

    @ManyToOne(() => Medico, medico => medico.consultas)
    @JoinColumn({ name: 'medico_id' })
    medico: Medico;

    @Column({ name: 'medico_id' })
    medicoId: string;

    @Column('text')
    motivoConsulta: string;

    @Column('text', { nullable: true })
    antecedentesClave: string;

    @Column('text', { nullable: true })
    medicacionActual: string;

    @Column('text', { array: true, default: [] })
    alertas: string[];

    @Column('text', { nullable: true })
    notasMedico: string;

    @Column('text', { nullable: true })
    recomendacion: string;

    @Column({
        type: 'enum',
        enum: EstadoConsulta,
        default: EstadoConsulta.BORRADOR,
    })
    estado: EstadoConsulta;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
