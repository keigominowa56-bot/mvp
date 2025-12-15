import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ここで使うポート番号を admin-frontend と絶対に被らない番号に
  await app.listen(4000); // 例: 4000
}
bootstrap();