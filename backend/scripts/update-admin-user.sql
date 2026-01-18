-- 運営ユーザーの名前とプロフィール画像を更新するSQL
-- 使用方法: psql -U admin -d mvp_database_g0ic -f update-admin-user.sql
-- または、データベースクライアントで直接実行

-- 1. 運営ユーザー（role='admin'）の名前を「Polimee運営」に更新
UPDATE users
SET 
  name = 'Polimee運営',
  username = 'polimee_admin'  -- ユーザー名も設定（オプション）
WHERE role = 'admin'
  AND (name IS NULL OR name = '' OR name = 'ADMIN');

-- 2. 特定のメールアドレス（例: info@keygo.jp）の運営ユーザーを更新する場合
-- UPDATE users
-- SET 
--   name = 'Polimee運営',
--   username = 'polimee_admin',
--   profileImageUrl = '/uploads/admin-icon.png'  -- アイコン画像のパスを設定
-- WHERE email = 'info@keygo.jp'
--   AND role = 'admin';

-- 3. すべての運営ユーザーにアイコン画像を設定する場合
-- UPDATE users
-- SET profileImageUrl = '/uploads/admin-icon.png'
-- WHERE role = 'admin'
--   AND (profileImageUrl IS NULL OR profileImageUrl = '');

-- 4. 更新結果を確認
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


