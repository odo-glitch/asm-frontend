-- QUICK FIX: Run this entire script in Supabase Studio SQL Editor
-- This will create the reviews table and insert demo data

-- Step 1: Create reviews table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('google', 'facebook', 'yelp')),
  external_id TEXT,
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

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can insert reviews for their organization" ON public.reviews;
DROP POLICY IF EXISTS "Users can update reviews for their organization" ON public.reviews;

-- Create simplified RLS policies
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
  );

-- Step 2: Show your current organizations
SELECT 'Your Organizations:' as info;
SELECT o.id, o.name, o.slug, uo.role
FROM organizations o
JOIN user_organizations uo ON uo.organization_id = o.id
WHERE uo.user_id = auth.uid();

-- Step 3: Insert demo reviews for your FIRST organization
DO $$
DECLARE
  v_org_id UUID;
BEGIN
  -- Get your first organization ID
  SELECT organization_id INTO v_org_id
  FROM user_organizations
  WHERE user_id = auth.uid()
  LIMIT 1;
  
  IF v_org_id IS NOT NULL THEN
    RAISE NOTICE 'Inserting reviews for organization: %', v_org_id;
    
    -- Insert 5 demo reviews
    INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
    VALUES
      (v_org_id, 'google', 'google_demo_001', 'Jennifer Martinez', 5, 
       'Absolutely amazing service from Odo Market! Their social media management has transformed our online presence. Response times are incredible and the content quality is top-notch. Highly recommend to any business looking to grow their digital footprint!', 
       false, NOW() - INTERVAL '1 day'),
      
      (v_org_id, 'google', 'google_demo_002', 'David Thompson', 4, 
       'Really impressed with Odo Market''s professionalism. They helped us schedule posts across multiple platforms and the analytics insights have been invaluable for our marketing strategy. Great team to work with!', 
       false, NOW() - INTERVAL '3 days'),
      
      (v_org_id, 'google', 'google_demo_003', 'Rachel Kim', 5, 
       'Best decision we made for our business! Odo Market''s AI-powered tools saved us hours of work every week. The calendar feature is brilliant and their customer support is always quick to respond.', 
       false, NOW() - INTERVAL '5 days'),
      
      (v_org_id, 'facebook', 'fb_demo_001', 'Michael Chen', 5, 
       'Game changer for our social media strategy! Odo Market makes managing multiple accounts so easy. The AI content generation is surprisingly good and saves us tons of time. Worth every penny! 🚀', 
       false, NOW() - INTERVAL '2 days'),
      
      (v_org_id, 'facebook', 'fb_demo_002', 'Sarah Williams', 5, 
       'Love love LOVE this platform! As a small business owner, Odo Market has been essential for keeping up with our social media. The scheduling feature is perfect and I can manage everything from one place. Couldn''t do it without them! 💯', 
       false, NOW() - INTERVAL '4 days')
    ON CONFLICT (organization_id, platform, external_id) DO NOTHING;
    
    RAISE NOTICE 'Demo reviews inserted successfully!';
  ELSE
    RAISE NOTICE 'ERROR: No organization found for your user. Please create an organization first.';
  END IF;
END $$;

-- Step 4: Verify reviews were created
SELECT 'Reviews created:' as info;
SELECT 
  r.platform,
  r.author_name,
  r.rating,
  LEFT(r.text, 60) || '...' as preview
FROM reviews r
JOIN user_organizations uo ON uo.organization_id = r.organization_id
WHERE uo.user_id = auth.uid()
ORDER BY r.created_at DESC;
