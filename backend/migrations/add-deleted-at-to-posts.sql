-- 投稿テーブルに論理削除用のdeletedAtカラムを追加

ALTER TABLE posts 
ADD COLUMN deletedAt TIMESTAMP NULL DEFAULT NULL;

-- インデックスを追加して検索パフォーマンスを向上
CREATE INDEX idx_posts_deleted_at ON posts(deletedAt);
