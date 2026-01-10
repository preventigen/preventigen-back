import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Consulta } from '../../consultas/entities/consulta.entity';

@Entity('pacientes')
export class Paciente {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    edad: number;

    @Column({ nullable: true })
    telefono: string;

    @Column({ nullable: true })
    email: string;

    @Column('text', { array: true, default: [] })
    alergias: string[];

    @Column('text', { array: true, default: [] })
    enfermedadesCronicas: string[];

    @OneToMany(() => Consulta, consulta => consulta.paciente)
    consultas: Consulta[];

    @CreateDateColumn()
    createdAt: Date;
}