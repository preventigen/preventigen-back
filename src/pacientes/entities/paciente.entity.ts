import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    OneToMany,
  } from 'typeorm';
  import { Consulta } from '../../consultas/entities/consulta.entity';
  import { DatoMedico } from '../../datos-medicos/entities/dato-medico.entity';
  import { AnalisisIA } from '../../analisis-ia/entities/analisis-ia.entity';
  import { PrevioIA } from '../../analisis-ia/entities/previo-ia.entity';
  
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
  
    // Relación con consultas (módulo anterior, se mantiene)
    @OneToMany(() => Consulta, (consulta) => consulta.paciente)
    consultas: Consulta[];
  
    // ─── Nuevas relaciones ─────────────────────────────────────────────────────
  
    @OneToMany(() => DatoMedico, (dato) => dato.paciente)
    datosMedicos: DatoMedico[];
  
    @OneToMany(() => AnalisisIA, (analisis) => analisis.paciente)
    analisis: AnalisisIA[];
  
    @OneToMany(() => PrevioIA, (previo) => previo.paciente)
    previosIA: PrevioIA[];
  
    @CreateDateColumn()
    createdAt: Date;
  }