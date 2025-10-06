-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  social_account_id UUID REFERENCES social_accounts(id) NOT NULL,
  event_type VARCHAR(50) NOT NULL, -- 'impression', 'engagement', 'click', 'like', 'comment', 'share'
  platform VARCHAR(50) NOT NULL,
  post_id VARCHAR(255),
  value INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create post_analytics table
CREATE TABLE IF NOT EXISTS post_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  social_account_id UUID REFERENCES social_accounts(id) NOT NULL,
  post_id VARCHAR(255) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  content TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5, 2),
  posted_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create follower_history table
CREATE TABLE IF NOT EXISTS follower_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  social_account_id UUID REFERENCES social_accounts(id) NOT NULL,
  platform VARCHAR(50) NOT NULL,
  follower_count INTEGER NOT NULL,
  following_count INTEGER,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);
CREATE INDEX idx_analytics_events_account_created ON analytics_events(social_account_id, created_at DESC);
CREATE INDEX idx_post_analytics_user_posted ON post_analytics(user_id, posted_at DESC);
CREATE INDEX idx_post_analytics_account_posted ON post_analytics(social_account_id, posted_at DESC);
CREATE INDEX idx_follower_history_account_recorded ON follower_history(social_account_id, recorded_at DESC);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE follower_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own analytics events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own post analytics"
  ON post_analytics FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own follower history"
  ON follower_history FOR ALL
  USING (auth.uid() = user_id);