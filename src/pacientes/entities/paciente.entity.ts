import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Medico } from '../../medicos/entities/medico.entity';
import { Consulta } from '../../consultas/entities/consulta.entity';
import { EstudioMedico } from '../../estudios-medicos/entities/estudio-medico.entity';
import { NovedadClinica } from '../../novedades-clinicas/entities/novedad-clinica.entity';
import { AnalisisIA } from '../../analisis-ia-general/entities/analisis-ia.entity';
import { ContextoIA } from '../../analisis-ia-general/entities/contexto-ia.entity';
import { DatoMedico } from '../../datos-medicos/entities/dato-medico.entity';

export enum Genero {
  MASCULINO = 'M',
  FEMENINO = 'F',
}

@Entity('pacientes')
export class Paciente {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  medicoId: string;

  @ManyToOne(() => Medico)
  @JoinColumn({ name: 'medicoId' })
  medico: Medico;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column({ type: 'date' })
  fechaNacimiento: Date;

  @Column({ type: 'enum', enum: Genero })
  genero: Genero;

  @Column({ nullable: true })
  diagnosticoPrincipal: string;

  @Column({ nullable: true })
  antecedentesMedicos: string;

  @Column({ nullable: true })
  medicacionActual: string;

  @Column({ nullable: true })
  presionArterial: string;

  @Column({ nullable: true })
  comentarios: string;

  @Column({ nullable: true })
  alergias: string;

  @OneToMany(() => Consulta, consulta => consulta.paciente)
  consultas: Consulta[];

  @OneToMany(() => EstudioMedico, estudio => estudio.paciente)
  estudios: EstudioMedico[];

  @OneToMany(() => NovedadClinica, novedad => novedad.paciente)
  novedades: NovedadClinica[];

  @OneToMany(() => DatoMedico, datoMedico => datoMedico.paciente)
  datosMedicos: DatoMedico[];

  @OneToMany(() => AnalisisIA, analisis => analisis.paciente)
  analisis: AnalisisIA[];

  @OneToMany(() => ContextoIA, contexto => contexto.paciente)
  contextosIA: ContextoIA[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}