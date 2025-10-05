-- Step 1: Add Super Admin flag to auth.users metadata
-- Note: We can't directly modify the auth.users table structure, but we can use metadata
-- First, let's create a dedicated super_admins table for better control

CREATE TABLE super_admins (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  reason TEXT
);

-- Enable RLS on super_admins table
ALTER TABLE super_admins ENABLE ROW LEVEL SECURITY;

-- Only super admins can view the super admins list
CREATE POLICY "Only super admins can view super admins"
  ON super_admins FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid())
  );

-- Create a function to check if a user is a super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM super_admins WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function for current user
CREATE OR REPLACE FUNCTION is_current_user_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM super_admins WHERE user_id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert your user as the first super admin
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
-- You can find this in Supabase dashboard under Authentication > Users
-- INSERT INTO super_admins (user_id, reason) VALUES ('YOUR_USER_ID', 'Initial system administrator');

-- Step 2: Update all RLS policies to include Super Admin bypass

-- Drop and recreate policies for organizations table
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
CREATE POLICY "Users can view organizations"
  ON organizations FOR SELECT
  USING (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Only organization owners can update" ON organizations;
CREATE POLICY "Organization owners and super admins can update"
  ON organizations FOR UPDATE
  USING (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'owner'
    )
  );

DROP POLICY IF EXISTS "Any authenticated user can create an organization" ON organizations;
CREATE POLICY "Users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (
    is_current_user_super_admin() OR
    auth.uid() = created_by
  );

-- Add DELETE policy for organizations
CREATE POLICY "Organization owners and super admins can delete"
  ON organizations FOR DELETE
  USING (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'owner'
    )
  );

-- Drop and recreate policies for user_organizations table
DROP POLICY IF EXISTS "Users can view their organization memberships" ON user_organizations;
CREATE POLICY "Users can view organization memberships"
  ON user_organizations FOR SELECT
  USING (
    is_current_user_super_admin() OR
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_organizations uo2
      WHERE uo2.organization_id = user_organizations.organization_id
      AND uo2.user_id = auth.uid()
      AND uo2.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Organization owners and admins can manage members" ON user_organizations;
CREATE POLICY "Authorized users can add members"
  ON user_organizations FOR INSERT
  WITH CHECK (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM user_organizations uo
      WHERE uo.organization_id = user_organizations.organization_id
      AND uo.user_id = auth.uid()
      AND uo.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Organization owners and admins can update members" ON user_organizations;
CREATE POLICY "Authorized users can update members"
  ON user_organizations FOR UPDATE
  USING (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM user_organizations uo2
      WHERE uo2.organization_id = user_organizations.organization_id
      AND uo2.user_id = auth.uid()
      AND uo2.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Organization owners can remove members" ON user_organizations;
CREATE POLICY "Authorized users can remove members"
  ON user_organizations FOR DELETE
  USING (
    is_current_user_super_admin() OR
    user_id = auth.uid() OR -- Users can leave organizations
    EXISTS (
      SELECT 1 FROM user_organizations uo2
      WHERE uo2.organization_id = user_organizations.organization_id
      AND uo2.user_id = auth.uid()
      AND uo2.role = 'owner'
    )
  );

-- Update policies for organization_invitations
DROP POLICY IF EXISTS "Organization admins can view invitations" ON organization_invitations;
CREATE POLICY "Authorized users can view invitations"
  ON organization_invitations FOR SELECT
  USING (
    is_current_user_super_admin() OR
    email = auth.jwt()->>'email' OR
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organization_invitations.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

DROP POLICY IF EXISTS "Organization admins can create invitations" ON organization_invitations;
CREATE POLICY "Authorized users can create invitations"
  ON organization_invitations FOR INSERT
  WITH CHECK (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organization_invitations.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    )
  );

-- Update policies for social_accounts
DROP POLICY IF EXISTS "Users can view social accounts they have access to" ON social_accounts;
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

DROP POLICY IF EXISTS "Users can create social accounts" ON social_accounts;
CREATE POLICY "Authorized users can create social accounts"
  ON social_accounts FOR INSERT
  WITH CHECK (
    is_current_user_super_admin() OR
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = social_accounts.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

DROP POLICY IF EXISTS "Users can update their own social accounts" ON social_accounts;
CREATE POLICY "Authorized users can update social accounts"
  ON social_accounts FOR UPDATE
  USING (
    is_current_user_super_admin() OR
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = social_accounts.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

DROP POLICY IF EXISTS "Users can delete their own social accounts" ON social_accounts;
CREATE POLICY "Authorized users can delete social accounts"
  ON social_accounts FOR DELETE
  USING (
    is_current_user_super_admin() OR
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = social_accounts.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

-- Update policies for analytics_data
DROP POLICY IF EXISTS "Users can view analytics for their accounts" ON analytics_data;
CREATE POLICY "Users can view analytics"
  ON analytics_data FOR SELECT
  USING (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = analytics_data.account_id
      AND (
        (social_accounts.user_id = auth.uid() AND social_accounts.organization_id IS NULL) OR
        (social_accounts.organization_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM user_organizations
          WHERE user_organizations.organization_id = social_accounts.organization_id
          AND user_organizations.user_id = auth.uid()
        ))
      )
    )
  );

-- Update policies for messages
DROP POLICY IF EXISTS "Users can view messages for their accounts" ON messages;
CREATE POLICY "Users can view messages"
  ON messages FOR SELECT
  USING (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = messages.account_id
      AND (
        (social_accounts.user_id = auth.uid() AND social_accounts.organization_id IS NULL) OR
        (social_accounts.organization_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM user_organizations
          WHERE user_organizations.organization_id = social_accounts.organization_id
          AND user_organizations.user_id = auth.uid()
        ))
      )
    )
  );

-- Update policies for conversations
DROP POLICY IF EXISTS "Users can view conversations for their accounts" ON conversations;
CREATE POLICY "Users can view conversations"
  ON conversations FOR SELECT
  USING (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM social_accounts
      WHERE social_accounts.id = conversations.account_id
      AND (
        (social_accounts.user_id = auth.uid() AND social_accounts.organization_id IS NULL) OR
        (social_accounts.organization_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM user_organizations
          WHERE user_organizations.organization_id = social_accounts.organization_id
          AND user_organizations.user_id = auth.uid()
        ))
      )
    )
  );

-- Update policies for business_profiles
DROP POLICY IF EXISTS "Users can view their own business profile" ON business_profiles;
CREATE POLICY "Users can view business profiles"
  ON business_profiles FOR SELECT
  USING (
    is_current_user_super_admin() OR
    (auth.uid() = user_id AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = business_profiles.organization_id
      AND user_organizations.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can update their own business profile" ON business_profiles;
CREATE POLICY "Authorized users can update business profiles"
  ON business_profiles FOR UPDATE
  USING (
    is_current_user_super_admin() OR
    (auth.uid() = user_id AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = business_profiles.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

-- Update policies for business_metrics
DROP POLICY IF EXISTS "Users can view metrics for their business" ON business_metrics;
CREATE POLICY "Users can view business metrics"
  ON business_metrics FOR SELECT
  USING (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_metrics.business_profile_id
      AND (
        (business_profiles.user_id = auth.uid() AND business_profiles.organization_id IS NULL) OR
        (business_profiles.organization_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM user_organizations
          WHERE user_organizations.organization_id = business_profiles.organization_id
          AND user_organizations.user_id = auth.uid()
        ))
      )
    )
  );

-- Update policies for business_reviews
DROP POLICY IF EXISTS "Users can view reviews for their business" ON business_reviews;
CREATE POLICY "Users can view business reviews"
  ON business_reviews FOR SELECT
  USING (
    is_current_user_super_admin() OR
    EXISTS (
      SELECT 1 FROM business_profiles
      WHERE business_profiles.id = business_reviews.business_profile_id
      AND (
        (business_profiles.user_id = auth.uid() AND business_profiles.organization_id IS NULL) OR
        (business_profiles.organization_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM user_organizations
          WHERE user_organizations.organization_id = business_profiles.organization_id
          AND user_organizations.user_id = auth.uid()
        ))
      )
    )
  );

-- Create a helper view for super admins to see all organizations
CREATE OR REPLACE VIEW admin_all_organizations AS
SELECT 
  o.*,
  (SELECT COUNT(*) FROM user_organizations WHERE organization_id = o.id) as member_count,
  (SELECT COUNT(*) FROM social_accounts WHERE organization_id = o.id) as social_account_count
FROM organizations o
WHERE is_current_user_super_admin();

-- Create a helper view for super admins to see all users and their organizations
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

-- Instructions for manually adding super admin:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Find your user (odo@odomarketing.com) and copy the User UID
-- 3. Go to Table Editor > super_admins
-- 4. Insert a new row with:
--    - user_id: [Your User UID]
--    - reason: "Initial system administrator"