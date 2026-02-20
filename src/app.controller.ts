import { Controller, Get } from '@nestjs/common';
import { InjectConnection as InjectMongoConnection } from '@nestjs/mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { Connection as MongoConnection } from 'mongoose';
import { DataSource } from 'typeorm';

@Controller()
export class AppController {
  constructor(
    @InjectMongoConnection() private mongoConnection: MongoConnection,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Get()
  root() {
    return {
      message: 'PreventiGen API',
      version: '1.0.0',
      endpoints: {
        docs: '/api/docs',
        health: '/health',
      },
    };
  }

  @Get('health')
  checkDatabases() {
    return {
      mongodb: this.mongoConnection.readyState === 1 ? 'connected' : 'disconnected',
      postgresql: this.dataSource.isInitialized ? 'connected' : 'disconnected',
    };
  }
}