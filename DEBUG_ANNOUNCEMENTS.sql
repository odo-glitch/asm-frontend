-- Debug script to check announcement permissions

-- 1. Check if you're in any organizations
SELECT 
  uo.organization_id,
  uo.role,
  o.name as organization_name
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();

-- 2. Check current RLS policies on announcements
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'announcements';

-- 3. Test if you can insert (this will show the actual error)
-- Replace 'your-org-id-here' with an actual organization ID from query #1
-- INSERT INTO announcements (organization_id, user_id, title, message)
-- VALUES ('your-org-id-here', auth.uid(), 'Test', 'Testing permissions');
