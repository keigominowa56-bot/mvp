import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// 開発ではレートリミットをオフ（必要なら残せるように）
import { rateLimitMiddleware } from './middleware/rate-limit.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization'],
    credentials: false,
  });

  // 開発ではレート制限を無効化
  if (process.env.NODE_ENV === 'production') {
    app.use(rateLimitMiddleware);
  }

  const port = Number(process.env.PORT || 3001);
  await app.listen(port);
  console.log(`Backend listening on http://localhost:${port}`);
}
bootstrap();