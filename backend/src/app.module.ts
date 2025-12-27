import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { PostsModule } from './modules/posts/posts.module';
import { VotesModule } from './modules/votes/votes.module';
import { CommentsModule } from './modules/comments/comments.module';
import { PoliticianProfileExtendedModule } from './modules/politician-profile-extended/politician-profile-extended.module';
import { PoliticalFundsModule } from './modules/political-funds/political-funds.module';
import { FollowsModule } from './modules/follows/follows.module';
import { MediaModule } from './modules/media/media.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER || 'transparency_user',
      password: process.env.DB_PASS || 'MLLGNUjqLfra/ZpvCuBSt4miXmqX2d+25DDr2ieRAjY=',
      database: process.env.DB_NAME || 'transparency_platform',
      entities: [__dirname + '/entities/**/*.js', __dirname + '/modules/**/entities/**/*.js'],
      synchronize: true,
      logging: false,
      // インデックス削除エラーを無視する設定
      extra: {
        // MySQLのエラーを無視する設定（開発環境のみ）
        // インデックス削除エラーを無視
        connectionLimit: 10,
      },
      // エラーを無視して続行（開発環境のみ）
      dropSchema: false,
      migrationsRun: false,
    }),
    AuthModule,
    PostsModule,
    VotesModule,
    CommentsModule,
    PoliticianProfileExtendedModule,
    PoliticalFundsModule,
    FollowsModule,
    MediaModule,
    NotificationsModule,
    AdminModule,
    UsersModule,
  ],
})
export class AppModule {}
