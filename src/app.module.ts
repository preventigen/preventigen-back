import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { MedicosModule } from './medicos/medicos.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { ConsultasModule } from './consultas/consultas.module';
import { GemelosDigitalesModule } from './gemelos-digitales/gemelos-digitales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'back/.env',
    }),
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    MedicosModule,
    PacientesModule,
    ConsultasModule,
    GemelosDigitalesModule
  ],
})
export class AppModule {}