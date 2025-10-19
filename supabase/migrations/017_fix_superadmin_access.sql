-- Fix all RLS policies to allow superadmin role access

-- ============================================
-- FIX ANNOUNCEMENTS POLICIES
-- ============================================

-- Drop and recreate announcement policies with superadmin support
DROP POLICY IF EXISTS "Users can view organization announcements" ON announcements;
DROP POLICY IF EXISTS "Members can create announcements" ON announcements;
DROP POLICY IF EXISTS "Admins can update their announcements" ON announcements;
DROP POLICY IF EXISTS "Members can delete announcements" ON announcements;

-- View announcements
CREATE POLICY "Users can view organization announcements"
  ON announcements FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = announcements.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Create announcements (all members including superadmin)
CREATE POLICY "Members can create announcements"
  ON announcements FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = announcements.organization_id
      AND user_organizations.user_id = auth.uid()
    )
  );

-- Update announcements (admins, owners, superadmin)
CREATE POLICY "Admins can update their announcements"
  ON announcements FOR UPDATE
  USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = announcements.organization_id
      AND user_organizations.user_id = auth.uid()
      AND user_organizations.role IN ('admin', 'owner', 'superadmin')
    )
  );

-- Delete announcements (own posts or admins/owners/superadmin)
CREATE POLICY "Members can delete announcements"
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
-- FIX CONTENT LIBRARY POLICIES (if needed)
-- ============================================

-- Check if content_library policies need updating
DROP POLICY IF EXISTS "Users can insert content" ON content_library;

CREATE POLICY "Users can insert content"
  ON content_library FOR INSERT
  WITH CHECK (
    -- Personal content
    (auth.uid() = user_id AND organization_id IS NULL) OR
    -- Organization content - user must be member
    (organization_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_organizations
      WHERE user_organizations.organization_id = content_library.organization_id
      AND user_organizations.user_id = auth.uid()
    ))
  );

-- ============================================
-- OPTIONAL: Grant superadmin full access
-- ============================================

-- If you want superadmin to have full access to everything, uncomment below:

-- Superadmin can view all announcements
-- CREATE POLICY "Superadmin can view all announcements"
--   ON announcements FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_organizations
--       WHERE user_organizations.user_id = auth.uid()
--       AND user_organizations.role = 'superadmin'
--     )
--   );

-- Superadmin can manage all content
-- CREATE POLICY "Superadmin can manage all content"
--   ON content_library FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_organizations
--       WHERE user_organizations.user_id = auth.uid()
--       AND user_organizations.role = 'superadmin'
--     )
--   );
