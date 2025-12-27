-- 議員プロフィール拡張テーブル（外部キーなし版）
CREATE TABLE IF NOT EXISTS politician_profiles (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL UNIQUE,
  name VARCHAR(255),
  district VARCHAR(255),
  party VARCHAR(255),
  bio TEXT,
  pledges TEXT,
  socialLinks JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_politician_profiles_userId (userId)
);

-- 政治資金記録（外部キーなし版）
CREATE TABLE IF NOT EXISTS political_funds (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  purpose VARCHAR(255) NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100),
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_political_funds_userId (userId),
  INDEX idx_political_funds_date (date)
);
