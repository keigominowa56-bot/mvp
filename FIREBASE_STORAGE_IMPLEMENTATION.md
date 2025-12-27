# Firebase Storage実装完了とエラー修正

## 実施日時
2025年12月21日

## 完了した作業

### 1. 優先度最高：投稿時の500エラー修正

#### 問題
- 管理画面（3001）から投稿を送信すると「Internal server error」が発生
- エラー原因: `Unknown authentication strategy "jwt"`

#### 修正内容
**backend/src/modules/auth/auth.module.ts**
- PassportModuleを追加
- JwtModuleをregisterAsyncで設定
- JwtStrategyをprovidersに追加
- exportsにJwtStrategy、PassportModuleを追加

```typescript
imports: [
  PassportModule.register({ defaultStrategy: 'jwt' }),
  JwtModule.registerAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
      secret: config.get<string>('JWT_SECRET') || 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  }),
],
providers: [AuthService, FirebaseAdminProvider, JwtStrategy],
```

### 2. データベーススキーマの拡張

#### Post Entityへのフィールド追加
**backend/src/entities/post.entity.ts**
- `imageUrl`: 画像URLを保存（TEXT型、nullable）
- `videoUrl`: 動画URLを保存（TEXT型、nullable）

#### PostsServiceの更新
**backend/src/modules/posts/posts.service.ts**
- createメソッドでimageUrlとvideoUrlをサポート

### 3. Firebase Storage設定

#### 管理画面（3001）のFirebase設定
**admin-frontend/lib/firebase.ts**
```typescript
import { getStorage } from 'firebase/storage';

const storage = getStorage(app);
export { app, auth, storage };
```

**Storageバケット情報:**
- バケット名: `seiji-a35f4.firebasestorage.app`
- リージョン: `us-central1`
- セキュリティルール: テストモード有効

### 4. 画像・動画アップロード機能実装

#### 管理画面の投稿作成ページ
**admin-frontend/app/posts/create/page.tsx**

**実装機能:**
- 画像ファイル選択（最大5MB）
- 動画ファイル選択（最大50MB）
- Firebase Storageへの自動アップロード
- アップロード進捗表示
- ダウンロードURL取得
- バックエンドへの投稿データ送信

**アップロードフロー:**
1. ユーザーがファイルを選択
2. ファイルサイズをチェック
3. Firebase Storageにアップロード（`images/` または `videos/` フォルダ）
4. ダウンロードURLを取得
5. タイトル、内容、メディアURLを含めて投稿作成

### 5. API型定義の更新

#### 管理画面APIクライアント
**admin-frontend/lib/api.ts**
```typescript
export type Post = {
  // 既存フィールド...
  imageUrl?: string;
  videoUrl?: string;
};

export async function createPost(data: {
  title: string;
  content: string;
  type: string;
  imageUrl?: string;
  videoUrl?: string;
}): Promise<Post>
```

#### フロントエンドAPIクライアント
**frontend/lib/api.ts**
- Post型にimageUrlとvideoUrlフィールドを追加
- 重複したエクスポートを削除

### 6. プロフィール情報取得（GET /api/auth/me）

#### 既存実装の確認
**backend/src/modules/auth/auth.controller.ts**
- `@Get('me')` エンドポイントが既に実装済み
- Firebase認証トークンを検証してユーザー情報を返却

**AuthService.getCurrentUser()の機能:**
- Firebase IDトークンを検証
- データベースからユーザー情報を取得
- ユーザー情報（id, email, name, role, kycStatus）を返却

## データフロー

### 投稿作成から表示まで

1. **管理画面（3001）で投稿作成**
   ```
   ユーザー入力 → ファイル選択
   ↓
   Firebase Storage へアップロード
   ↓
   ダウンロードURL取得
   ↓
   POST /api/posts (title, content, type, imageUrl, videoUrl)
   ↓
   MySQL postsテーブルに保存
   ```

2. **一般画面（3000）でタイムライン表示**
   ```
   GET /api/posts?limit=20
   ↓
   postsテーブルから取得（imageUrl, videoUrlを含む）
   ↓
   タイムラインに表示
   ↓
   画像・動画があれば表示・再生
   ```

## 修正されたエンドポイント

### 正常動作するエンドポイント
✅ `GET /api/posts` - 投稿一覧取得
✅ `POST /api/posts` - 投稿作成（JWT認証必須）
✅ `GET /api/posts/:id` - 投稿詳細取得
✅ `GET /api/auth/me` - 現在のユーザー情報取得

### 認証フロー
- 管理者・議員: JWT認証（Cookie: auth_token）
- 一般ユーザー: Firebase Authentication

## データベーススキーマ変更

### postsテーブル
TypeORMのsynchronize機能により、以下のカラムが自動追加されます：

```sql
ALTER TABLE posts
ADD COLUMN imageUrl TEXT NULL,
ADD COLUMN videoUrl TEXT NULL;
```

## 使用技術

### バックエンド
- NestJS
- TypeORM
- Passport JWT
- Firebase Admin SDK

### フロントエンド
- Next.js 14+
- Firebase SDK (Auth + Storage)
- TypeScript
- Tailwind CSS

### インフラ
- MySQL 8.0
- Firebase Storage
- Docker (MySQL)

## セキュリティ設定

### Firebase Storage セキュリティルール
現在はテストモードで、すべてのアクセスが許可されています。本番環境では以下のように変更してください：

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{imageId} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 5 * 1024 * 1024;
    }
    match /videos/{videoId} {
      allow read: if true;
      allow write: if request.auth != null && request.resource.size < 50 * 1024 * 1024;
    }
  }
}
```

## 起動方法

```bash
# MySQLデータベース
docker-compose up -d

# バックエンド（4000番ポート）
cd backend
npm run start:dev

# フロントエンド（3000番ポート）
cd frontend
npm run dev

# 管理画面（3001番ポート）
cd admin-frontend
npm run dev
```

## 動作確認手順

### 1. 管理画面から投稿作成
1. http://localhost:3001/admin/login にアクセス
2. 管理者アカウントでログイン（@keygo.jp ドメイン）
3. ダッシュボードで「新規投稿」ボタンをクリック
4. 投稿フォームに入力
   - タイトル
   - 内容
   - 投稿タイプ
   - 画像（オプション）
   - 動画（オプション）
5. 「投稿する」ボタンをクリック
6. アップロード中の進捗を確認
7. 投稿成功メッセージを確認

### 2. 一般画面でタイムライン確認
1. http://localhost:3000 にアクセス
2. タイムラインで投稿を確認
3. 画像・動画が表示されることを確認

### 3. プロフィール情報確認
1. http://localhost:3000 にFirebase認証でログイン
2. プロフィールページにアクセス
3. ユーザー情報が正しく表示されることを確認

## 残りの作業

以下の機能は今後実装が推奨されます：

### 高優先度
- [ ] 一般画面（3000）でのメディア表示コンポーネント実装
- [ ] 画像のサムネイル表示
- [ ] 動画プレイヤーの実装
- [ ] メディアのローディング状態表示

### 中優先度
- [ ] Firebase Storage セキュリティルールの本番環境向け調整
- [ ] 画像の自動リサイズ（Cloud Functions）
- [ ] 動画のトランスコード処理
- [ ] メディアの削除機能

### 低優先度
- [ ] メディアのプレビュー機能
- [ ] ドラッグ&ドロップアップロード
- [ ] 複数画像のアップロード
- [ ] 進捗バーの詳細表示

## トラブルシューティング

### 投稿時に500エラーが発生
✅ **修正済み** - JWT認証戦略の設定により解決

### プロフィール情報が取得できない
✅ **正常動作** - GET /api/auth/me エンドポイントが正しく実装済み

### ファイルアップロードが失敗
- Firebase Storageの設定を確認
- セキュリティルールを確認
- ファイルサイズ制限を確認（画像:5MB、動画:50MB）
- ブラウザのコンソールでエラーメッセージを確認

## 関連ドキュメント
- [TIMELINE_PROFILE_FIX.md](./TIMELINE_PROFILE_FIX.md) - タイムラインとプロフィール表示の修正
- [FIREBASE_FIX_SUMMARY.md](./FIREBASE_FIX_SUMMARY.md) - Firebase認証の修正
- [FIREBASE_FRONTEND_SETUP.md](./FIREBASE_FRONTEND_SETUP.md) - Firebaseフロントエンド設定
