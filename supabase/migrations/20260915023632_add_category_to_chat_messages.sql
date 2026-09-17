ALTER TABLE chat_messages ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'story';

CREATE INDEX IF NOT EXISTS idx_chat_messages_category ON chat_messages(project_id, category, created_at);
