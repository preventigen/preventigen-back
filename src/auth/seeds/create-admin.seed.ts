// src/database/seeds/create-admin.ts
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

async function createAdmin() {
  // Configurar conexión directa a la base de datos
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'), // 👈 Fix del error
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'preventigen',
    entities: ['dist/**/*.entity.js'],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Conectado a la base de datos');

    // Verificar si ya existe un admin
    const existingAdmin = await dataSource.query(
      `SELECT * FROM admins WHERE email = $1`,
      ['admin@preventigen.com']
    );

    if (existingAdmin.length > 0) {
      console.log('⚠️  Admin ya existe');
      await dataSource.destroy();
      return;
    }

    // Crear admin (usa la contraseña que pusiste en el console.log)
    const passwordHash = await bcrypt.hash('preventigenecamm', 10); 
    
    await dataSource.query(
      `INSERT INTO admins (id, email, password, nombre, activo, "createdAt") 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW())`,
      ['admin@preventigen.com', passwordHash, 'Administrador', true]
    );

    console.log('✅ Admin creado exitosamente');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: admin@preventigen.com');
    console.log('🔑 Password: preventigenecamm');
    console.log('⚠️  CAMBIAR CONTRASEÑA INMEDIATAMENTE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

createAdmin();