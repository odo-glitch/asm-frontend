-- Add organization_id and visibility to content_library table
ALTER TABLE content_library 
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
ADD COLUMN visibility TEXT DEFAULT 'organization' CHECK (visibility IN ('organization', 'all_organizations'));

-- Create index for organization queries
CREATE INDEX idx_content_library_organization ON content_library(organization_id);

-- Update RLS policies to support organization-based access
DROP POLICY IF EXISTS "Users can view their own content" ON content_library;

-- New policy: Users can view content they own OR content from their organizations
CREATE POLICY "Users can view accessible content"
  ON content_library FOR SELECT
  USING (
    -- User's own content (personal)
    (auth.uid() = user_id AND organization_id IS NULL) OR
    -- Content from organizations the user belongs to
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = content_library.organization_id
      AND user_organizations.user_id = auth.uid()
    )) OR
    -- Content marked as visible to all organizations (if user is in any organization)
    (visibility = 'all_organizations' AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.user_id = auth.uid()
    ))
  );

-- Update insert policy
DROP POLICY IF EXISTS "Users can insert their own content" ON content_library;

CREATE POLICY "Users can insert content"
  ON content_library FOR INSERT
  WITH CHECK (
    -- Personal content
    (auth.uid() = user_id AND organization_id IS NULL) OR
    -- Organization content (must be admin or owner)
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = content_library.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    ))
  );

-- Update the update policy
DROP POLICY IF EXISTS "Users can update their own content" ON content_library;

CREATE POLICY "Users can update accessible content"
  ON content_library FOR UPDATE
  USING (
    -- User's own content
    (auth.uid() = user_id AND organization_id IS NULL) OR
    -- Organization content (must be admin or owner)
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = content_library.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

-- Update delete policy
DROP POLICY IF EXISTS "Users can delete their own content" ON content_library;

CREATE POLICY "Users can delete accessible content"
  ON content_library FOR DELETE
  USING (
    -- User's own content
    (auth.uid() = user_id AND organization_id IS NULL) OR
    -- Organization content (must be admin or owner)
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = content_library.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

-- Similarly update content_folders to support organizations
ALTER TABLE content_folders 
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX idx_content_folders_organization ON content_folders(organization_id);

-- Update folders RLS policy
DROP POLICY IF EXISTS "Users can manage their own folders" ON content_folders;

CREATE POLICY "Users can view accessible folders"
  ON content_folders FOR SELECT
  USING (
    (auth.uid() = user_id AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = content_folders.organization_id
      AND user_organizations.user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can insert folders"
  ON content_folders FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = content_folders.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin', 'member')
    ))
  );

CREATE POLICY "Users can update folders"
  ON content_folders FOR UPDATE
  USING (
    (auth.uid() = user_id AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = content_folders.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );

CREATE POLICY "Users can delete folders"
  ON content_folders FOR DELETE
  USING (
    (auth.uid() = user_id AND organization_id IS NULL) OR
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = content_folders.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('owner', 'admin')
    ))
  );
