import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';

// Módulos existentes
import { AuthModule } from './auth/auth.module';
import { MedicosModule } from './medicos/medicos.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { ConsultasModule } from './consultas/consultas.module';
import { GemelosDigitalesModule } from './gemelos-digitales/gemelos-digitales.module';

// Módulos nuevos
import { DatosMedicosModule } from './datos-medicos/datos-medicos.module';
import { AnalisisIAModule } from './analisis-ia/analisis-ia.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),

    // Módulos existentes (sin cambios)
    AuthModule,
    MedicosModule,
    PacientesModule,
    ConsultasModule,
    GemelosDigitalesModule,

    // Módulos nuevos (PREVENTIGEN simplificado)
    DatosMedicosModule,
    AnalisisIAModule,
  ],
})
export class AppModule {}