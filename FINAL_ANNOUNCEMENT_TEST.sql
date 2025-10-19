-- FINAL COMPREHENSIVE TEST FOR ANNOUNCEMENTS

-- ============================================
-- TEST 1: Your Identity
-- ============================================
SELECT '=== YOUR IDENTITY ===' as test;
SELECT 
  auth.uid() as user_id,
  auth.email() as email;

-- ============================================
-- TEST 2: Your Organizations
-- ============================================
SELECT '=== YOUR ORGANIZATIONS ===' as test;
SELECT 
  uo.organization_id,
  o.name,
  uo.role
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();

-- ============================================
-- TEST 3: Policy Definitions
-- ============================================
SELECT '=== CURRENT POLICIES ===' as test;
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'announcements'
ORDER BY cmd, policyname;

-- ============================================
-- TEST 4: Can You Select?
-- ============================================
SELECT '=== CAN YOU SELECT? ===' as test;
SELECT COUNT(*) as total_announcements
FROM announcements;

-- ============================================
-- TEST 5: Manual Insert Test
-- ============================================
SELECT '=== MANUAL INSERT TEST ===' as test;
-- Get your first organization
SELECT 
  'RUN THIS NEXT:' as instruction,
  format(
    'INSERT INTO announcements (organization_id, user_id, title, message) VALUES (%L, %L, %L, %L);',
    uo.organization_id,
    auth.uid(),
    'Test Announcement',
    'This is a test message'
  ) as insert_query_to_run
FROM user_organizations uo
WHERE uo.user_id = auth.uid()
LIMIT 1;

-- Copy and run the INSERT query from above ↑
-- If it works, the policies are fine and the issue is in the app
-- If it fails, tell me the exact error message

-- ============================================
-- TEST 6: Policy Check Result
-- ============================================
SELECT '=== POLICY CHECK RESULT ===' as test;
SELECT 
  uo.organization_id,
  o.name,
  EXISTS (
    SELECT 1 FROM user_organizations uo2
    WHERE uo2.organization_id = uo.organization_id
    AND uo2.user_id = auth.uid()
  ) as policy_would_allow
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();
