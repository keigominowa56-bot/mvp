-- docker/mysql/init/01-init.sql の内容
-- データベースの文字セット設定
ALTER DATABASE transparency_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- タイムゾーン設定
SET GLOBAL time_zone = '+09:00';
-- 権限の付与 
GRANT ALL PRIVILEGES ON transparency_platform.* TO 'transparency_user'@'%';
FLUSH PRIVILEGES;