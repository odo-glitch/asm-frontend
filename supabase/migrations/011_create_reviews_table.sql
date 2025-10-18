-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('google', 'facebook', 'yelp')),
  external_id TEXT, -- ID from the platform (e.g., Google review ID)
  author_name TEXT NOT NULL,
  author_image TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL,
  review_url TEXT,
  replied BOOLEAN DEFAULT FALSE,
  reply_text TEXT,
  replied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, platform, external_id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_organization_id ON public.reviews(organization_id);
CREATE INDEX IF NOT EXISTS idx_reviews_platform ON public.reviews(platform);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_replied ON public.reviews(replied);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can update reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can delete reviews for their organization" ON public.reviews;

-- Create RLS policies
CREATE POLICY "Users can view reviews for their organization"
  ON public.reviews
  FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reviews for their organization"
  ON public.reviews
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reviews for their organization"
  ON public.reviews
  FOR UPDATE
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

CREATE POLICY "Users can delete reviews for their organization"
  ON public.reviews
  FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id 
      FROM public.user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_reviews_updated_at_trigger ON public.reviews;
CREATE TRIGGER update_reviews_updated_at_trigger
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- Insert sample reviews for demo purposes
-- This demonstrates the review management and AI reply generation capabilities

DO $$
DECLARE
  org_id UUID;
BEGIN
  SELECT id INTO org_id FROM public.organizations LIMIT 1;
  
  IF org_id IS NOT NULL THEN
    -- Google Business Profile Reviews (Odo Market)
    INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at) VALUES
    (org_id, 'google', 'google_demo_001', 'Jennifer Martinez', 5, 'Absolutely amazing service from Odo Market! Their social media management has transformed our online presence. Response times are incredible and the content quality is top-notch. Highly recommend to any business looking to grow their digital footprint!', false, NOW() - INTERVAL '1 day'),
    (org_id, 'google', 'google_demo_002', 'David Thompson', 4, 'Really impressed with Odo Market''s professionalism. They helped us schedule posts across multiple platforms and the analytics insights have been invaluable for our marketing strategy. Great team to work with!', false, NOW() - INTERVAL '3 days'),
    (org_id, 'google', 'google_demo_003', 'Rachel Kim', 5, 'Best decision we made for our business! Odo Market''s AI-powered tools saved us hours of work every week. The calendar feature is brilliant and their customer support is always quick to respond.', false, NOW() - INTERVAL '5 days');
    
    -- Facebook Page Reviews (Odo Market)
    INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at) VALUES
    (org_id, 'facebook', 'fb_demo_001', 'Michael Chen', 5, 'Game changer for our social media strategy! Odo Market makes managing multiple accounts so easy. The AI content generation is surprisingly good and saves us tons of time. Worth every penny! 🚀', false, NOW() - INTERVAL '2 days'),
    (org_id, 'facebook', 'fb_demo_002', 'Sarah Williams', 5, 'Love love LOVE this platform! As a small business owner, Odo Market has been essential for keeping up with our social media. The scheduling feature is perfect and I can manage everything from one place. Couldn''t do it without them! 💯', false, NOW() - INTERVAL '4 days');
    
  END IF;
END $$;
