# Nginx 設定ファイル

このディレクトリには、Polimee プラットフォーム用の Nginx 設定ファイルが含まれています。

## 設定内容

### フロントエンド（polimee.com, www.polimee.com）
- ポート: 80（HTTP）
- 転送先: `frontend:3000`（Next.js アプリケーション）

### バックエンド API（api.polimee.com）
- ポート: 80（HTTP）
- 転送先: `api:10000`（NestJS アプリケーション）
- `/uploads/` パスは静的ファイルとして配信

## SSL 化について

現在は HTTP（80番ポート）のみで設定されています。SSL 化する場合は：

1. Certbot を使用して SSL 証明書を取得
2. `nginx.conf` に HTTPS（443番ポート）の設定を追加
3. HTTP から HTTPS へのリダイレクトを設定
4. `docker-compose.yml` の Nginx サービスのポート設定を更新

## 使用方法

```bash
# Docker Compose で起動
docker-compose up -d

# Nginx 設定の再読み込み（コンテナ内）
docker-compose exec nginx nginx -s reload
```

## 注意事項

- 本番環境では、必ず SSL（HTTPS）を有効にしてください
- 開発環境で直接アクセスする場合は、`docker-compose.yml` のポート設定のコメントアウトを解除してください

