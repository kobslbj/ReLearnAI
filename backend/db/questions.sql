-- 開啟 UUID extension（若尚未啟用）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 建立 questions 表格
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  folder_id UUID NOT NULL,
  description TEXT NOT NULL,
  options JSONB NOT NULL CHECK (
    jsonb_array_length(options) = 4
  ),
  answer CHAR(1) CHECK (answer IN ('A', 'B', 'C', 'D')),
  user_answer CHAR(1) CHECK (user_answer IN ('A', 'B', 'C', 'D')),
  note TEXT,
  analysis TEXT,
  review_times INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  -- 外鍵關聯
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_folder FOREIGN KEY (folder_id) REFERENCES folders(id)
);
