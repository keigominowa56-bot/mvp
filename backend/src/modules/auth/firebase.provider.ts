import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  useFactory: () => {
    try {
      console.log('[Firebase Provider] Firebase Admin SDK を初期化中...');
      
      let serviceAccountJson: any = null;
      
      // 環境変数から読み込む（優先）
      const projectId = process.env.FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // デバッグ: 環境変数の設定状況を確認
      console.log('[Firebase Provider] 環境変数の確認:');
      console.log('  FIREBASE_PROJECT_ID:', projectId ? '✓' : '✗');
      console.log('  FIREBASE_CLIENT_EMAIL:', clientEmail ? '✓' : '✗');
      console.log('  FIREBASE_PRIVATE_KEY:', privateKey ? '✓ (' + privateKey.length + '文字)' : '✗');
      
      if (projectId && clientEmail && privateKey) {
        console.log('[Firebase Provider] 環境変数から認証情報を読み込みます');
        
        // 環境変数からサービスアカウント情報を構築
        serviceAccountJson = {
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'), // \nを実際の改行に変換
        };
        
        // オプションの環境変数も追加
        if (process.env.FIREBASE_CLIENT_ID) {
          serviceAccountJson.clientId = process.env.FIREBASE_CLIENT_ID;
        }
        if (process.env.FIREBASE_PRIVATE_KEY_ID) {
          serviceAccountJson.privateKeyId = process.env.FIREBASE_PRIVATE_KEY_ID;
        }
        if (process.env.FIREBASE_AUTH_URI) {
          serviceAccountJson.authUri = process.env.FIREBASE_AUTH_URI;
        }
        if (process.env.FIREBASE_TOKEN_URI) {
          serviceAccountJson.tokenUri = process.env.FIREBASE_TOKEN_URI;
        }
      } else {
        // ファイルから読み込む（フォールバック）
        console.log('[Firebase Provider] 環境変数が見つかりません。ファイルから読み込みます');
        
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
        
        // JSONファイルを読み込む
        serviceAccountJson = JSON.parse(fs.readFileSync(firebaseAuthPath, 'utf8'));
      }
      
      // serviceAccountJsonがnullの場合はエラー
      if (!serviceAccountJson) {
        throw new Error('Firebase認証情報の取得に失敗しました');
      }
      
      // private_keyフィールドの改行コードを処理
      if (serviceAccountJson.private_key) {
        let processedKey = serviceAccountJson.private_key;
        
        // 文字列として\nが含まれている場合は実際の改行に変換
        if (typeof processedKey === 'string' && processedKey.includes('\\n')) {
          processedKey = processedKey.replace(/\\n/g, '\n');
        }
        
        // 改行コードを正規化（\r\n を \n に統一）
        processedKey = processedKey.replace(/\r\n/g, '\n');
        
        // 正規化したキーを設定
        serviceAccountJson.private_key = processedKey;
        
        console.log('[Firebase Provider] Private Key処理完了');
        console.log('- Private Key length:', processedKey.length);
        console.log('- Private Key starts with:', processedKey.substring(0, 50));
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
