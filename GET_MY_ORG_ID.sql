-- GET YOUR ACTUAL ORGANIZATION ID TO USE IN THE APP

-- ============================================
-- 1. Your User ID
-- ============================================
SELECT 
  'MY USER ID' as label,
  auth.uid() as value;

-- ============================================
-- 2. Your Organizations (THIS IS WHAT YOU NEED!)
-- ============================================
SELECT 
  'MY ORGANIZATIONS - COPY THE ID BELOW' as label,
  uo.organization_id as org_id_to_copy,
  o.name as organization_name,
  uo.role as my_role
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();

-- ============================================
-- 3. Test if you can insert with this org ID
-- ============================================
-- Copy the organization_id from query #2 above
-- Then uncomment and run this test (replace 'paste-org-id-here'):

-- DO $$
-- DECLARE
--   test_org_id UUID := 'paste-org-id-here'; -- PASTE YOUR ORG ID HERE
--   test_user_id UUID := auth.uid();
-- BEGIN
--   -- Test the policy check
--   IF EXISTS (
--     SELECT 1 FROM user_organizations
--     WHERE organization_id = test_org_id
--     AND user_id = test_user_id
--   ) THEN
--     RAISE NOTICE 'SUCCESS: You CAN create announcements for this org!';
--     RAISE NOTICE 'Organization ID: %', test_org_id;
--     RAISE NOTICE 'User ID: %', test_user_id;
--   ELSE
--     RAISE NOTICE 'FAILED: You CANNOT create announcements for this org';
--   END IF;
-- END $$;
