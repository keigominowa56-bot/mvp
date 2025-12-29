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
import { HealthModule } from './health/health.module';

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
        console.log('[AppModule] TypeORM設定を初期化中...');
        const nodeEnv = config.get<string>('NODE_ENV') || 'development';
        const isDevelopment = nodeEnv !== 'production';
        
        // TYPEORM_SYNCHRONIZE環境変数を優先的にチェック
        const typeormSynchronize = config.get<string>('TYPEORM_SYNCHRONIZE');
        console.log('[AppModule] TYPEORM_SYNCHRONIZE環境変数の値:', typeormSynchronize, '(type:', typeof typeormSynchronize, ')');
        console.log('[AppModule] process.env.TYPEORM_SYNCHRONIZE:', process.env.TYPEORM_SYNCHRONIZE);
        let synchronize: boolean;
        if (typeormSynchronize !== undefined && typeormSynchronize !== null) {
          synchronize = typeormSynchronize === 'true' || typeormSynchronize === '1';
          console.log('[AppModule] TYPEORM_SYNCHRONIZE環境変数から取得:', synchronize);
        } else {
          synchronize = isDevelopment;
          console.log('[AppModule] TYPEORM_SYNCHRONIZEが設定されていないため、NODE_ENVから決定:', nodeEnv, 'synchronize:', synchronize);
        }
        
        // 環境変数の取得（DB_USERNAME/DB_PASSWORDもサポート）
        const dbHost = config.get<string>('DB_HOST') || (isDevelopment ? 'localhost' : undefined);
        const dbPort = config.get<string>('DB_PORT') || '3306';
        const dbUser = config.get<string>('DB_USER') || config.get<string>('DB_USERNAME') || (isDevelopment ? 'root' : undefined);
        const dbPass = config.get<string>('DB_PASS') || config.get<string>('DB_PASSWORD') || (isDevelopment ? '' : undefined);
        const dbName = config.get<string>('DB_NAME') || config.get<string>('DB_DATABASE') || (isDevelopment ? 'transparency_platform' : undefined);
        
        // デバッグ: 環境変数の読み込み状況を確認（本番環境でも表示）
        console.log('[AppModule] 環境変数の読み込み状況:');
        console.log('  DB_HOST:', config.get<string>('DB_HOST') ? '✓ (' + config.get<string>('DB_HOST') + ')' : '✗');
        console.log('  DB_USER:', config.get<string>('DB_USER') ? '✓' : '✗', 'DB_USERNAME:', config.get<string>('DB_USERNAME') ? '✓' : '✗');
        console.log('  DB_PASS:', config.get<string>('DB_PASS') ? '✓' : '✗', 'DB_PASSWORD:', config.get<string>('DB_PASSWORD') ? '✓' : '✗');
        console.log('  DB_NAME:', config.get<string>('DB_NAME') ? '✓' : '✗', 'DB_DATABASE:', config.get<string>('DB_DATABASE') ? '✓' : '✗');
        console.log('  使用する値:');
        console.log('    host:', dbHost);
        console.log('    user:', dbUser);
        console.log('    password:', dbPass ? '***' : '(空)');
        console.log('    database:', dbName);
        
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
        
        // DATABASE_URLが設定されている場合は優先（PostgreSQL形式: postgresql://user:pass@host:port/dbname）
        const databaseUrl = config.get<string>('DATABASE_URL');
        console.log('[AppModule] DATABASE_URL確認:', databaseUrl ? '設定されています (' + databaseUrl.substring(0, 30) + '...)' : '設定されていません');
        
        // 環境変数から直接取得も試みる（ConfigServiceが読み込めない場合のフォールバック）
        const databaseUrlDirect = process.env.DATABASE_URL;
        if (!databaseUrl && databaseUrlDirect) {
          console.log('[AppModule] ConfigServiceからDATABASE_URLが取得できませんでしたが、process.envから取得しました');
        }
        const finalDatabaseUrl = databaseUrl || databaseUrlDirect;
        
        if (finalDatabaseUrl) {
          console.log('[AppModule] DATABASE_URLが設定されています。パースを試みます...');
          console.log('[AppModule] DATABASE_URL先頭50文字:', finalDatabaseUrl.substring(0, 50));
          
          // DATABASE_URLから接続情報を抽出
          // postgresql://user:pass@host:port/dbname または postgresql://user:pass@host/dbname
          // パスワードに特殊文字が含まれる可能性があるため、URL.parseを使用
          let urlUser: string;
          let urlPass: string;
          let urlHost: string;
          let urlPort: string | undefined;
          let urlDb: string;
          
          try {
            // URL.parseを使用してより確実にパース
            // postgresql:// を postgres:// に変換してからパース（URLクラスがpostgresqlを認識しない場合があるため）
            const normalizedUrl = finalDatabaseUrl.replace(/^postgresql:\/\//, 'postgres://');
            const url = new URL(normalizedUrl);
            urlUser = decodeURIComponent(url.username);
            urlPass = decodeURIComponent(url.password);
            urlHost = url.hostname;
            urlPort = url.port || undefined;
            urlDb = decodeURIComponent(url.pathname.substring(1)); // 先頭の/を削除
            
            const port = urlPort ? parseInt(urlPort, 10) : 5432; // デフォルトポート5432
            
            console.log('[AppModule] DATABASE_URLパース成功:');
            console.log('  host:', urlHost);
            console.log('  port:', port);
            console.log('  user:', urlUser);
            console.log('  database:', urlDb);
            console.log('  password length:', urlPass.length);
            console.log('  password preview:', urlPass.substring(0, 3) + '***');
            
            // パスワードは既にデコード済み
            const decodedPassword = urlPass;
            
            return {
              type: 'postgres',
              host: urlHost,
              port: port,
              username: urlUser,
              password: decodedPassword,
              database: urlDb,
              entities: [__dirname + '/entities/**/*.js', __dirname + '/modules/**/entities/**/*.js'],
              synchronize: synchronize,
              logging: isDevelopment,
              extra: {
                connectionLimit: 10,
              },
              dropSchema: false,
              migrationsRun: false,
            };
          } catch (parseError) {
            console.error('[AppModule] DATABASE_URLのパースに失敗しました:', parseError instanceof Error ? parseError.message : String(parseError));
            console.error('[AppModule] DATABASE_URL形式を確認してください:', finalDatabaseUrl.substring(0, 80) + '...');
            console.error('[AppModule] DATABASE_URL全体の長さ:', finalDatabaseUrl.length);
            
            // フォールバック: 正規表現でパースを試みる
            console.log('[AppModule] 正規表現によるフォールバックパースを試みます...');
            const urlMatch = finalDatabaseUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:\/]+)(?::(\d+))?\/(.+)/);
            if (urlMatch) {
              const [, fallbackUser, fallbackPass, fallbackHost, fallbackPort, fallbackDb] = urlMatch;
              const fallbackPortNum = fallbackPort ? parseInt(fallbackPort, 10) : 5432;
              
              // パスワードのデコードを試みる（複数回デコードが必要な場合がある）
              let decodedPassword = fallbackPass;
              try {
                // 一度デコードして、まだエンコードされている場合は再度デコード
                decodedPassword = decodeURIComponent(fallbackPass);
                if (decodedPassword.includes('%')) {
                  decodedPassword = decodeURIComponent(decodedPassword);
                }
              } catch (e) {
                // URLエンコードされていない場合はそのまま使用
                decodedPassword = fallbackPass;
              }
              
              console.log('[AppModule] フォールバックパース成功:');
              console.log('  host:', fallbackHost);
              console.log('  port:', fallbackPortNum);
              console.log('  user:', fallbackUser);
              console.log('  database:', fallbackDb);
              console.log('  password length:', decodedPassword.length);
              
              return {
                type: 'postgres',
                host: fallbackHost,
                port: fallbackPortNum,
                username: fallbackUser,
                password: decodedPassword,
                database: fallbackDb,
                entities: [__dirname + '/entities/**/*.js', __dirname + '/modules/**/entities/**/*.js'],
                synchronize: isDevelopment,
                logging: isDevelopment,
                extra: {
                  connectionLimit: 10,
                },
                dropSchema: false,
                migrationsRun: false,
              };
            } else {
              console.error('[AppModule] フォールバックパースも失敗しました');
            }
          }
        }
        
        // DATABASE_URLがない場合は個別設定を使用（MySQLまたはPostgreSQL）
        const dbType = config.get<string>('DB_TYPE') || 'mysql'; // デフォルトはMySQL
        
        console.log('[AppModule] DATABASE_URLが設定されていないか、パースに失敗しました。個別設定を使用します:');
        console.log('  DB_TYPE:', dbType);
        console.log('  host:', dbHost);
        console.log('  port:', dbPort);
        console.log('  user:', dbUser);
        console.log('  database:', dbName);
        
        return {
          type: dbType === 'postgres' ? 'postgres' : 'mysql',
          host: dbHost,
          port: parseInt(dbPort, 10),
          username: dbUser,
          password: dbPass || '', // 空文字列を明示的に設定
          database: dbName,
          entities: [__dirname + '/entities/**/*.js', __dirname + '/modules/**/entities/**/*.js'],
          synchronize: synchronize,
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
    HealthModule,
  ],
})
export class AppModule {}
