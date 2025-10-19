-- FIX: Ensure user is properly connected to an organization

-- ============================================
-- Step 1: Check your current user and organizations
-- ============================================
SELECT 
  'Current User Info' as info,
  auth.uid() as my_user_id,
  auth.email() as my_email;

SELECT 
  'My Organizations' as info,
  uo.organization_id,
  uo.role,
  o.name as organization_name
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();

-- ============================================
-- Step 2: Check if any organizations exist
-- ============================================
SELECT 
  'All Organizations' as info,
  id,
  name,
  created_at
FROM organizations
ORDER BY created_at DESC;

-- ============================================
-- Step 3: If you're not in any organization, add yourself
-- ============================================
-- UNCOMMENT AND RUN THIS if you have no organizations above:
-- 
-- First, get or create an organization:
-- INSERT INTO organizations (name)
-- VALUES ('My Organization')
-- RETURNING id, name;
-- 
-- Then add yourself to it (replace 'org-id-here' with the ID from above):
-- INSERT INTO user_organizations (user_id, organization_id, role)
-- VALUES (
--   auth.uid(),
--   'org-id-here',  -- Replace with actual organization ID
--   'superadmin'
-- )
-- ON CONFLICT (user_id, organization_id) DO UPDATE
-- SET role = 'superadmin';

-- ============================================
-- Step 4: Verify you're now in an organization
-- ============================================
SELECT 
  'Verification' as info,
  uo.organization_id,
  uo.role,
  o.name,
  EXISTS (
    SELECT 1 FROM user_organizations uo2
    WHERE uo2.organization_id = uo.organization_id
    AND uo2.user_id = auth.uid()
  ) as can_create_announcements
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();
