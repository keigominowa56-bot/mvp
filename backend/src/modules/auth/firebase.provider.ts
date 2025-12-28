import { ConfigService } from '@nestjs/config';
import { Provider } from '@nestjs/common';
import * as admin from 'firebase-admin';

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

export const FirebaseAdminProvider: Provider = {
  provide: FIREBASE_ADMIN,
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    const projectId = config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = config.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = config.get<string>('FIREBASE_PRIVATE_KEY');

    // デバッグ用ログ
    console.log('[Firebase Provider] 環境変数の読み込み確認:');
    console.log('- FIREBASE_PROJECT_ID:', projectId ? '✓ 設定済み' : '✗ 未設定');
    console.log('- FIREBASE_CLIENT_EMAIL:', clientEmail ? '✓ 設定済み' : '✗ 未設定');
    console.log('- FIREBASE_PRIVATE_KEY:', privateKey ? '✓ 設定済み (長さ: ' + privateKey.length + ')' : '✗ 未設定');

    // 値が無い場合はエラーログを出力
    if (!projectId || !clientEmail || !privateKey) {
      console.error('[Firebase Provider] Firebase環境変数が不足しています。.envファイルを確認してください。');
      console.warn('[Firebase Provider] ダミー初期化を行います（トークン検証は失敗します）');
      return admin.initializeApp();
    }

    try {
      // 改行コードを正しく処理（複数のパターンに対応）
      // Renderなどの環境変数では、\nが文字列として渡される可能性がある
      let formattedPrivateKey = privateKey;
      
      // パターン1: \\n を \n に変換（エスケープされた改行）
      formattedPrivateKey = formattedPrivateKey.replace(/\\n/g, '\n');
      
      // パターン2: 実際の改行が含まれている場合はそのまま使用
      // パターン3: BEGIN/ENDの前後で改行が不足している場合は追加
      if (!formattedPrivateKey.includes('\n')) {
        // BEGIN PRIVATE KEYの後に改行がない場合
        formattedPrivateKey = formattedPrivateKey.replace(/-----BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----\n');
        // END PRIVATE KEYの前に改行がない場合
        formattedPrivateKey = formattedPrivateKey.replace(/-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----');
      }
      
      // 先頭と末尾の空白・改行を削除
      formattedPrivateKey = formattedPrivateKey.trim();
      
      console.log('[Firebase Provider] Firebase Admin SDK を初期化中...');
      console.log('- Project ID:', projectId);
      console.log('- Client Email:', clientEmail);
      console.log('- Private Key length:', formattedPrivateKey.length);
      console.log('- Private Key starts with:', formattedPrivateKey.substring(0, 30));
      
      const app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: formattedPrivateKey,
        }),
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
