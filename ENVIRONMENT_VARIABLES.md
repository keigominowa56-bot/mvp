# 環境変数一覧

本番環境（Render等）で設定が必要な環境変数の一覧です。

## バックエンド環境変数

### データベース設定

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `DB_HOST` | データベースホスト | ✅ | `localhost` または `your-db-host.render.com` |
| `DB_PORT` | データベースポート | ✅ | `3306` |
| `DB_USER` | データベースユーザー名 | ✅ | `your_database_user` |
| `DB_PASS` | データベースパスワード | ✅ | `your_secure_password` |
| `DB_NAME` | データベース名 | ✅ | `transparency_platform` |

### JWT設定

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `JWT_SECRET` | JWTトークンの署名に使用する秘密鍵 | ✅ | ランダムな文字列（32文字以上推奨） |
| `JWT_EXPIRES_IN` | JWTトークンの有効期限 | ❌ | `7d`（デフォルト） |

### Firebase設定

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `FIREBASE_PROJECT_ID` | FirebaseプロジェクトID | ✅ | `your-project-id` |
| `FIREBASE_CLIENT_EMAIL` | Firebaseサービスアカウントのメールアドレス | ✅ | `firebase-adminsdk@xxx.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase秘密鍵（改行コードを含む） | ✅ | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` |

### アプリケーション設定

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `NODE_ENV` | 実行環境 | ✅ | `production` |
| `PORT` | サーバーポート（Renderでは自動設定） | ❌ | `4000`（デフォルト） |
| `BACKEND_PORT` | バックエンドポート（PORTが設定されていない場合） | ❌ | `4000`（デフォルト） |
| `CORS_ORIGINS` | CORS許可オリジン（カンマ区切り） | ❌ | `https://your-app.com,https://www.your-app.com` |

## フロントエンド環境変数

| 変数名 | 説明 | 必須 | 例 |
|--------|------|------|-----|
| `NEXT_PUBLIC_API_BASE_URL` | バックエンドAPIのベースURL | ✅ | `https://your-backend.onrender.com` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase APIキー | ✅ | Firebase Consoleから取得 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase認証ドメイン | ✅ | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | FirebaseプロジェクトID | ✅ | `your-project-id` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebaseストレージバケット | ✅ | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebaseメッセージング送信者ID | ✅ | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | FirebaseアプリID | ✅ | `1:123456789:web:abcdef` |

## Renderでの設定方法

1. Renderダッシュボードにログイン
2. サービス（Web Service）を選択
3. 「Environment」タブを開く
4. 「Environment Variables」セクションで各変数を追加
5. 値を設定して「Save Changes」をクリック

## セキュリティ注意事項

- ✅ `.env`ファイルは`.gitignore`に含まれています
- ✅ 本番環境では強力な`JWT_SECRET`を使用してください
- ✅ データベースパスワードは複雑なものを使用してください
- ✅ Firebase秘密鍵は改行コード（`\n`）を含めて設定してください
- ✅ 環境変数はRenderのダッシュボードで設定し、コードに直接書かないでください

## ローカル開発環境のセットアップ

1. `backend/.env.example`を`backend/.env`にコピー
2. 各環境変数を実際の値に置き換え
3. フロントエンドも同様に`.env.local`を作成

