-- ============================================
-- CREATE BRAND PROFILES TABLE
-- Run this in Supabase SQL Editor
-- ============================================

-- Drop table if exists (for clean reinstall)
DROP TABLE IF EXISTS public.brand_profiles CASCADE;

-- Create brand_profiles table
CREATE TABLE public.brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name TEXT,
  industry TEXT,
  tone_of_voice TEXT,
  target_audience TEXT,
  key_values TEXT,
  unique_selling_points TEXT,
  brand_personality TEXT,
  content_guidelines TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_brand_profile UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own brand profile" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can insert their own brand profile" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can update their own brand profile" ON public.brand_profiles;
DROP POLICY IF EXISTS "Users can delete their own brand profile" ON public.brand_profiles;

-- Create policies
CREATE POLICY "Users can view their own brand profile"
  ON public.brand_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own brand profile"
  ON public.brand_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own brand profile"
  ON public.brand_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own brand profile"
  ON public.brand_profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_brand_profiles_user_id ON public.brand_profiles(user_id);

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS brand_profiles_updated_at ON public.brand_profiles;
DROP FUNCTION IF EXISTS update_brand_profiles_updated_at();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_brand_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER brand_profiles_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_profiles_updated_at();

-- Grant permissions
GRANT ALL ON public.brand_profiles TO authenticated;
GRANT ALL ON public.brand_profiles TO service_role;

-- Verify table was created
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'brand_profiles'
ORDER BY ordinal_position;
