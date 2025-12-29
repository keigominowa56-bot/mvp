import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { exec } from 'child_process';
import { promisify } from 'util';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const execAsync = promisify(exec);

// lsofコマンドが利用可能かチェック
async function isLsofAvailable(): Promise<boolean> {
  try {
    await execAsync('which lsof');
    return true;
  } catch {
    return false;
  }
}

async function killProcessOnPort(port: number): Promise<boolean> {
  // 本番環境ではポートチェックをスキップ
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  
  // lsofが利用できない場合はスキップ
  if (!(await isLsofAvailable())) {
    console.log(`⚠️  lsof command not available. Skipping port cleanup.`);
    return false;
  }
  
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    const pids = stdout.trim().split('\n').filter(Boolean);
    if (pids.length > 0) {
      console.log(`🔄 Killing ${pids.length} process(es) on port ${port}...`);
      for (const pid of pids) {
        try {
          await execAsync(`kill -9 ${pid}`);
          console.log(`✅ Process ${pid} killed successfully`);
        } catch (err) {
          console.warn(`⚠️  Failed to kill process ${pid}: ${err}`);
        }
      }
      return true;
    }
    return false;
  } catch (error: any) {
    // プロセスが見つからない場合は正常
    if (error.code === 1 || error.code === 127 || error.message.includes('No such process') || error.message.includes('not found')) {
      return false;
    }
    throw error;
  }
}

async function isPortAvailable(port: number): Promise<boolean> {
  // 本番環境ではポートチェックをスキップ（常に利用可能とみなす）
  if (process.env.NODE_ENV === 'production') {
    return true;
  }
  
  // lsofが利用できない場合はスキップ（利用可能とみなす）
  if (!(await isLsofAvailable())) {
    console.log(`⚠️  lsof command not available. Assuming port ${port} is available.`);
    return true;
  }
  
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    return stdout.trim().length === 0;
  } catch (error: any) {
    if (error.code === 1 || error.code === 127) {
      return true; // プロセスが見つからない = ポートは利用可能
    }
    throw error;
  }
}

async function waitForPortAvailable(port: number, maxWaitMs: number = 5000): Promise<boolean> {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWaitMs) {
    if (await isPortAvailable(port)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 200)); // 200msごとにチェック
  }
  return false;
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 静的ファイルの配信を有効化
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // CORS設定
  const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://api.polimee.com:3000',
    'http://api.polimee.com:3001',
    'http://polimee.com:3000',
    'http://polimee.com:3001'
  ];
  console.log('[Main] CORS設定:', allowedOrigins);
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // ポート設定（Render等の本番環境ではprocess.env.PORTを使用）
  const port = parseInt(process.env.PORT || process.env.BACKEND_PORT || '4000', 10);
  const isProduction = process.env.NODE_ENV === 'production';
  
  // 本番環境ではポートチェックをスキップして直接起動
  if (isProduction) {
    try {
      await app.listen(port);
      console.log(`✅ Server is running on port ${port}`);
      return;
    } catch (error: any) {
      console.error(`❌ Failed to start server on port ${port}:`, error.message);
      throw error;
    }
  }
  
  // 開発環境のみポートチェックとリトライロジックを実行
  let retries = 0;
  const maxRetries = 5;
  
  // 起動前に既存のプロセスをクリーンアップ
  const initiallyAvailable = await isPortAvailable(port);
  if (!initiallyAvailable) {
    console.log(`⚠️  Port ${port} is in use. Cleaning up existing processes...`);
    await killProcessOnPort(port);
    const cleaned = await waitForPortAvailable(port, 5000);
    if (!cleaned) {
      console.warn(`⚠️  Port ${port} is still in use after cleanup. Will retry on listen...`);
    }
  }
  
  while (retries < maxRetries) {
    try {
      // ポートが利用可能かチェック
      const available = await isPortAvailable(port);
      if (!available) {
        console.log(`⚠️  Port ${port} is still in use. Attempting to kill existing process...`);
        await killProcessOnPort(port);
        // ポートが解放されるまで待機（最大5秒）
        const portFreed = await waitForPortAvailable(port, 5000);
        if (!portFreed) {
          console.warn(`⚠️  Port ${port} may still be in use, but attempting to listen anyway...`);
        }
      }
      
      await app.listen(port);
      console.log(`✅ Server is running on http://localhost:${port}`);
      return; // 成功したら終了
    } catch (error: any) {
      if (error.code === 'EADDRINUSE') {
        retries++;
        if (retries < maxRetries) {
          console.log(`⚠️  Port ${port} is still in use. Retry ${retries}/${maxRetries}...`);
          await killProcessOnPort(port);
          // ポートが解放されるまで待機（最大5秒）
          const portFreed = await waitForPortAvailable(port, 5000);
          if (!portFreed) {
            console.warn(`⚠️  Port ${port} may still be in use, but will retry...`);
          }
        } else {
          console.error(`❌ Failed to start server on port ${port} after ${maxRetries} retries.`);
          console.error(`💡 Please manually stop the process using port ${port}:`);
          console.error(`   lsof -ti:${port} | xargs kill -9`);
          process.exit(1);
        }
      } else {
        throw error;
      }
    }
  }
}
bootstrap();