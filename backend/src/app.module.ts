import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// 他の imports...

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'app',
      // ここが重要。Member が含まれるようにする
      entities: [__dirname + '/entities/**/*.js', __dirname + '/modules/**/entities/**/*.js'],
      // or ts-node 実行時:
      // entities: ['src/entities/**/*.ts', 'src/modules/**/entities/**/*.ts'],
      synchronize: true,
    }),
    // 他 modules...
  ],
})
export class AppModule {}