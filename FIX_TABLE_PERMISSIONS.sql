-- FIX TABLE PERMISSIONS for Reviews
-- Run this in Supabase Studio SQL Editor

-- Step 1: Grant permissions to authenticated users
GRANT ALL ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO anon;
GRANT ALL ON public.reviews TO service_role;

-- Step 2: Grant permissions on the sequence (for id generation)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 3: Re-enable RLS with proper policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop all existing policies
DROP POLICY IF EXISTS "Enable read access for organization members" ON public.reviews;
DROP POLICY IF EXISTS "Enable insert for organization members" ON public.reviews;
DROP POLICY IF EXISTS "Enable update for organization members" ON public.reviews;
DROP POLICY IF EXISTS "Enable delete for organization members" ON public.reviews;
DROP POLICY IF EXISTS "Users can view reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can update reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete reviews for their organization" ON public.reviews;

-- Step 5: Create simple, working policies
CREATE POLICY "authenticated_select_reviews"
  ON public.reviews
  FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated_insert_reviews"
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated_update_reviews"
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "authenticated_delete_reviews"
  ON public.reviews
  FOR DELETE
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Step 6: Verify setup
SELECT 'Permissions granted and RLS policies created successfully!' as status;

-- Show current policies
SELECT 
  policyname,
  cmd as command,
  permissive
FROM pg_policies
WHERE tablename = 'reviews'
ORDER BY policyname;
