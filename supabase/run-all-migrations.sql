-- Run this script to set up all database tables for the Social Media Manager

-- 1. Organizations table (must be created before social_accounts)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) DEFAULT auth.uid() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User organizations junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  invited_by UUID REFERENCES auth.users(id),
  invitation_accepted BOOLEAN DEFAULT false,
  UNIQUE(user_id, organization_id)
);

-- 3. Organization invitations table
CREATE TABLE IF NOT EXISTS organization_invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  token TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Social accounts table (updated to support organizations)
CREATE TABLE IF NOT EXISTS social_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry TIMESTAMPTZ,
  profile_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT social_accounts_owner_check 
    CHECK ((user_id IS NOT NULL AND organization_id IS NULL) OR (user_id IS NULL AND organization_id IS NOT NULL))
);

-- 2. Scheduled posts table
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  social_account_id UUID REFERENCES social_accounts(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'published', 'failed', 'cancelled')),
  published_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 3. Analytics data table
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

-- 4. Messages table for unified inbox
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

-- 5. Conversations table
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

-- 6. Business profiles table (updated to support organizations)
CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  business_type TEXT,
  description TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT business_profiles_owner_check 
    CHECK ((user_id IS NOT NULL AND organization_id IS NULL) OR (user_id IS NULL AND organization_id IS NOT NULL))
);

-- 7. Business metrics table
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

-- 8. Business reviews table
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

-- 9. Content library table
CREATE TABLE IF NOT EXISTS content_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('image', 'video', 'document')),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size BIGINT NOT NULL,
  mime_type VARCHAR(100),
  source VARCHAR(50) NOT NULL CHECK (source IN ('upload', 'canva', 'dropbox')),
  folder VARCHAR(100),
  tags TEXT[], -- Array of tags
  metadata JSONB, -- Store additional metadata like dimensions, duration, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Content folders table
CREATE TABLE IF NOT EXISTS content_folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR(100) NOT NULL,
  parent_id UUID REFERENCES content_folders(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name, parent_id)
);

-- Create super admins table
CREATE TABLE IF NOT EXISTS super_admins (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  reason TEXT
);

-- Enable RLS on super_admins
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Grant permissions on public schema to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Create super admin helper functions
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM super_admins WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_current_user_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create admin views
CREATE OR REPLACE VIEW admin_all_organizations AS
SELECT 
  o.*,
  (SELECT COUNT(*) FROM user_organizations WHERE organization_id = o.id) as member_count,
  (SELECT COUNT(*) FROM social_accounts WHERE organization_id = o.id) as social_account_count
FROM organizations o
WHERE is_current_user_super_admin();

CREATE OR REPLACE VIEW admin_user_organization_summary AS
SELECT 
  u.id,
  u.email,
  u.created_at as user_created_at,
  COUNT(DISTINCT uo.organization_id) as organization_count,
  ARRAY_AGG(DISTINCT o.name) as organization_names
FROM auth.users u
LEFT JOIN user_organizations uo ON u.id = uo.user_id
LEFT JOIN organizations o ON uo.organization_id = o.id
WHERE is_current_user_super_admin()
GROUP BY u.id, u.email, u.created_at;

-- Create all indexes
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_org ON user_organizations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_role ON user_organizations(role);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX IF NOT EXISTS idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX IF NOT EXISTS idx_social_accounts_user_id ON social_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_org ON social_accounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_user_id ON scheduled_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_social_account_id ON scheduled_posts(social_account_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_time ON scheduled_posts(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_analytics_data_account_date ON analytics_data(account_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_messages_account_id ON messages(account_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_account ON conversations(account_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_org ON business_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_business_metrics_profile_date ON business_metrics(business_profile_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_business_reviews_profile ON business_reviews(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_business_reviews_platform ON business_reviews(platform);
CREATE INDEX IF NOT EXISTS idx_business_reviews_rating ON business_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_business_reviews_date ON business_reviews(review_date DESC);
CREATE INDEX IF NOT EXISTS idx_content_library_user ON content_library(user_id);
CREATE INDEX IF NOT EXISTS idx_content_library_type ON content_library(type);
CREATE INDEX IF NOT EXISTS idx_content_library_folder ON content_library(folder);
CREATE INDEX IF NOT EXISTS idx_content_library_tags ON content_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_folders_user ON content_folders(user_id);

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_folders ENABLE ROW LEVEL SECURITY;

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
DROP POLICY IF EXISTS "Users can view their own content" ON content_library;
DROP POLICY IF EXISTS "Users can insert their own content" ON content_library;
DROP POLICY IF EXISTS "Users can update their own content" ON content_library;
DROP POLICY IF EXISTS "Users can delete their own content" ON content_library;
DROP POLICY IF EXISTS "Users can manage their own folders" ON content_folders;

-- Create RLS policies
-- Organizations policies
-- First, drop any existing policies
DROP POLICY IF EXISTS "Users can view organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners and super admins can update" ON organizations;
DROP POLICY IF EXISTS "Any authenticated user can create an organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can manage organizations" ON organizations;

-- Then create new policies with simplified checks
CREATE POLICY "Allow organization creation"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Allow organization viewing"
  ON organizations FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Allow organization updates"
  ON organizations FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Allow organization deletion"
  ON organizations FOR DELETE
  USING (created_by = auth.uid());

-- User organizations policies
CREATE POLICY "Users can view their organization memberships"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage organization memberships"
  ON user_organizations FOR INSERT
  WITH CHECK (
    -- Allow users to be added if they're the creator of the organization
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_id
      AND o.created_by = user_id
    )
    OR
    -- Allow organization owners/admins to add members
    EXISTS (
      SELECT 1 FROM user_organizations existing
      WHERE existing.organization_id = organization_id
      AND existing.user_id = auth.uid()
      AND existing.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization owners and admins can update members"
  ON user_organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations uo2
      WHERE uo2.organization_id = user_organizations.organization_id
      AND uo2.user_id = auth.uid()
      AND uo2.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization owners can remove members"
  ON user_organizations FOR DELETE
  USING (
    user_id = auth.uid() OR -- Users can leave organizations
    EXISTS (
      SELECT 1 FROM user_organizations uo2
      WHERE uo2.organization_id = user_organizations.organization_id
      AND uo2.user_id = auth.uid()
      AND uo2.role = 'owner'
    )
  );

-- Organization invitations policies
CREATE POLICY "Organization admins can view invitations"
  ON organization_invitations FOR SELECT
  USING (
    email = auth.jwt()->>'email' OR -- Users can see their own invitations
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organization_invitations.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can create invitations"
  ON organization_invitations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organization_invitations.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

-- Social accounts policies (updated to support organizations)
CREATE POLICY "Users can view accessible social accounts"
  ON social_accounts FOR SELECT
  USING (
    is_current_user_super_admin() OR
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = social_accounts.organization_id
      AND user_organizations.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create social accounts"
  ON social_accounts FOR INSERT
  WITH CHECK (
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = social_accounts.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

CREATE POLICY "Users can update social accounts"
  ON social_accounts FOR UPDATE
  USING (
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = social_accounts.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

CREATE POLICY "Users can delete social accounts"
  ON social_accounts FOR DELETE
  USING (
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = social_accounts.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'owner'
    ))
  );

-- Scheduled posts policies
CREATE POLICY "Users can view their own scheduled posts"
  ON scheduled_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scheduled posts"
  ON scheduled_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scheduled posts"
  ON scheduled_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scheduled posts"
  ON scheduled_posts FOR DELETE
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

-- Business profile policies (updated to support organizations)
CREATE POLICY "Users can view business profiles they have access to"
  ON business_profiles FOR SELECT
  USING (
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = business_profiles.organization_id
      AND user_organizations.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create business profiles"
  ON business_profiles FOR INSERT
  WITH CHECK (
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = business_profiles.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

CREATE POLICY "Users can update business profiles"
  ON business_profiles FOR UPDATE
  USING (
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = business_profiles.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

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

-- Content library policies
CREATE POLICY "Users can view their own content"
  ON content_library FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content"
  ON content_library FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content"
  ON content_library FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content"
  ON content_library FOR DELETE
  USING (auth.uid() = user_id);

-- Content folders policies
CREATE POLICY "Users can manage their own folders"
  ON content_folders FOR ALL
  USING (auth.uid() = user_id);

-- Function to automatically add creator as owner when creating organization
CREATE OR REPLACE FUNCTION add_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the creator as owner (with ON CONFLICT to handle any race conditions)
  INSERT INTO user_organizations (user_id, organization_id, role, invitation_accepted)
  VALUES (NEW.created_by, NEW.id, 'owner', true)
  ON CONFLICT (user_id, organization_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle invitation acceptance
CREATE OR REPLACE FUNCTION accept_organization_invitation(invitation_token TEXT)
RETURNS TABLE (organization_id UUID, role TEXT) AS $$
DECLARE
  invitation RECORD;
  current_user_email TEXT;
BEGIN
  -- Get current user's email
  current_user_email := auth.jwt()->>'email';
  
  -- Find valid invitation
  SELECT * INTO invitation
  FROM organization_invitations
  WHERE token = invitation_token
    AND email = current_user_email
    AND expires_at > NOW()
    AND accepted_at IS NULL;
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Create user_organization entry
  INSERT INTO user_organizations (user_id, organization_id, role, invited_by, invitation_accepted)
  VALUES (auth.uid(), invitation.organization_id, invitation.role, invitation.invited_by, true)
  ON CONFLICT (user_id, organization_id) DO UPDATE
  SET role = EXCLUDED.role, invitation_accepted = true;
  
  -- Mark invitation as accepted
  UPDATE organization_invitations
  SET accepted_at = NOW()
  WHERE id = invitation.id;
  
  RETURN QUERY SELECT invitation.organization_id, invitation.role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to add organization creator
DROP TRIGGER IF EXISTS add_organization_creator ON organizations;
CREATE TRIGGER add_organization_creator
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_owner();

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_social_accounts_updated_at ON social_accounts;
CREATE TRIGGER update_social_accounts_updated_at
  BEFORE UPDATE ON social_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_scheduled_posts_updated_at ON scheduled_posts;
CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON scheduled_posts
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

DROP TRIGGER IF EXISTS update_content_library_updated_at ON content_library;
CREATE TRIGGER update_content_library_updated_at
  BEFORE UPDATE ON content_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Success message
SELECT 'All tables created successfully! Your database is ready for the Social Media Manager.' as message;