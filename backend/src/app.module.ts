import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
      envFilePath: ['.env', '../.env'], // .envファイルのパスを明示的に指定
      expandVariables: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const nodeEnv = config.get<string>('NODE_ENV') || 'development';
        const isDevelopment = nodeEnv !== 'production';
        
        // 環境変数の取得（DB_USERNAME/DB_PASSWORDもサポート）
        const dbHost = config.get<string>('DB_HOST') || (isDevelopment ? 'localhost' : undefined);
        const dbPort = config.get<string>('DB_PORT') || '3306';
        const dbUser = config.get<string>('DB_USER') || config.get<string>('DB_USERNAME') || (isDevelopment ? 'root' : undefined);
        const dbPass = config.get<string>('DB_PASS') || config.get<string>('DB_PASSWORD') || (isDevelopment ? '' : undefined);
        const dbName = config.get<string>('DB_NAME') || config.get<string>('DB_DATABASE') || (isDevelopment ? 'transparency_platform' : undefined);
        
        // デバッグ: 環境変数の読み込み状況を確認
        if (isDevelopment) {
          console.log('[AppModule] 環境変数の読み込み状況:');
          console.log('  DB_HOST:', config.get<string>('DB_HOST') ? '✓' : '✗');
          console.log('  DB_USER:', config.get<string>('DB_USER') ? '✓' : '✗', 'DB_USERNAME:', config.get<string>('DB_USERNAME') ? '✓' : '✗');
          console.log('  DB_PASS:', config.get<string>('DB_PASS') ? '✓' : '✗', 'DB_PASSWORD:', config.get<string>('DB_PASSWORD') ? '✓' : '✗');
          console.log('  DB_NAME:', config.get<string>('DB_NAME') ? '✓' : '✗', 'DB_DATABASE:', config.get<string>('DB_DATABASE') ? '✓' : '✗');
          console.log('  使用する値:');
          console.log('    host:', dbHost);
          console.log('    user:', dbUser);
          console.log('    password:', dbPass ? '***' : '(空)');
          console.log('    database:', dbName);
        }
        
        // 本番環境で必須環境変数が設定されていない場合はエラー
        if (!isDevelopment) {
          if (!dbHost || !dbUser || dbPass === undefined || !dbName) {
            throw new Error('本番環境では以下の環境変数が必須です: DB_HOST, DB_USER, DB_PASS, DB_NAME');
          }
        }
        
        // 開発環境で環境変数が設定されていない場合は警告（代替名もチェック）
        if (isDevelopment) {
          if (!config.get<string>('DB_HOST')) {
            console.warn('⚠️  DB_HOSTが設定されていません。デフォルト値（localhost）を使用します。');
          }
          if (!config.get<string>('DB_USER') && !config.get<string>('DB_USERNAME')) {
            console.warn('⚠️  DB_USER/DB_USERNAMEが設定されていません。デフォルト値（root）を使用します。');
          }
          if (!config.get<string>('DB_PASS') && !config.get<string>('DB_PASSWORD')) {
            console.warn('⚠️  DB_PASS/DB_PASSWORDが設定されていません。デフォルト値（空文字列）を使用します。');
          }
          if (!config.get<string>('DB_NAME') && !config.get<string>('DB_DATABASE')) {
            console.warn('⚠️  DB_NAME/DB_DATABASEが設定されていません。デフォルト値（transparency_platform）を使用します。');
          }
        }
        
        return {
          type: 'mysql',
          host: dbHost,
          port: parseInt(dbPort, 10),
          username: dbUser,
          password: dbPass || '', // 空文字列を明示的に設定
          database: dbName,
          entities: [__dirname + '/entities/**/*.js', __dirname + '/modules/**/entities/**/*.js'],
          synchronize: isDevelopment,
          logging: isDevelopment,
          extra: {
            connectionLimit: 10,
          },
          dropSchema: false,
          migrationsRun: false,
        };
      },
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
