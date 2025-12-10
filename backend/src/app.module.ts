import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsModule } from './modules/comments/comments.module';
import { RegisterModule } from './modules/auth/register.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DB_FILE || 'dev.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    CommentsModule,
    RegisterModule,
    RecommendationsModule,
    // 既存モジュールがあれば引き続きここに並べる
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}