-- Persist group chat messages and per-user message reactions.

CREATE TABLE IF NOT EXISTS group_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id          UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id           UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  body              TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 500),
  author_name       TEXT,
  author_avatar_url TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS group_messages_group_created
  ON group_messages (group_id, created_at DESC);

CREATE TABLE IF NOT EXISTS group_message_reactions (
  message_id UUID REFERENCES group_messages(id) ON DELETE CASCADE NOT NULL,
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji      TEXT NOT NULL CHECK (emoji IN ('❤️', '😂', '🔥', '👍', '😮', '🎉')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (message_id, user_id)
);

CREATE INDEX IF NOT EXISTS group_message_reactions_message
  ON group_message_reactions (message_id);

ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_message_reactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "group_messages_select_member" ON group_messages;
CREATE POLICY "group_messages_select_member" ON group_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "group_messages_insert_member" ON group_messages;
CREATE POLICY "group_messages_insert_member" ON group_messages
FOR INSERT WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_messages.group_id
      AND group_members.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "group_message_reactions_select_member" ON group_message_reactions;
CREATE POLICY "group_message_reactions_select_member" ON group_message_reactions
FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM group_messages gm
    JOIN group_members member ON member.group_id = gm.group_id
    WHERE gm.id = group_message_reactions.message_id
      AND member.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "group_message_reactions_insert_own" ON group_message_reactions;
CREATE POLICY "group_message_reactions_insert_own" ON group_message_reactions
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "group_message_reactions_update_own" ON group_message_reactions;
CREATE POLICY "group_message_reactions_update_own" ON group_message_reactions
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "group_message_reactions_delete_own" ON group_message_reactions;
CREATE POLICY "group_message_reactions_delete_own" ON group_message_reactions
FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE TRIGGER group_message_reactions_updated_at
  BEFORE UPDATE ON group_message_reactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
