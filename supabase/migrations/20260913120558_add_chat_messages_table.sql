/*
# Add chat_messages table for AI conversation history

1. Purpose
Stores the back-and-forth conversation between the writer and the AI story builder.
The AI asks casual questions, the writer answers, and the AI extracts structured
story data from the answers to populate all 8 layers automatically.

2. New Tables
- `chat_messages` — conversation history
  - `id` (uuid, primary key)
  - `project_id` (uuid, FK to projects)
  - `role` (text: 'user' or 'assistant')
  - `content` (text: the message text)
  - `data` (jsonb: extracted entities, confidence levels, gap flags, etc.)
  - `created_at` (timestamp)

3. Security
- RLS enabled, anon + authenticated full CRUD (single-tenant, no auth).
*/

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL DEFAULT '',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chat_messages" ON chat_messages;
CREATE POLICY "anon_select_chat_messages" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chat_messages" ON chat_messages;
CREATE POLICY "anon_insert_chat_messages" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chat_messages" ON chat_messages;
CREATE POLICY "anon_update_chat_messages" ON chat_messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chat_messages" ON chat_messages;
CREATE POLICY "anon_delete_chat_messages" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_chat_messages_project ON chat_messages(project_id, created_at);
