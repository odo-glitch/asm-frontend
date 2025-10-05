-- Run this script to set up all database tables for the Social Media Manager

-- 1. Social accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  profile_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Analytics data table
CREATE TABLE IF NOT EXISTS analytics_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, date)
);

-- 3. Messages table for unified inbox
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  message_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  recipient_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_from_me BOOLEAN DEFAULT false,
  read BOOLEAN DEFAULT false,
  timestamp TIMESTAMPTZ NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, platform, message_id)
);

-- 4. Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  participant_name TEXT NOT NULL,
  participant_avatar TEXT,
  last_message_at TIMESTAMPTZ NOT NULL,
  unread_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(account_id, platform, conversation_id)
);

-- 5. Business profiles table
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Business metrics table
CREATE TABLE IF NOT EXISTS business_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_views INTEGER DEFAULT 0,
  total_searches INTEGER DEFAULT 0,
  total_actions INTEGER DEFAULT 0,
  website_clicks INTEGER DEFAULT 0,
  phone_calls INTEGER DEFAULT 0,
  directions_requests INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_profile_id, date)
);

-- 7. Business reviews table
CREATE TABLE IF NOT EXISTS business_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('google', 'facebook', 'yelp', 'tripadvisor')),
  platform_review_id TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  reviewer_name TEXT NOT NULL,
  reviewer_avatar TEXT,
  review_text TEXT NOT NULL,
  review_date DATE NOT NULL,
  replied BOOLEAN DEFAULT FALSE,
  reply_text TEXT,
  reply_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_profile_id, platform, platform_review_id)
);

-- Create all indexes
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_data_account_date ON analytics_data(account_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_account_id ON messages(account_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_account ON conversations(account_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_profile_date ON business_metrics(business_profile_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_business_reviews_profile ON business_reviews(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_platform ON business_reviews(platform);
CREATE INDEX IF NOT EXISTS idx_business_reviews_rating ON business_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_business_reviews_date ON business_reviews(review_date DESC);

-- Enable RLS on all tables
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can create their own social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can update their own social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can delete their own social accounts" ON social_accounts;
DROP POLICY IF EXISTS "Users can view analytics for their accounts" ON analytics_data;
DROP POLICY IF EXISTS "Users can insert analytics for their accounts" ON analytics_data;
DROP POLICY IF EXISTS "Users can view messages for their accounts" ON messages;
DROP POLICY IF EXISTS "Users can insert messages for their accounts" ON messages;
DROP POLICY IF EXISTS "Users can update messages for their accounts" ON messages;
DROP POLICY IF EXISTS "Users can view conversations for their accounts" ON conversations;
DROP POLICY IF EXISTS "Users can insert conversations for their accounts" ON conversations;
DROP POLICY IF EXISTS "Users can update conversations for their accounts" ON conversations;
DROP POLICY IF EXISTS "Users can view their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can create their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can update their own business profile" ON business_profiles;
DROP POLICY IF EXISTS "Users can view metrics for their business" ON business_metrics;
DROP POLICY IF EXISTS "Users can insert metrics for their business" ON business_metrics;
DROP POLICY IF EXISTS "Users can update metrics for their business" ON business_metrics;
DROP POLICY IF EXISTS "Users can view reviews for their business" ON business_reviews;
DROP POLICY IF EXISTS "Users can insert reviews for their business" ON business_reviews;
DROP POLICY IF EXISTS "Users can update reviews for their business" ON business_reviews;

-- Create RLS policies
-- Social accounts policies
CREATE POLICY "Users can view their own social accounts"
  ON social_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own social accounts"
  ON social_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social accounts"
  ON social_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social accounts"
  ON social_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Analytics data policies
CREATE POLICY "Users can view analytics for their accounts"
  ON analytics_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = analytics_data.account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert analytics for their accounts"
  ON analytics_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = analytics_data.account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

-- Messages policies
CREATE POLICY "Users can view messages for their accounts"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = messages.account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages for their accounts"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = messages.account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages for their accounts"
  ON messages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = messages.account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

-- Conversations policies
CREATE POLICY "Users can view conversations for their accounts"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = conversations.account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert conversations for their accounts"
  ON conversations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = conversations.account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update conversations for their accounts"
  ON conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = conversations.account_id
      AND social_accounts.user_id = auth.uid()
    )
  );

-- Business profile policies
CREATE POLICY "Users can view their own business profile"
  ON business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business profile"
  ON business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile"
  ON business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Business metrics policies
CREATE POLICY "Users can view metrics for their business"
  ON business_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_metrics.business_profile_id
      AND business_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert metrics for their business"
  ON business_metrics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_metrics.business_profile_id
      AND business_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update metrics for their business"
  ON business_metrics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_metrics.business_profile_id
      AND business_profiles.user_id = auth.uid()
    )
  );

-- Business reviews policies
CREATE POLICY "Users can view reviews for their business"
  ON business_reviews FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_reviews.business_profile_id
      AND business_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reviews for their business"
  ON business_reviews FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_reviews.business_profile_id
      AND business_profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reviews for their business"
  ON business_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_reviews.business_profile_id
      AND business_profiles.user_id = auth.uid()
    )
  );

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON social_accounts;
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_conversations_updated_at ON conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_business_reviews_updated_at ON business_reviews;
CREATE TRIGGER update_business_reviews_updated_at
  BEFORE UPDATE ON business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Success message
SELECT 'All tables created successfully! Your database is ready for the Social Media Manager.' as message;