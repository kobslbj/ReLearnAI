

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    folder_id UUID NOT NULL REFERENCES folders(id),
    description TEXT NOT NULL,
    options JSONB NOT NULL,
    answer VARCHAR(1) NOT NULL CHECK (answer IN ('A', 'B', 'C', 'D')),
    user_answer VARCHAR(1) CHECK (user_answer IN ('A', 'B', 'C', 'D')),
    note TEXT,
    review_times INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

