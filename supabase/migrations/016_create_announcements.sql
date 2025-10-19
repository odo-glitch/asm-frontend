-- Create announcements table for organization messages
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_announcements_organization ON announcements(organization_id);
CREATE INDEX idx_announcements_created_at ON announcements(created_at DESC);

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view announcements from their organizations
CREATE POLICY "Users can view organization announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = announcements.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

-- All organization members can create announcements
CREATE POLICY "Members can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = announcements.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Only admins and owners can update their own announcements
CREATE POLICY "Admins can update their announcements"
  ON announcements FOR UPDATE
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = announcements.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'owner')
    )
  );

-- Members can delete their own announcements, admins can delete any
CREATE POLICY "Members can delete announcements"
  ON announcements FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = announcements.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'owner')
    )
  );
