-- Create organizations table
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  website TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_organizations junction table for many-to-many relationship
CREATE TABLE user_organizations (
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

-- Create organization_invitations table
CREATE TABLE organization_invitations (
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

-- Add organization_id to existing tables for multi-tenancy
ALTER TABLE social_accounts ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE business_profiles ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Update foreign key constraint on social_accounts to make user_id nullable for org accounts
ALTER TABLE social_accounts ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE social_accounts ADD CONSTRAINT social_accounts_owner_check 
  CHECK ((user_id IS NOT NULL AND organization_id IS NULL) OR (user_id IS NULL AND organization_id IS NOT NULL));

-- Update business_profiles to support organization profiles
ALTER TABLE business_profiles ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE business_profiles ADD CONSTRAINT business_profiles_owner_check 
  CHECK ((user_id IS NOT NULL AND organization_id IS NULL) OR (user_id IS NULL AND organization_id IS NOT NULL));

-- Create indexes
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_user_organizations_user ON user_organizations(user_id);
CREATE INDEX idx_user_organizations_org ON user_organizations(organization_id);
CREATE INDEX idx_user_organizations_role ON user_organizations(role);
CREATE INDEX idx_organization_invitations_email ON organization_invitations(email);
CREATE INDEX idx_organization_invitations_token ON organization_invitations(token);
CREATE INDEX idx_social_accounts_org ON social_accounts(organization_id);
CREATE INDEX idx_business_profiles_org ON business_profiles(organization_id);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view organizations they belong to"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Only organization owners can update"
  ON organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = organizations.id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role = 'owner'
    )
  );

CREATE POLICY "Any authenticated user can create an organization"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- RLS Policies for user_organizations
CREATE POLICY "Users can view their organization memberships"
  ON user_organizations FOR SELECT
  USING (user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_organizations uo2
      WHERE uo2.organization_id = user_organizations.organization_id
      AND uo2.user_id = auth.uid()
      AND uo2.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization owners and admins can manage members"
  ON user_organizations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = user_organizations.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
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

-- RLS Policies for organization_invitations
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

-- Update RLS policies for social_accounts to support organizations
DROP POLICY IF EXISTS "Users can view their own social accounts" ON social_accounts;
CREATE POLICY "Users can view social accounts they have access to"
  ON social_accounts FOR SELECT
  USING (
    (user_id = auth.uid() AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = social_accounts.organization_id
      AND user_organizations.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Users can create their own social accounts" ON social_accounts;
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

-- Function to automatically add creator as owner when creating organization
CREATE OR REPLACE FUNCTION add_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_organizations (user_id, organization_id, role, invitation_accepted)
  VALUES (NEW.created_by, NEW.id, 'owner', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_organization_creator
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION add_creator_as_owner();

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