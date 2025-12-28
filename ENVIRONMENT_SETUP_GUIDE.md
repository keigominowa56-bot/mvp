# Render環境変数設定ガイド

## 1. JWT_SECRET の確認方法

ローカルの`.env`ファイルから確認してください：

```bash
cd backend
cat .env | grep JWT_SECRET
```

または、エディタで`backend/.env`ファイルを開いて、`JWT_SECRET=`の後の値をコピーしてください。

**例：**
```
JWT_SECRET=your_actual_jwt_secret_key_here_1234567890abcdef
```

この値をそのままRenderの環境変数`JWT_SECRET`に設定してください。

---

## 2. FIREBASE_PRIVATE_KEY の確認方法

ローカルの`.env`ファイルから確認してください：

```bash
cd backend
cat .env | grep FIREBASE_PRIVATE_KEY
```

**重要：** この値は複数行にわたる可能性があります。以下のように確認してください：

```bash
# 方法1: エディタで開く
code backend/.env  # または vim backend/.env

# 方法2: grepで確認（改行を含む）
cat backend/.env | grep -A 10 FIREBASE_PRIVATE_KEY
```

`.env`ファイル内で以下のような形式になっているはずです：

```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...（長い文字列）...END PRIVATE KEY-----\n"
```

**Renderに設定する際の注意点：**
- 引用符（`"`）は**含めない**でください
- `\n`（改行コード）は**そのまま**残してください
- 全体を1行で設定してください

**正しい設定例：**
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...（中略）...END PRIVATE KEY-----\n
```

---

## 3. CORS_ORIGINS と NEXT_PUBLIC_API_BASE_URL の設定方法

### ステップ1: Renderにフロントエンドをデプロイ

1. Renderでフロントエンド（Next.js）のサービスを作成
2. デプロイが完了したら、URLが発行されます
   - 例：`https://your-frontend-name.onrender.com`

### ステップ2: バックエンドの環境変数を設定

**バックエンドの`CORS_ORIGINS`に設定：**
```
https://your-frontend-name.onrender.com
```

**注意：** 複数のURLを設定する場合は、カンマ区切りで設定：
```
https://your-frontend-name.onrender.com,https://your-custom-domain.com
```

### ステップ3: フロントエンドの環境変数を設定

**フロントエンドの`NEXT_PUBLIC_API_BASE_URL`に設定：**
```
https://your-backend-name.onrender.com
```

**注意：** 
- `https://`で始まる完全なURLを設定してください
- 末尾に`/`（スラッシュ）は**付けない**でください
- 例：`https://your-backend-name.onrender.com` ✅
- 例：`https://your-backend-name.onrender.com/` ❌

---

## まとめ：設定の流れ

1. **ローカルで確認**
   - `backend/.env`から`JWT_SECRET`と`FIREBASE_PRIVATE_KEY`をコピー

2. **Renderにバックエンドをデプロイ**
   - 環境変数を設定（`JWT_SECRET`、`FIREBASE_PRIVATE_KEY`など）
   - デプロイ完了後、URLを確認（例：`https://your-backend.onrender.com`）

3. **Renderにフロントエンドをデプロイ**
   - `NEXT_PUBLIC_API_BASE_URL`にバックエンドのURLを設定
   - デプロイ完了後、URLを確認（例：`https://your-frontend.onrender.com`）

4. **バックエンドの環境変数を更新**
   - `CORS_ORIGINS`にフロントエンドのURLを設定
   - 再デプロイ（または環境変数の更新で自動再デプロイ）

---

## トラブルシューティング

### JWT_SECRETが見つからない場合
新しいJWT_SECRETを生成：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### FIREBASE_PRIVATE_KEYが正しく設定されない場合
- Firebase Consoleから再ダウンロードしてください
- サービスアカウントキー（JSON）をダウンロードし、`private_key`フィールドの値をコピー
- `\n`をそのまま含めて設定してください

### CORSエラーが発生する場合
- `CORS_ORIGINS`にフロントエンドのURLが正しく設定されているか確認
- プロトコル（`https://`）を含めてください
- 末尾にスラッシュがないか確認

