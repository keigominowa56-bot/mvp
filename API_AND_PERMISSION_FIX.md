# APIパスの統一とadmin-frontendの権限・機能改修 完了レポート

## 実施日
2025/12/21

## 修正内容サマリー

### 1. フロントエンド（ポート3000）のAPIパス修正

#### 修正ファイル
- `frontend/lib/api.ts`
- `frontend/lib/api.reports.ts`

#### 修正内容
- 投票API: `/posts/:id/votes` → `/api/posts/:id/votes`
- コメントAPI: `/posts/:id/comments` → `/api/posts/:id/comments`
- 通報API: `/reports` → `/api/reports`
- プロフィール取得: `/api/auth/me` (LocalStorageトークンを正しく送信)

### 2. 投稿削除機能の実装（論理削除）

#### バックエンド修正
- **Entity** (`backend/src/entities/post.entity.ts`)
  - `deletedAt: Date | null` カラムを追加

- **Service** (`backend/src/modules/posts/posts.service.ts`)
  - `softDelete(id, userId, userRole)` メソッドを追加
  - 権限チェック: 議員は自分の投稿のみ、adminはすべて削除可能
  - 一覧取得時に `deletedAt IS NULL` でフィルタリング

- **Controller** (`backend/src/modules/posts/posts.controller.ts`)
  - `DELETE /api/posts/:id` エンドポイントを追加
  - JWTガードで保護

#### フロントエンド修正
- **API Client** (`admin-frontend/lib/api.ts`)
  - `deletePost(postId)` 関数を追加

- **ダッシュボード** (`admin-frontend/app/dashboard/page.tsx`)
  - 各投稿に「削除」ボタンを追加
  - 削除確認ダイアログを実装

### 3. 議員と運営のダッシュボード出し分け

#### 実装内容
- **議員（politician）**
  - 自分の投稿のみを表示
  - 自分の投稿のみ削除可能
  
- **運営（admin）**
  - すべての投稿を表示
  - すべての投稿を削除可能
  - 議員登録機能にアクセス可能

#### 修正ファイル
- `admin-frontend/app/dashboard/page.tsx`
  - ユーザーロールに基づいて投稿をフィルタリング
  - ダッシュボードタイトルを動的に変更

### 4. サイドバーの新規投稿メニュー有効化

#### 修正ファイル
- `admin-frontend/app/components/Sidebar.tsx`

#### 修正内容
- リンクパスを `/post/new` → `/posts/create` に修正
- LocalStorageからトークンを取得してユーザー情報を取得
- 管理者のみに「議員登録」メニューを表示

### 5. ログイン画面から新規登録リンクを削除

#### 修正ファイル
- `admin-frontend/app/admin/login/page.tsx`
  - 「新規登録はこちら」リンクを削除
  
- `admin-frontend/app/politician/login/page.tsx`
  - 「新規登録はこちら」リンクを削除
  - 注記を「議員アカウントは運営が登録します」に変更

### 6. 運営専用の議員登録機能実装

#### 新規作成ファイル
- `admin-frontend/app/users/register-politician/page.tsx`

#### 機能詳細
- 管理者権限チェック（非管理者は自動的にリダイレクト）
- 議員の名前、メール、パスワードを入力して登録
- フォームバリデーション（パスワード8文字以上）
- 成功/エラーメッセージの表示

#### バックエンド修正
- `backend/src/modules/auth/auth.controller.ts`
  - `POST /api/auth/register/politician` エンドポイントを追加
  - JWTガードと管理者権限チェックを実装

## データベース変更

### テーブル: posts
- 新規カラム: `deletedAt` (TIMESTAMP NULL)
- インデックス: `idx_posts_deleted_at`

**注意**: `deletedAt`カラムはすでに存在していました。

## 動作確認項目

### フロントエンド（ポート3000）
1. [ ] 投稿に対する投票が正常に動作するか
2. [ ] コメント投稿/取得が正常に動作するか
3. [ ] 通報機能が正常に動作するか
4. [ ] プロフィール情報が正しく表示されるか

### Admin Frontend（ポート3001）
1. [ ] 管理者ログイン → すべての投稿を表示
2. [ ] 管理者 → 任意の投稿を削除
3. [ ] 管理者 → 議員登録メニューが表示される
4. [ ] 管理者 → 議員アカウントを作成
5. [ ] 議員ログイン → 自分の投稿のみ表示
6. [ ] 議員 → 自分の投稿のみ削除可能
7. [ ] 議員 → 議員登録メニューが表示されない
8. [ ] 新規投稿リンクから投稿作成ページに遷移

## セキュリティ改善

1. **権限管理の強化**
   - 投稿削除は投稿者または管理者のみ
   - 議員登録は管理者のみ

2. **エンドポイント保護**
   - JWTトークンによる認証
   - ロールベースのアクセス制御

3. **データ保全**
   - 物理削除ではなく論理削除を採用
   - データは保持されるため、必要に応じて復元可能

## 注意事項

1. **パスワード管理**
   - 議員登録時に設定したパスワードは、議員に直接伝える必要があります
   - 初回ログイン後、パスワード変更を推奨してください

2. **論理削除**
   - 削除された投稿は `deletedAt` カラムにタイムスタンプが記録されます
   - 一覧には表示されませんが、データベースには残っています

3. **環境変数**
   - `NEXT_PUBLIC_API_BASE_URL` が正しく設定されていることを確認してください
   - デフォルト: `http://localhost:4000`

## 起動方法

### バックエンド
```bash
cd backend
npm run start:dev
```

### フロントエンド（ユーザー向け）
```bash
cd frontend
npm run dev
# http://localhost:3000
```

### Admin Frontend（管理画面）
```bash
cd admin-frontend
npm run dev
# http://localhost:3001
```

## 今後の推奨改善

1. **パスワードリセット機能**
   - 議員がパスワードを忘れた場合の復旧手段

2. **監査ログ**
   - 削除操作の記録（誰が、いつ、何を削除したか）

3. **削除の取り消し**
   - 管理者が誤って削除した投稿を復元する機能

4. **バッチ処理**
   - 一定期間経過後、論理削除された投稿を物理削除

5. **通知機能**
   - 議員アカウント作成時のメール通知

## 完了チェックリスト

- [x] フロントエンドのAPIパス修正（投票・コメント）
- [x] フロントエンドのAPIパス修正（通報）
- [x] バックエンドの投稿削除API実装（論理削除）
- [x] admin-frontendダッシュボードに削除ボタン追加
- [x] 議員と運営の権限に基づくダッシュボード出し分け実装
- [x] サイドバーの新規投稿メニュー有効化
- [x] ログイン画面から新規登録リンクを削除
- [x] 運営専用の議員登録機能実装
- [x] データベース確認（deletedAtカラム）

すべての修正が完了しました！
