import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ======== ここを追記！ ========
  app.enableCors({
    origin: [
      'http://localhost:3000', // Next.jsフロントのURL（必要に応じて3001も加える）
      'http://localhost:3001'
    ],
    credentials: true,
  });
  // ============================

  await app.listen(4000); // 例: 4000
}
bootstrap();