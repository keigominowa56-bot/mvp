import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  app() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV || 'development',
    };
  }

  async db() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'ok',
        database: (this.dataSource.options as any).database,
        type: this.dataSource.options.type,
        timestamp: new Date().toISOString(),
      };
    } catch (e: any) {
      return {
        status: 'error',
        error: e?.message || String(e),
        timestamp: new Date().toISOString(),
      };
    }
  }
}