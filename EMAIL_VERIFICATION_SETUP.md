# メールアドレス認証機能のセットアップガイド

このガイドでは、frontendとadmin-frontendでFirebase Authenticationを使用したメールアドレス認証機能のセットアップ方法を説明します。

## 概要

- **Frontend（一般ユーザー）**: Firebaseでメールアドレス認証を行い、認証完了後にバックエンドに登録
- **Admin-frontend（管理者）**: Firebaseでメールアドレス認証を行い、@keygo.jpドメインのみ登録可能

## Firebase Admin SDK の設定

### 1. Firebase Console でサービスアカウントキーを取得

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト「seiji-a35f4」を選択
3. 設定（⚙️） → プロジェクトの設定 → サービスアカウント
4. 「新しい秘密鍵の生成」をクリック
5. ダウンロードされたJSONファイルを保存

### 2. 環境変数の設定

バックエンドディレクトリに `.env` ファイルを作成（または既存のファイルに追加）：

```bash
# backend/.env

# Firebase Admin SDK設定
FIREBASE_PROJECT_ID=seiji-a35f4
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seiji-a35f4.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(秘密鍵の内容)...==\n-----END PRIVATE KEY-----\n"
```

**注意**: 
- `FIREBASE_CLIENT_EMAIL` と `FIREBASE_PRIVATE_KEY` は、ダウンロードしたJSONファイルから取得してください
- 秘密鍵の改行は `\n` で表現してください
- 秘密鍵全体をダブルクォートで囲んでください

### 3. Firebase Authentication の有効化

1. Firebase Console → Authentication
2. ログイン方法タブ → メール/パスワード → 有効にする

## 使用方法

### Frontend（一般ユーザー）

#### 新規登録の流れ：

1. ユーザーが `/register` ページで情報を入力
2. Firebaseでアカウント作成
3. 確認メールが自動送信される
4. ユーザーがメール内のリンクをクリックして認証
5. `/login` ページでログイン
6. メール認証済みの場合のみログイン成功

#### ログインの流れ：

1. ユーザーが `/login` ページでログイン
2. Firebaseで認証
3. メール認証チェック（未認証の場合はエラー）
4. バックエンドにIDトークンを送信してセッション確立
5. `/feed` ページにリダイレクト

### Admin-frontend（管理者）

#### 新規登録の流れ：

1. 管理者が `/admin/signup` ページで情報を入力
2. @keygo.jp ドメインのチェック
3. Firebaseでアカウント作成
4. 確認メールが自動送信される
5. 管理者がメール内のリンクをクリックして認証
6. `/admin/login` ページでログイン

#### ログインの流れ：

1. 管理者が `/admin/login` ページでログイン
2. Firebaseで認証
3. メール認証チェック（未認証の場合はエラー）
4. バックエンドにIDトークンを送信
5. Cookieにトークンを保存
6. `/dashboard` ページにリダイレクト

## API エンドポイント

### バックエンド新規追加エンドポイント：

#### `POST /api/auth/register-firebase`
一般ユーザーのFirebase登録をバックエンドに連携

**Headers:**
```
Authorization: Bearer {Firebase ID Token}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "ユーザー名",
  "email": "user@example.com",
  "phone": "09012345678",
  "prefecture": "東京都",
  "prefectureCode": "13",
  "city": "渋谷区"
}
```

#### `POST /api/auth/login-firebase`
一般ユーザーのFirebaseログイン

**Headers:**
```
Authorization: Bearer {Firebase ID Token}
```

**Response:**
```json
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "name": "ユーザー名",
    "role": "citizen"
  }
}
```

#### `POST /api/auth/me`
現在のユーザー情報を取得

**Headers:**
```
Authorization: Bearer {Firebase ID Token}
```

## トラブルシューティング

### メール認証メールが届かない場合

1. 迷惑メールフォルダを確認
2. Firebase Console → Authentication → Templates でメールテンプレートを確認
3. 送信元メールアドレスを確認

### ログイン時に「Email not verified」エラーが出る場合

1. メール内の確認リンクをクリックしていることを確認
2. Firebase Console → Authentication → Users で該当ユーザーのステータスを確認
3. 必要に応じて手動でメール認証済みに設定

### バックエンドで「Invalid Firebase token」エラーが出る場合

1. `.env` ファイルのFirebase設定が正しいか確認
2. 秘密鍵の改行が `\n` で正しく表現されているか確認
3. バックエンドを再起動

### Admin-frontendで「管理者アカウントは @keygo.jp ドメインのみ」エラーが出る場合

- @keygo.jp ドメインのメールアドレスのみが登録可能です
- テスト用に一時的にドメインチェックを外す場合は、`admin-frontend/app/admin/signup/page.tsx` の該当コードをコメントアウトしてください

## セキュリティ注意事項

1. **秘密鍵の管理**: `.env` ファイルは絶対にGitにコミットしないでください（`.gitignore` に含まれていることを確認）
2. **HTTPS**: 本番環境では必ずHTTPS通信を使用してください
3. **トークンの保護**: IDトークンはセキュアなCookieまたはメモリ内で管理してください
4. **ドメイン制限**: 管理者アカウントは @keygo.jp ドメインのみに制限されています

## 開発環境での動作確認

1. バックエンド起動:
```bash
cd backend
npm run start:dev
```

2. Frontend起動:
```bash
cd frontend
npm run dev
```

3. Admin-frontend起動:
```bash
cd admin-frontend
npm run dev
```

4. ブラウザで確認:
- Frontend: http://localhost:3000/register
- Admin-frontend: http://localhost:3001/admin/signup

## 変更内容まとめ

### Backend
- `auth.controller.ts`: Firebase認証用エンドポイント追加
- `auth.service.ts`: Firebase認証メソッド実装
- `auth.module.ts`: FirebaseAdminProvider追加
- `user.entity.ts`: firebaseUidフィールド追加、passwordHashをnullable化

### Frontend
- `register/page.tsx`: 既に実装済み（メール認証機能あり）
- `login/page.tsx`: 既に実装済み（メール認証チェックあり）

### Admin-frontend
- `lib/firebase.ts`: 新規作成（Firebase初期化）
- `admin/signup/page.tsx`: Firebase認証機能追加
- `admin/login/page.tsx`: Firebase認証機能追加
- `package.json`: firebase依存関係追加
