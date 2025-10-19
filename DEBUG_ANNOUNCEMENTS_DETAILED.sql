-- COMPREHENSIVE DEBUG SCRIPT FOR ANNOUNCEMENTS

-- ============================================
-- 1. Check if announcements table exists
-- ============================================
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'announcements'
) as announcements_table_exists;

-- ============================================
-- 2. Check table columns
-- ============================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'announcements'
ORDER BY ordinal_position;

-- ============================================
-- 3. Check if RLS is enabled
-- ============================================
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'announcements';

-- ============================================
-- 4. Check current RLS policies
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'announcements';

-- ============================================
-- 5. Check your user info
-- ============================================
SELECT 
  auth.uid() as my_user_id,
  auth.email() as my_email;

-- ============================================
-- 6. Check your organizations and roles
-- ============================================
SELECT 
  uo.user_id,
  uo.organization_id,
  uo.role,
  o.name as organization_name
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();

-- ============================================
-- 7. Check if you can select from announcements
-- ============================================
SELECT COUNT(*) as announcement_count
FROM announcements;

-- ============================================
-- 8. Try to insert a test announcement (UNCOMMENT TO TEST)
-- ============================================
-- IMPORTANT: Replace 'your-org-id-here' with actual org ID from query #6
-- 
-- INSERT INTO announcements (organization_id, user_id, title, message)
-- VALUES (
--   'your-org-id-here',  -- Replace with your org ID
--   auth.uid(),
--   'Test Announcement',
--   'Testing permissions'
-- );

-- ============================================
-- 9. Check if there are any existing announcements
-- ============================================
SELECT 
  id,
  organization_id,
  user_id,
  title,
  message,
  created_at
FROM announcements
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- 10. Test policy match for your user
-- ============================================
-- This shows if you match the insert policy
SELECT 
  'Policy Match Test' as test,
  EXISTS (
    SELECT 1 FROM user_organizations
    WHERE user_organizations.organization_id = (
      SELECT organization_id FROM user_organizations WHERE user_id = auth.uid() LIMIT 1
    )
    AND user_organizations.user_id = auth.uid()
  ) as can_insert;
