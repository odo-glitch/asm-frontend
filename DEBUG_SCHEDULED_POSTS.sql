-- Debug script for scheduled posts issues

-- 1. Check if scheduled_posts table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'scheduled_posts'
) as table_exists;

-- 2. Check RLS policies on scheduled_posts
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'scheduled_posts';

-- 3. Check if you have any scheduled posts
SELECT 
  id,
  user_id,
  social_account_id,
  content,
  scheduled_time,
  status
FROM scheduled_posts
WHERE user_id = auth.uid()
LIMIT 5;

-- 4. Check if the social_accounts join works
SELECT 
  sp.*,
  sa.platform
FROM scheduled_posts sp
LEFT JOIN social_accounts sa ON sa.id = sp.social_account_id
WHERE sp.user_id = auth.uid()
LIMIT 5;

-- 5. Check your user ID
SELECT auth.uid() as my_user_id;

-- 6. Check if RLS is enabled on scheduled_posts
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'scheduled_posts';
