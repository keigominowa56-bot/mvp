# Docker Compose 環境設定ガイド

## データベース接続設定

Docker Compose環境では、サービス間の通信にサービス名を使用します。

### 重要な設定

1. **データベースホスト名**: Docker Compose内では `db` サービス名を使用
2. **ネットワーク**: すべてのサービスが `polimee-network` に接続されている必要があります

### docker-compose.yml の設定確認

`api` サービスには以下の環境変数が設定されています：

```yaml
environment:
  - DB_HOST=db          # Docker Composeのサービス名
  - DB_PORT=5432
  - DB_TYPE=postgres
  - DB_USERNAME=admin
  - DB_PASSWORD=password123
  - DB_DATABASE=mvp_database_g0ic
```

`db` サービスは `polimee-network` に接続されています：

```yaml
db:
  # ... 他の設定 ...
  networks:
    - polimee-network
```

### .env ファイルの設定

`.env` ファイルが存在する場合、以下のいずれかの形式で設定してください：

#### オプション1: 個別環境変数（推奨）

```env
DB_HOST=db
DB_PORT=5432
DB_TYPE=postgres
DB_USERNAME=admin
DB_PASSWORD=password123
DB_DATABASE=mvp_database_g0ic
```

#### オプション2: DATABASE_URL形式

```env
DATABASE_URL=postgresql://admin:password123@db:5432/mvp_database_g0ic
```

**重要**: 
- `DB_HOST` は必ず `db`（Docker Composeのサービス名）に設定してください
- `dpg-db` や外部ホスト名は使用しないでください
- `docker-compose.yml` の `environment` セクションで設定された値が優先されます

### トラブルシューティング

#### エラー: `getaddrinfo EAI_AGAIN db`

このエラーが発生する場合：

1. **ネットワーク設定の確認**
   ```bash
   docker compose ps
   docker network inspect mvp_polimee-network
   ```

2. **サービス名の確認**
   - `docker-compose.yml` で `db` サービスが定義されているか確認
   - `api` サービスの `DB_HOST` が `db` になっているか確認

3. **再起動**
   ```bash
   docker compose down
   docker compose up -d --build
   ```

4. **ログの確認**
   ```bash
   docker compose logs api | grep -i "database\|db_host\|error"
   ```

### 外部データベースを使用する場合

Render等の外部データベースを使用する場合は、`.env` ファイルで以下のように設定してください：

```env
# 外部データベースの場合
DB_HOST=your-external-db-host.com
DATABASE_URL=postgresql://user:password@your-external-db-host.com:5432/dbname
```

この場合、`docker-compose.yml` の `environment` セクションから `DB_HOST=db` を削除するか、コメントアウトしてください。

