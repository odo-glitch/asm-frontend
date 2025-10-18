-- FIX RLS POLICIES for Reviews
-- Run this in Supabase Studio SQL Editor

-- Step 1: Check your user_organizations connection
SELECT 
  'Your connection:' as info,
  uo.user_id,
  uo.organization_id,
  o.name as org_name,
  uo.role
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = '3bd45af5-dbb8-490b-8698-8f808cd0d319';

-- Step 2: Check reviews in that organization
SELECT 
  'Reviews in your org:' as info,
  COUNT(*) as count
FROM reviews
WHERE organization_id = '6b1ea06c-25cc-40b0-b16c-136899c2a2ba';

-- Step 3: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can update reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete reviews for their organization" ON public.reviews;

-- Step 4: Create WORKING RLS policies
-- These use a simpler approach that's more reliable

CREATE POLICY "Enable read access for organization members"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_organizations
      WHERE user_organizations.organization_id = reviews.organization_id
        AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable insert for organization members"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_organizations
      WHERE user_organizations.organization_id = reviews.organization_id
        AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable update for organization members"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_organizations
      WHERE user_organizations.organization_id = reviews.organization_id
        AND user_organizations.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM user_organizations
      WHERE user_organizations.organization_id = reviews.organization_id
        AND user_organizations.user_id = auth.uid()
    )
  );

CREATE POLICY "Enable delete for organization members"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM user_organizations
      WHERE user_organizations.organization_id = reviews.organization_id
        AND user_organizations.user_id = auth.uid()
    )
  );

-- Step 5: Verify policies are created
SELECT 
  'RLS Policies:' as info,
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'reviews'
ORDER BY policyname;

-- Step 6: Test the query that the API is running
SELECT *
FROM reviews
WHERE organization_id = '6b1ea06c-25cc-40b0-b16c-136899c2a2ba'
ORDER BY created_at DESC;
