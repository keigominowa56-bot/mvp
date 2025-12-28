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
      
      // private_keyフィールドの改行コードを処理
      if (serviceAccountJson.private_key) {
        // \nを実際の改行に変換
        let privateKey = serviceAccountJson.private_key.replace(/\\n/g, '\n');
        
        // BEGIN/ENDマーカーの間のBase64部分を抽出して正しくフォーマット
        const beginMarker = '-----BEGIN PRIVATE KEY-----';
        const endMarker = '-----END PRIVATE KEY-----';
        
        const beginIndex = privateKey.indexOf(beginMarker);
        const endIndex = privateKey.indexOf(endMarker);
        
        if (beginIndex !== -1 && endIndex !== -1) {
          const beforeBegin = privateKey.substring(0, beginIndex + beginMarker.length);
          const base64Part = privateKey.substring(beginIndex + beginMarker.length, endIndex);
          const afterEnd = privateKey.substring(endIndex);
          
          // Base64部分の空白・改行をすべて削除
          const cleanBase64 = base64Part.replace(/\s+/g, '').trim();
          
          // Base64文字列の長さを確認（4の倍数である必要がある）
          console.log('[Firebase Provider] Base64部分の長さ:', cleanBase64.length);
          console.log('[Firebase Provider] Base64部分の先頭:', cleanBase64.substring(0, 20));
          console.log('[Firebase Provider] Base64部分の末尾:', cleanBase64.substring(cleanBase64.length - 20));
          
          // Base64部分を64文字ごとに改行を挿入
          const formattedBase64 = cleanBase64.match(/.{1,64}/g)?.join('\n') || cleanBase64;
          
          // 正しい形式に再構築
          serviceAccountJson.private_key = beforeBegin + '\n' + formattedBase64 + '\n' + afterEnd;
        } else {
          // BEGIN/ENDが見つからない場合は、単純に\nを変換
          serviceAccountJson.private_key = privateKey;
        }
        
        console.log('[Firebase Provider] Private Key処理完了');
        console.log('- Private Key length:', serviceAccountJson.private_key.length);
        console.log('- Private Key starts with:', serviceAccountJson.private_key.substring(0, 50));
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
