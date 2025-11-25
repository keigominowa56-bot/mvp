import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
// 他必要なモジュールもインポート

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // 既存 DB 設定のまま
    }),
    AuthModule,
    UsersModule,
    PostsModule,
  ],
})
export class AppModule {}