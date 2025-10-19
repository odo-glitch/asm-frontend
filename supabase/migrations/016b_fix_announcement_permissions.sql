-- Fix announcement permissions - Run this to update existing policies

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Admins can create announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON announcements;
DROP POLICY IF EXISTS "Members can create announcements" ON announcements;
DROP POLICY IF EXISTS "Members can delete announcements" ON announcements;

-- Recreate with updated permissions
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
