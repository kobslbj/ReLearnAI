-- 開啟 UUID extension（若尚未啟用）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 建立 tokens 表格
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  value TEXT NOT NULL UNIQUE,
  expired_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- 外鍵關聯
  CONSTRAINT fk_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
