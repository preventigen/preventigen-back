import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Consulta } from '../../consultas/entities/consulta.entity';

@Entity('medicos')
export class Medico {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  especialidad: string;

  @Column({ default: true })
  activo: boolean;

  @OneToMany(() => Consulta, consulta => consulta.medico)
  consultas: Consulta[];

  @CreateDateColumn()
  createdAt: Date;
}
