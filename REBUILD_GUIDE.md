# 再ビルドガイド

## サーバー環境での再ビルド手順

### 1. 最新のコードを取得
```bash
cd /root/mvp
git pull
```

### 2. フロントエンドのみを再ビルド（推奨）
```bash
# フロントエンドコンテナを再ビルド（キャッシュなしで完全再ビルド）
docker compose build --no-cache frontend

# フロントエンドコンテナを再起動
docker compose up -d frontend

# ログを確認（Ctrl+Cで終了）
docker compose logs -f frontend
```

### 3. フロントエンドを再ビルド（キャッシュを使用、高速）
```bash
# キャッシュを使用して再ビルド（変更がない部分は再利用）
docker compose build frontend

# フロントエンドコンテナを再起動
docker compose up -d frontend

# ログを確認
docker compose logs -f frontend
```

### 4. すべてのサービスを再ビルド（必要に応じて）
```bash
# すべてのサービスを再ビルド
docker compose build

# すべてのサービスを再起動
docker compose up -d

# すべてのログを確認
docker compose logs -f
```

### 5. 特定のサービスのログのみ確認
```bash
# フロントエンドのログ
docker compose logs -f frontend

# バックエンドAPIのログ
docker compose logs -f api

# nginxのログ
docker compose logs -f nginx
```

## ローカル環境での再ビルド手順

### 開発環境（Next.js開発サーバー）
```bash
cd frontend
npm install  # 依存関係が変更された場合
npm run dev  # 開発サーバーを起動（ホットリロード対応）
```

### 本番環境と同じDocker環境でテスト
```bash
cd /Users/minowakeigo/Downloads/mvp

# フロントエンドを再ビルド
docker compose build frontend

# フロントエンドを起動
docker compose up -d frontend

# ログを確認
docker compose logs -f frontend
```

## トラブルシューティング

### ビルドが失敗する場合
```bash
# 古いイメージとコンテナを削除してから再ビルド
docker compose down
docker compose build --no-cache frontend
docker compose up -d frontend
```

### コンテナが起動しない場合
```bash
# コンテナの状態を確認
docker compose ps

# コンテナのログを確認
docker compose logs frontend

# コンテナを強制削除して再作成
docker compose rm -f frontend
docker compose up -d --build frontend
```

### ポートが既に使用されている場合
```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# プロセスを終了（必要に応じて）
kill -9 <PID>
```

## よく使うコマンド一覧

```bash
# コンテナの状態確認
docker compose ps

# コンテナの停止
docker compose stop frontend

# コンテナの起動
docker compose start frontend

# コンテナの再起動
docker compose restart frontend

# コンテナの削除（データは保持）
docker compose rm frontend

# コンテナとボリュームを削除（データも削除）
docker compose down -v

# イメージの確認
docker images | grep mvp

# 不要なイメージの削除
docker image prune -a
```

## 今回の修正内容の再ビルド

今回の修正はフロントエンドのみなので、以下のコマンドで再ビルドしてください：

```bash
cd /root/mvp
git pull
docker compose build frontend
docker compose up -d frontend
docker compose logs -f frontend
```

再ビルド後、ブラウザで以下を確認してください：
1. ログインページでログイン
2. `/campaign/survey`ページにアクセス
3. ブラウザのコンソール（F12）でログを確認
4. アンケートフォームが正しく表示されることを確認

