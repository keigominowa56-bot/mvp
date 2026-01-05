# 運営ユーザーの名前とアイコン画像の更新方法

## 概要
タイムラインで運営が投稿した際に名前が「ADMIN」と表示される問題を解決するため、データベース内の運営ユーザーの情報を更新します。

## 手順

### 1. 運営ユーザーの名前を更新

#### PostgreSQLの場合
```sql
-- すべての運営ユーザーの名前を「Polimee運営」に更新
UPDATE users
SET 
  name = 'Polimee運営',
  username = 'polimee_admin'
WHERE role = 'admin'
  AND (name IS NULL OR name = '' OR name = 'ADMIN');
```

#### 特定のメールアドレスの運営ユーザーを更新する場合
```sql
UPDATE users
SET 
  name = 'Polimee運営',
  username = 'polimee_admin'
WHERE email = 'info@keygo.jp'
  AND role = 'admin';
```

### 2. アイコン画像をアップロードして紐付ける

#### 方法1: 既存の画像ファイルを使用する場合

1. アイコン画像を`backend/uploads/`ディレクトリに配置
   ```bash
   # 例: admin-icon.png をアップロード
   cp admin-icon.png backend/uploads/
   ```

2. データベースを更新
   ```sql
   UPDATE users
   SET profileImageUrl = '/uploads/admin-icon.png'
   WHERE email = 'info@keygo.jp'
     AND role = 'admin';
   ```

#### 方法2: 管理画面からアップロードする場合

1. 管理画面（`https://admin.polimee.com`）にログイン
2. プロフィール編集ページにアクセス
3. プロフィール画像をアップロード
4. 自動的に`profileImageUrl`が設定されます

#### 方法3: API経由でアップロードする場合

```bash
# 1. 画像をアップロード
curl -X POST https://api.polimee.com/api/media/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@admin-icon.png" \
  -F "category=avatar"

# レスポンス例:
# {
#   "url": "/uploads/1767419756831-admin-icon.png",
#   "path": "/uploads/1767419756831-admin-icon.png",
#   "mediaId": "..."
# }

# 2. 返されたURLをユーザーのprofileImageUrlに設定
UPDATE users
SET profileImageUrl = '/uploads/1767419756831-admin-icon.png'
WHERE email = 'info@keygo.jp'
  AND role = 'admin';
```

### 3. 更新結果の確認

```sql
SELECT 
  id,
  email,
  name,
  username,
  role,
  profileImageUrl,
  created_at
FROM users
WHERE role = 'admin';
```

## 注意事項

- `profileImageUrl`は相対パス（`/uploads/...`）で保存されます
- フロントエンドで`getImageUrl()`関数が自動的に`https://api.polimee.com/uploads/...`に変換します
- 画像ファイルは`backend/uploads/`ディレクトリに配置する必要があります
- Nginxの設定で`/uploads/`パスが静的ファイルとして配信されることを確認してください

## トラブルシューティング

### 画像が表示されない場合

1. ファイルが`backend/uploads/`に存在するか確認
   ```bash
   ls -la backend/uploads/admin-icon.png
   ```

2. ファイルの権限を確認
   ```bash
   chmod 644 backend/uploads/admin-icon.png
   ```

3. Nginxの設定を確認
   - `nginx/conf.d/default.conf`の`location /uploads/`ブロックが正しく設定されているか

4. ブラウザのコンソールでエラーを確認
   - 画像URLが正しく生成されているか
   - CORSエラーが発生していないか

