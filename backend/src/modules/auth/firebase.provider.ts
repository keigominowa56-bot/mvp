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
      
      // パターン2: BEGIN/ENDの間のBase64部分を抽出して正しくフォーマット
      const beginMarker = '-----BEGIN PRIVATE KEY-----';
      const endMarker = '-----END PRIVATE KEY-----';
      
      const beginIndex = formattedPrivateKey.indexOf(beginMarker);
      const endIndex = formattedPrivateKey.indexOf(endMarker);
      
      if (beginIndex !== -1 && endIndex !== -1) {
        const beforeBegin = formattedPrivateKey.substring(0, beginIndex).trim();
        const afterEnd = formattedPrivateKey.substring(endIndex + endMarker.length).trim();
        
        // BEGINとENDの間の部分を抽出
        const base64Content = formattedPrivateKey
          .substring(beginIndex + beginMarker.length, endIndex)
          .replace(/\s+/g, '') // すべての空白文字を削除
          .trim();
        
        // Base64部分を64文字ごとに改行を挿入
        const formattedBase64 = base64Content.match(/.{1,64}/g)?.join('\n') || base64Content;
        
        // 正しい形式に再構築
        formattedPrivateKey = [
          beforeBegin,
          beginMarker,
          formattedBase64,
          endMarker,
          afterEnd
        ].filter(Boolean).join('\n');
      } else {
        // BEGIN/ENDが見つからない場合のフォールバック処理
        if (!formattedPrivateKey.includes('\n')) {
          formattedPrivateKey = formattedPrivateKey.replace(/-----BEGIN PRIVATE KEY-----/g, '-----BEGIN PRIVATE KEY-----\n');
          formattedPrivateKey = formattedPrivateKey.replace(/-----END PRIVATE KEY-----/g, '\n-----END PRIVATE KEY-----');
        }
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
