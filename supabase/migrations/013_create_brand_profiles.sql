-- Create brand_profiles table
CREATE TABLE IF NOT EXISTS public.brand_profiles (
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
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.brand_profiles ENABLE ROW LEVEL SECURITY;

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
CREATE INDEX idx_brand_profiles_user_id ON public.brand_profiles(user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_brand_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER brand_profiles_updated_at
  BEFORE UPDATE ON public.brand_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_brand_profiles_updated_at();
