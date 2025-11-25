import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function getDatabaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: Number(configService.get<number>('DB_PORT', 3306)),
    username: configService.get<string>('DB_USERNAME', 'root'),
    password: configService.get<string>('DB_PASSWORD', 'password'),
    database: configService.get<string>('DB_DATABASE', 'transparency_platform'),
    entities: [
      __dirname + '/../modules/**/*.entity.{ts,js}',
      __dirname + '/../entities/**/*.entity.{ts,js}'
    ],
    synchronize: true,
    charset: 'utf8mb4',
    logging: false
  };
}
