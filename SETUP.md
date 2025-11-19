# 🚀 セットアップガイド

## 前提条件

- Node.js 18+ 
- MySQL 8.0+
- Git

## クイックスタート

### 1. 依存関係のインストール

```bash
# バックエンド
cd backend
npm install --legacy-peer-deps

# フロントエンド
cd ../frontend
npm install
```

### 2. 環境変数の設定

環境変数ファイルは既に作成されています：

- `backend/.env` - バックエンド設定
- `frontend/.env.local` - フロントエンド設定

**重要**: 実際の値に更新してください：

#### バックエンド (.env)
```env
# データベース設定
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_actual_password
DB_DATABASE=transparency_platform

# JWT設定
JWT_SECRET=your_actual_jwt_secret

# Firebase設定（本番環境用）
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id
```

#### フロントエンド (.env.local)
```env
# Firebase設定（本番環境用）
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

### 3. データベースのセットアップ

```sql
-- MySQLに接続してデータベースを作成
CREATE DATABASE transparency_platform;
```

### 4. アプリケーションの起動

#### 方法1: 自動起動スクリプト（推奨）

**Windows:**
```bash
start-dev.bat
```

**Linux/Mac:**
```bash
chmod +x start-dev.sh
./start-dev.sh
```

#### 方法2: 手動起動

**ターミナル1 - バックエンド:**
```bash
cd backend
npm run start:dev
```

**ターミナル2 - フロントエンド:**
```bash
cd frontend
npm run dev
```

### 5. アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:3001
- **API ドキュメント**: http://localhost:3001/api/docs

## 🔧 トラブルシューティング

### よくある問題

#### 1. Firebase認証エラー
```
Firebase: Error (auth/invalid-api-key)
```

**解決方法:**
- `frontend/.env.local` のFirebase設定を確認
- デモ値の場合は、実際のFirebaseプロジェクトの設定に更新

#### 2. データベース接続エラー
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**解決方法:**
- MySQLが起動していることを確認
- `backend/.env` のデータベース設定を確認
- データベース `transparency_platform` が作成されていることを確認

#### 3. 依存関係の競合
```
npm error ERESOLVE unable to resolve dependency tree
```

**解決方法:**
```bash
cd backend
npm install --legacy-peer-deps
```

#### 4. ポートが既に使用中
```
Error: listen EADDRINUSE: address already in use :::3001
```

**解決方法:**
- 他のプロセスがポートを使用していないか確認
- 環境変数でポートを変更: `PORT=3002`

## 🎯 開発モードでの使用

現在の設定では、Firebase認証がデモモードで動作します：

1. **ログイン機能**: エラーメッセージが表示されますが、アプリケーションは動作します
2. **データ表示**: サンプルデータが表示されます
3. **API**: バックエンドAPIは完全に動作します

## 🔐 本番環境への移行

### 1. Firebase プロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/) でプロジェクトを作成
2. Authentication を有効化
3. サービスアカウントキーを生成
4. 環境変数に実際の値を設定

### 2. データベースの設定

1. 本番用MySQLサーバーをセットアップ
2. データベースとユーザーを作成
3. 環境変数を本番用に更新

### 3. セキュリティ設定

1. JWT秘密鍵を強力な値に変更
2. CORS設定を本番ドメインに制限
3. レート制限を適切に設定

## 📚 追加リソース

- [NestJS ドキュメント](https://docs.nestjs.com/)
- [Next.js ドキュメント](https://nextjs.org/docs)
- [Firebase ドキュメント](https://firebase.google.com/docs)
- [TypeORM ドキュメント](https://typeorm.io/)

## 🆘 サポート

問題が解決しない場合は：

1. GitHub Issues でバグ報告
2. ログファイルを確認
3. 環境変数の設定を再確認
4. 依存関係のバージョンを確認

---

**Happy Coding! 🎉**
