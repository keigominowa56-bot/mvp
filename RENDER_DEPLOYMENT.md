# Render デプロイ設定ガイド

## バックエンド設定

### 基本設定
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/main.js`

### 環境変数
以下の環境変数を設定してください：

| Key | Value | 備考 |
|-----|-------|------|
| `DATABASE_URL` | `postgresql://admin:fdSAL9VLSAlwHjAUBY5XbedkWOENLp24@dpg-d58d6oeuk2gs73dhrijg-a:5432/mvp_database_g0ic` | PostgreSQL接続URL |
| `DB_HOST` | `dpg-d58d6oeuk2gs73dhrijg-a` | フォールバック用 |
| `DB_PORT` | `5432` | |
| `DB_USERNAME` | `admin` | |
| `DB_PASSWORD` | `fdSAL9VLSAlwHjAUBY5XbedkWOENLp24` | |
| `DB_DATABASE` | `mvp_database_g0ic` | |
| `NODE_ENV` | `production` | |
| `JWT_SECRET` | （ローカルの`.env`から取得） | |
| `JWT_EXPIRES_IN` | `24h` | |
| `FIREBASE_PROJECT_ID` | `seiji-a35f4` | |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@seiji-a35f4.iam.gserviceaccount.com` | |
| `FIREBASE_PRIVATE_KEY` | （ローカルの`.env`から取得） | `\n`を含めて1行で |
| `PORT` | （空欄） | Renderが自動割り当て |
| `CORS_ORIGINS` | `https://your-frontend.onrender.com` | フロントエンドURL |

---

## フロントエンド設定（Next.js）

### 基本設定
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### 環境変数
以下の環境変数を設定してください：

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyDOBQwhVPtlDrC27U1DvD_X-58cTdOTmy4` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `seiji-a35f4.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `seiji-a35f4` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `seiji-a35f4.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1095298016246` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1095298016246:web:5ef8a8cea5e5e9bcae5dd7` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://your-backend.onrender.com` | バックエンドのURL |

---

## デプロイ手順

1. **バックエンドをデプロイ**
   - 上記の設定でバックエンドサービスを作成
   - 環境変数を設定
   - デプロイ完了後、URLを確認（例：`https://your-backend.onrender.com`）

2. **フロントエンドをデプロイ**
   - 上記の設定でフロントエンドサービスを作成
   - `NEXT_PUBLIC_API_BASE_URL`にバックエンドのURLを設定
   - デプロイ完了後、URLを確認（例：`https://your-frontend.onrender.com`）

3. **バックエンドの環境変数を更新**
   - `CORS_ORIGINS`にフロントエンドのURLを設定
   - 自動的に再デプロイされます

---

## トラブルシューティング

### ビルドエラー
- `npm exec nest build`ではなく`npm run build`を使用してください
- `node dist/main`ではなく`node dist/main.js`を使用してください

### データベース接続エラー
- `DATABASE_URL`が正しく設定されているか確認
- PostgreSQLの接続情報が正しいか確認

### CORSエラー
- `CORS_ORIGINS`にフロントエンドのURLが正しく設定されているか確認
- `https://`で始まる完全なURLを設定してください

