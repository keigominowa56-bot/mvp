import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { exec } from 'child_process';
import { promisify } from 'util';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

const execAsync = promisify(exec);

async function killProcessOnPort(port: number): Promise<boolean> {
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
    if (error.code === 1 || error.message.includes('No such process')) {
      return false;
    }
    throw error;
  }
}

async function isPortAvailable(port: number): Promise<boolean> {
  try {
    const { stdout } = await execAsync(`lsof -ti:${port}`);
    return stdout.trim().length === 0;
  } catch (error: any) {
    if (error.code === 1) {
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
    'http://localhost:3001'
  ];
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // ポート設定（Render等の本番環境ではprocess.env.PORTを使用）
  const port = parseInt(process.env.PORT || process.env.BACKEND_PORT || '4000', 10);
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