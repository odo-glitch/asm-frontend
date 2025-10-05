-- Create business profiles table
CREATE TABLE business_profiles (
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

-- Create business metrics table
CREATE TABLE business_metrics (
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

-- Create reviews table
CREATE TABLE business_reviews (
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

-- Create indexes
CREATE INDEX idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX idx_business_metrics_profile_date ON business_metrics(business_profile_id, date DESC);
CREATE INDEX idx_business_reviews_profile ON business_reviews(business_profile_id);
CREATE INDEX idx_business_reviews_platform ON business_reviews(platform);
CREATE INDEX idx_business_reviews_rating ON business_reviews(rating);
CREATE INDEX idx_business_reviews_date ON business_reviews(review_date DESC);

-- Enable RLS
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for business_profiles
CREATE POLICY "Users can view their own business profile"
  ON business_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own business profile"
  ON business_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business profile"
  ON business_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for business_metrics
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

-- RLS Policies for business_reviews
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

-- Triggers for updated_at
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_business_reviews_updated_at
  BEFORE UPDATE ON business_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();