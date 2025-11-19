import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Member } from '../entities/member.entity';
import { Pledge } from '../entities/pledge.entity';
import { ActivityLog } from '../entities/activity-log.entity';
import { ActivityFund } from '../entities/activity-fund.entity';
import { User } from '../entities/user.entity';
import { Vote } from '../entities/vote.entity';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const isDevelopment = configService.get('NODE_ENV') === 'development';
  const skipDatabase = configService.get('SKIP_DATABASE', 'true') === 'true';
  const useMysql = configService.get('USE_MYSQL', 'false') === 'true';
  
  // For development, use SQLite by default unless MySQL is explicitly requested
  if (!useMysql || skipDatabase) {
    console.warn('Using SQLite database for development.');
    return {
      type: 'sqlite',
      database: isDevelopment ? './dev.db' : ':memory:',
      entities: [Member, Pledge, ActivityLog, ActivityFund, User, Vote],
      synchronize: true,
      logging: isDevelopment,
    };
  }

  // Use MySQL only if explicitly configured
  return {
    type: 'mysql',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 3306),
    username: configService.get('DB_USERNAME', 'root'),
    password: configService.get('DB_PASSWORD', ''),
    database: configService.get('DB_DATABASE', 'transparency_platform'),
    entities: [Member, Pledge, ActivityLog, ActivityFund, User, Vote],
    synchronize: isDevelopment,
    logging: isDevelopment,
    ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
    timezone: 'Z',
    charset: 'utf8mb4',
  };
};
