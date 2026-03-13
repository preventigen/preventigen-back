import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    JoinColumn,
  } from 'typeorm';
  import { Paciente } from '../../pacientes/entities/paciente.entity';
  import { AnalisisIA } from '../../analisis-ia/entities/analisis-ia.entity';
  
  export enum TipoDatoMedico {
    ANTECEDENTE = 'antecedente',
    DIAGNOSTICO = 'diagnostico',
    MEDICACION = 'medicacion',
    ESTUDIO = 'estudio',
    EVOLUCION = 'evolucion',
    OTRO = 'otro',
  }
  
  @Entity('datos_medicos')
  export class DatoMedico {
        @PrimaryGeneratedColumn('uuid')
        id: string;
    
        @ManyToOne(() => Paciente, (paciente) => paciente.datosMedicos)
        @JoinColumn({ name: 'paciente_id' })
        paciente: Paciente;
    
        @Column({ name: 'paciente_id' })
        pacienteId: string;

        @Column({ name: 'medico_id' })
        medicoId: string;
    
        @Column('text')
        contenido: string;
    
        @Column({
        type: 'enum',
        enum: TipoDatoMedico,
        default: TipoDatoMedico.OTRO,
        })
        tipo: TipoDatoMedico;
    
        @OneToMany(() => AnalisisIA, (analisis) => analisis.datoMedico)
        analisis: AnalisisIA[];
    
        @CreateDateColumn({ name: 'fecha_carga' })
        fechaCarga: Date;
  }