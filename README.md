# 市民参加型 透明性データプラットフォーム

地方議会議員の活動情報、公約、および政務活動費の使途を市民が公平に確認・評価できるデータ駆動型WebプラットフォームのMVP（最小実行可能製品）です。

## 🎯 プロジェクトの目的

- **政治的透明性の向上**: 議員の活動情報と公金の使途を可視化
- **市民参加の促進**: 公約や活動に対する賛否評価機能
- **情報の一元化**: 複数のソースからの情報を自動収集・統合
- **データ駆動型の政治**: 客観的なデータに基づく政治評価

## 🚀 主要機能

### A. 登録メンバー（議員）チャンネル機能
- **プロフィール表示**: 議員の氏名、写真、所属、経歴、公約一覧
- **活動資金の可視化**: 政務活動費の支出データをカテゴリ別に集計し、Chart.js/Rechartsで可視化
- **賛否評価機能**: ログインユーザーが各活動や公約に「賛成」または「反対」の評価を表明

### B. メインタイムライン・情報自動収集機能
- **活動ログのフィード**: 全登録メンバーの最新活動ログを時系列で表示
- **外部フィード連携**: X (旧Twitter) API、議員の公式ブログ・ウェブサイトのRSS、地方自治体議会公式サイトのRSSから自動収集
- **堅牢な自動収集システム**: 再送・リトライ機構を備えた障害対応

### C. バックエンド・データ管理
- **RESTful API**: NestJSによる堅牢なAPI基盤
- **DB設計**: 正規化と拡張性を意識したMySQLスキーマ設計
- **運営者向け管理画面**: 議員情報のCRUD操作、活動資金データのCSVインポート機能

## 🛠 技術スタック

### バックエンド
- **フレームワーク**: NestJS
- **データベース**: MySQL with TypeORM
- **認証**: Firebase Authentication
- **外部API**: Twitter API v2, RSS Parser
- **セキュリティ**: Helmet, CORS, Rate Limiting
- **ドキュメント**: Swagger/OpenAPI

### フロントエンド
- **フレームワーク**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS
- **状態管理**: React Context API
- **チャート**: Chart.js, Recharts
- **アニメーション**: Framer Motion
- **認証**: Firebase Auth

### インフラ・DevOps
- **コンテナ**: Docker (推奨)
- **環境管理**: Environment Variables
- **CI/CD**: GitHub Actions (設定例)

## 📁 プロジェクト構造

```
mvp/
├── backend/                 # NestJS バックエンド
│   ├── src/
│   │   ├── entities/        # データベースエンティティ
│   │   ├── modules/         # 機能モジュール
│   │   │   ├── auth/        # 認証
│   │   │   ├── members/     # 議員管理
│   │   │   ├── pledges/     # 公約管理
│   │   │   ├── votes/       # 投票システム
│   │   │   ├── activity-logs/ # 活動ログ
│   │   │   ├── activity-funds/ # 政務活動費
│   │   │   ├── external-feeds/ # 外部フィード収集
│   │   │   └── admin/       # 管理画面
│   │   ├── config/          # 設定ファイル
│   │   └── main.ts          # アプリケーションエントリーポイント
│   ├── package.json
│   └── env.example
├── frontend/                # Next.js フロントエンド
│   ├── app/                 # App Router
│   ├── components/          # React コンポーネント
│   ├── contexts/            # React Context
│   ├── lib/                 # ユーティリティ
│   ├── package.json
│   └── env.example
└── README.md
```

## 🚀 セットアップ手順

### 前提条件
- Node.js 18+ 
- MySQL 8.0+
- Firebase プロジェクト
- Twitter API アカウント（オプション）

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd mvp
```

### 2. バックエンドのセットアップ
```bash
cd backend
npm install

# 環境変数の設定
cp env.example .env
# .env ファイルを編集して必要な値を設定

# データベースの作成
mysql -u root -p
CREATE DATABASE transparency_platform;

# アプリケーションの起動
npm run start:dev
```

### 3. フロントエンドのセットアップ
```bash
cd frontend
npm install

# 環境変数の設定
cp env.example .env.local
# .env.local ファイルを編集して必要な値を設定

# アプリケーションの起動
npm run dev
```

### 4. アクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:3001
- API ドキュメント: http://localhost:3001/api/docs

## 🔧 環境変数の設定

### バックエンド (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=transparency_platform

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h

# Firebase Configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_PRIVATE_KEY_ID=your_firebase_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_CLIENT_ID=your_firebase_client_id

# Twitter API Configuration (Optional)
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

### フロントエンド (.env.local)
```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📊 データベーススキーマ

### 主要テーブル
- **members**: 議員情報
- **pledges**: 公約情報
- **activity_logs**: 活動ログ
- **activity_funds**: 政務活動費
- **users**: ユーザー情報
- **votes**: 投票データ

### リレーション
- 議員 → 公約 (1:N)
- 議員 → 活動ログ (1:N)
- 議員 → 政務活動費 (1:N)
- ユーザー → 投票 (1:N)
- 公約 → 投票 (1:N)

## 🔐 セキュリティ機能

- **認証**: Firebase Authentication
- **認可**: JWT トークンベース
- **入力検証**: class-validator
- **SQL インジェクション対策**: TypeORM
- **レート制限**: Throttler
- **CORS**: 適切な設定
- **セキュリティヘッダー**: Helmet

## 📈 外部データ収集

### 対応ソース
- **Twitter API v2**: 議員のツイート収集
- **RSS フィード**: ブログ・公式サイトの更新
- **手動投稿**: 管理画面からの投稿

### 収集スケジュール
- 30分間隔での自動収集
- エラー時の再試行機能
- 重複データの防止

## 🎨 UI/UX 特徴

- **レスポンシブデザイン**: モバイル・タブレット・デスクトップ対応
- **モダンなUI**: Tailwind CSS + Framer Motion
- **アクセシビリティ**: WCAG 2.1 準拠
- **ダークモード**: 対応予定
- **多言語対応**: 日本語（将来英語対応予定）

## 🧪 テスト

```bash
# バックエンドテスト
cd backend
npm run test
npm run test:e2e

# フロントエンドテスト
cd frontend
npm run test
```

## 🚀 デプロイ

### Docker を使用したデプロイ
```bash
# バックエンド
cd backend
docker build -t transparency-backend .
docker run -p 3001:3001 transparency-backend

# フロントエンド
cd frontend
docker build -t transparency-frontend .
docker run -p 3000:3000 transparency-frontend
```

### 本番環境での推奨設定
- **データベース**: MySQL 8.0+ (本番用)
- **Webサーバー**: Nginx (リバースプロキシ)
- **SSL**: Let's Encrypt
- **監視**: ログ監視、パフォーマンス監視
- **バックアップ**: 定期的なデータベースバックアップ

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📝 ライセンス

このプロジェクトは MIT ライセンスの下で公開されています。詳細は [LICENSE](LICENSE) ファイルを参照してください。

## 📞 サポート

- **Issues**: GitHub Issues でバグ報告や機能要求
- **Discussions**: GitHub Discussions で質問や議論
- **Email**: info@transparency-platform.jp

## 🗺 ロードマップ

### Phase 1 (MVP) - 完了
- [x] 基本的な議員管理機能
- [x] 公約・投票システム
- [x] 活動ログ・政務活動費管理
- [x] 外部データ収集
- [x] 管理画面

### Phase 2 (拡張)
- [ ] コメント機能
- [ ] 地域別フィルター
- [ ] データエクスポート機能
- [ ] モバイルアプリ
- [ ] 多言語対応

### Phase 3 (高度な機能)
- [ ] AI による活動分析
- [ ] 予測分析
- [ ] リアルタイム通知
- [ ] 高度な可視化

---

**市民参加型 透明性データプラットフォーム** - 政治の透明性向上と市民参加の促進を目指して
