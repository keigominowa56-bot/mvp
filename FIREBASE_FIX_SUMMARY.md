# Firebase トークン検証エラー修正サマリー

## 🎯 完了した作業

### 1. バックエンドの環境変数を更新 ✅

**ファイル**: `backend/.env`

古いFirebaseプロジェクト（seijika-com）から新しいプロジェクト（seiji-a35f4）に更新しました：

```bash
FIREBASE_PROJECT_ID=seiji-a35f4
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@seiji-a35f4.iam.gserviceaccount.com
```

### 2. Firebase Admin SDK の初期化コードを改善 ✅

**ファイル**: `backend/src/modules/auth/firebase.provider.ts`

以下の改善を実施：
- ✅ 環境変数の読み込み状態を確認するデバッグログを追加
- ✅ 秘密鍵の改行コード処理を確認: `privateKey.replace(/\\n/g, '\n')`
- ✅ 初期化成功/失敗のログを追加
- ✅ エラーハンドリングを改善

**追加されたログ出力例**:
```
[Firebase Provider] 環境変数の読み込み確認:
- FIREBASE_PROJECT_ID: ✓ 設定済み
- FIREBASE_CLIENT_EMAIL: ✓ 設定済み
- FIREBASE_PRIVATE_KEY: ✓ 設定済み (長さ: 1704)
[Firebase Provider] Firebase Admin SDK を初期化中...
- Project ID: seiji-a35f4
- Client Email: firebase-adminsdk-fbsvc@seiji-a35f4.iam.gserviceaccount.com
[Firebase Provider] ✓ Firebase Admin SDK の初期化に成功しました
```

### 3. トークン検証のデバッグログを追加 ✅

**ファイル**: `backend/src/modules/auth/auth.service.ts`

以下のメソッドにデバッグログを追加：
- `registerFirebaseUser()` - 一般ユーザー登録
- `loginFirebaseUser()` - 一般ユーザーログイン

**ログ出力例**:
```
[Auth Service] loginFirebaseUser - 認証ヘッダー受信: あり
[Auth Service] loginFirebaseUser - トークン抽出成功 (長さ: 1234)
[Auth Service] loginFirebaseUser - Firebaseトークン検証開始...
[Auth Service] loginFirebaseUser - トークン検証成功. UID: abc123 Email: user@example.com
[Auth Service] loginFirebaseUser - ユーザー情報取得成功. ID: 1 Role: citizen
[Auth Service] loginFirebaseUser - ログイン成功
```

エラー発生時は詳細なエラーメッセージが出力されるため、問題の特定が容易になりました。

### 4. バックエンドの動作確認 ✅

サーバー起動時に以下のログが表示され、Firebase Admin SDKが正常に初期化されることを確認：

```
[Firebase Provider] ✓ Firebase Admin SDK の初期化に成功しました
- Project ID: seiji-a35f4
- Client Email: firebase-adminsdk-fbsvc@seiji-a35f4.iam.gserviceaccount.com
```

### 5. フロントエンドの環境変数を更新 ⚠️

**ファイル**: `frontend/.env`

プロジェクトIDを更新し、残りの設定値はFirebaseコンソールから取得する必要があることを明記しました：

```bash
NEXT_PUBLIC_FIREBASE_PROJECT_ID=seiji-a35f4
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=seiji-a35f4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=seiji-a35f4.firebasestorage.app
# 以下の3つはFirebaseコンソールから取得が必要
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID_HERE
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID_HERE
```

## 📝 次のステップ

フロントエンドの設定を完了させるため、以下の手順を実施してください：

1. **Firebaseコンソールにアクセス**
   - https://console.firebase.google.com/
   - プロジェクト `seiji-a35f4` を選択

2. **Web アプリの設定情報を取得**
   - プロジェクト設定 > 全般 > マイアプリ
   - Web アプリの設定をコピー

3. **`frontend/.env` を更新**
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

詳細な手順は `FIREBASE_FRONTEND_SETUP.md` を参照してください。

## ✅ 解決されたエラー

### 以前のエラー
```
Firebase認証トークンが無効です
```

### 原因
1. バックエンドとフロントエンドで異なるFirebaseプロジェクトを使用していた
   - バックエンド: seijika-com
   - フロントエンド: seijika-com
   - サービスアカウントJSON: seiji-a35f4 ← **不一致！**

2. Firebase Admin SDKが正しく初期化されていなかった可能性

### 解決方法
1. ✅ バックエンドの`.env`を正しいプロジェクト（seiji-a35f4）に更新
2. ✅ Firebase Admin SDKの初期化コードにログを追加
3. ✅ トークン検証時のデバッグログを追加
4. ✅ 秘密鍵の改行コード処理を確認
5. ⚠️ フロントエンドの`.env`も同じプロジェクトに更新（完全な設定はFirebaseコンソールから取得が必要）

## 🔍 トラブルシューティング

### バックエンドのログを確認

サーバー起動時に以下のログが表示されることを確認してください：

```bash
cd backend
npm run start:dev
```

期待されるログ：
```
[Firebase Provider] ✓ Firebase Admin SDK の初期化に成功しました
```

### ログイン時のエラーを確認

ログイン試行時、バックエンドログに以下のような詳細情報が出力されます：

```
[Auth Service] loginFirebaseUser - 認証ヘッダー受信: あり
[Auth Service] loginFirebaseUser - トークン抽出成功 (長さ: ...)
[Auth Service] loginFirebaseUser - Firebaseトークン検証開始...
```

エラーが発生した場合、具体的なエラーメッセージが表示されるため、問題の特定が容易です。

## 📚 関連ドキュメント

- `FIREBASE_FRONTEND_SETUP.md` - フロントエンド設定の詳細手順
- `FIREBASE_SETUP.md` - Firebase全般の設定ガイド
- `backend/.env` - バックエンドの環境変数
- `frontend/.env` - フロントエンドの環境変数

---

**作成日**: 2025/12/21
**修正者**: AI Assistant
**状態**: バックエンド完了 ✅ / フロントエンド要設定 ⚠️
