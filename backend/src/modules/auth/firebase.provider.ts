import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  useFactory: () => {
    // ファイルパスの候補（優先順位順）
    const possiblePaths = [
      '/opt/render/project/src/backend/firebase-auth.json', // Render環境
      path.join(process.cwd(), 'firebase-auth.json'), // ルート直下
      path.join(__dirname, '../../firebase-auth.json'), // backendディレクトリ直下
    ];

    let firebaseAuthPath: string | null = null;

    // 存在するファイルパスを探す
    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        firebaseAuthPath = filePath;
        console.log('[Firebase Provider] Firebase認証ファイルを発見:', filePath);
        break;
      }
    }

    if (!firebaseAuthPath) {
      console.error('[Firebase Provider] firebase-auth.json が見つかりません。以下のパスを確認してください:');
      possiblePaths.forEach(p => console.error('  -', p));
      console.warn('[Firebase Provider] ダミー初期化を行います（トークン検証は失敗します）');
      return admin.initializeApp();
    }

    try {
      console.log('[Firebase Provider] Firebase Admin SDK を初期化中...');
      console.log('- 認証ファイル:', firebaseAuthPath);
      
      // JSONファイルを読み込む
      const serviceAccountJson = JSON.parse(fs.readFileSync(firebaseAuthPath, 'utf8'));
      
      // private_keyフィールドの改行コードを処理（\nを実際の改行に変換）
      if (serviceAccountJson.private_key) {
        serviceAccountJson.private_key = serviceAccountJson.private_key.replace(/\\n/g, '\n');
      }
      
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountJson),
      });

      console.log('[Firebase Provider] ✓ Firebase Admin SDK の初期化に成功しました');
      return app;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('[Firebase Provider] ✗ Firebase Admin SDK の初期化に失敗しました:', errorMessage);
      throw error;
    }
  },
};
