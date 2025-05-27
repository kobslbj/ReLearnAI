-- 開啟 UUID extension（若尚未啟用）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 建立 tokens 表格
CREATE TABLE IF NOT EXISTS tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  token_type VARCHAR(50) DEFAULT 'access' CHECK (token_type IN ('access', 'refresh')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 建立索引以提高查詢效能
CREATE INDEX IF NOT EXISTS idx_tokens_user_id ON tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_tokens_token_hash ON tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_tokens_expires_at ON tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_tokens_is_revoked ON tokens(is_revoked);

-- 建立自動更新 updated_at 的觸發器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tokens_updated_at 
    BEFORE UPDATE ON tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add foreign key constraint for users.token_id after tokens table exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'users_token_id_fkey'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_token_id_fkey 
        FOREIGN KEY (token_id) REFERENCES tokens(id) ON DELETE SET NULL;
    END IF;
END $$;
