-- Enable Supabase Realtime for group chat messages.

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE group_message_reactions;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
