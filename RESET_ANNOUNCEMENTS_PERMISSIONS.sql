-- COMPLETE RESET OF ANNOUNCEMENTS PERMISSIONS
-- Run this if the previous migrations didn't work

-- ============================================
-- Step 1: Drop ALL existing policies
-- ============================================
DROP POLICY IF EXISTS "Users can view organization announcements" ON announcements;
DROP POLICY IF EXISTS "Members can create announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can create announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can update their announcements" ON announcements;
DROP POLICY IF EXISTS "Members can delete announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON announcements;
DROP POLICY IF EXISTS "Superadmin can view all announcements" ON announcements;
DROP POLICY IF EXISTS "Superadmin can manage all content" ON announcements;

-- ============================================
-- Step 2: Create fresh, simple policies
-- ============================================

-- Allow users to view announcements from their organizations
CREATE POLICY "view_org_announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = announcements.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Allow ALL organization members to create announcements
CREATE POLICY "create_announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = announcements.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Allow users to update their own announcements
CREATE POLICY "update_own_announcements"
  ON announcements FOR UPDATE
  USING (user_id = auth.uid());

-- Allow users to delete their own announcements OR admins to delete any
CREATE POLICY "delete_announcements"
  ON announcements FOR DELETE
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = announcements.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'owner', 'superadmin')
    )
  );

-- ============================================
-- Step 3: Verify policies were created
-- ============================================
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'announcements';
