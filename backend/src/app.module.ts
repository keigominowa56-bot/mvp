import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './modules/auth/auth.module';
import { AdminModule } from './modules/admin/admin.module';
import { PostsModule } from './modules/posts/posts.module';
import { DevModule } from './auth/dev.module'; // 先ほど作成

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: process.env.DB_FILE || 'dev.sqlite',
      synchronize: true,
      // 重要: プロジェクト内の全エンティティを自動登録
      entities: [join(__dirname, '/**/*.entity.{ts,js}')],
      // autoLoadEntities: true, // 併用してもOKですが、上の entities だけで十分です
    }),
    AuthModule,
    AdminModule,
    PostsModule,
    DevModule,
    // 他に Policies / Funding / Reports / Comments などのモジュールがある場合は引き続き imports に含めてください
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}