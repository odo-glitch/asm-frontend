-- Create conversations table
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('twitter', 'facebook', 'linkedin', 'instagram')),
  customer_id TEXT NOT NULL, -- Platform-specific customer ID
  customer_name TEXT NOT NULL,
  customer_avatar TEXT,
  last_message TEXT,
  last_message_time TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Store platform-specific data
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform, customer_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  platform_message_id TEXT UNIQUE, -- Platform-specific message ID
  text TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'customer')),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}', -- Store attachments, reactions, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_platform ON conversations(platform);
CREATE INDEX idx_conversations_last_message_time ON conversations(last_message_time DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_timestamp ON messages(timestamp DESC);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for messages (through conversation ownership)
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages in their conversations"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Function to update conversation when new message is added
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    last_message = NEW.text,
    last_message_time = NEW.timestamp,
    unread_count = CASE 
      WHEN NEW.sender = 'customer' THEN unread_count + 1
      ELSE unread_count
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update conversation on new message
CREATE TRIGGER update_conversation_on_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();

-- Function to reset unread count when messages are marked as read
CREATE OR REPLACE FUNCTION reset_unread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.read = TRUE AND OLD.read = FALSE AND NEW.sender = 'customer' THEN
    UPDATE conversations
    SET unread_count = GREATEST(0, unread_count - 1)
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reset unread count
CREATE TRIGGER reset_unread_count_trigger
  AFTER UPDATE OF read ON messages
  FOR EACH ROW
  EXECUTE FUNCTION reset_unread_count();