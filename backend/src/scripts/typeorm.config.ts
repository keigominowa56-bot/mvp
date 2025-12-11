import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '.env' });

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // src 実行時/ts-node 用と、build 後の js 双方に対応
  entities: [
    __dirname + '/../**/*.entity.{ts,js}',
  ],
  migrations: [
    __dirname + '/../migrations/*.{ts,js}',
  ],
  synchronize: false,
  logging: false,
});