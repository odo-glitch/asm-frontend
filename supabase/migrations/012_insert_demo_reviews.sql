-- Insert demo reviews for the reviews page
-- This adds sample data for demonstration purposes

-- First, let's get the organization_id from user_organizations
-- Replace with your actual organization if needed

INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
SELECT 
  uo.organization_id,
  'google',
  'google_demo_001',
  'Jennifer Martinez',
  5,
  'Absolutely amazing service from Odo Market! Their social media management has transformed our online presence. Response times are incredible and the content quality is top-notch. Highly recommend to any business looking to grow their digital footprint!',
  false,
  NOW() - INTERVAL '1 day'
FROM user_organizations uo
LIMIT 1
ON CONFLICT (organization_id, platform, external_id) DO NOTHING;

INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
SELECT 
  uo.organization_id,
  'google',
  'google_demo_002',
  'David Thompson',
  4,
  'Really impressed with Odo Market''s professionalism. They helped us schedule posts across multiple platforms and the analytics insights have been invaluable for our marketing strategy. Great team to work with!',
  false,
  NOW() - INTERVAL '3 days'
FROM user_organizations uo
LIMIT 1
ON CONFLICT (organization_id, platform, external_id) DO NOTHING;

INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
SELECT 
  uo.organization_id,
  'google',
  'google_demo_003',
  'Rachel Kim',
  5,
  'Best decision we made for our business! Odo Market''s AI-powered tools saved us hours of work every week. The calendar feature is brilliant and their customer support is always quick to respond.',
  false,
  NOW() - INTERVAL '5 days'
FROM user_organizations uo
LIMIT 1
ON CONFLICT (organization_id, platform, external_id) DO NOTHING;

INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
SELECT 
  uo.organization_id,
  'facebook',
  'fb_demo_001',
  'Michael Chen',
  5,
  'Game changer for our social media strategy! Odo Market makes managing multiple accounts so easy. The AI content generation is surprisingly good and saves us tons of time. Worth every penny! 🚀',
  false,
  NOW() - INTERVAL '2 days'
FROM user_organizations uo
LIMIT 1
ON CONFLICT (organization_id, platform, external_id) DO NOTHING;

INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
SELECT 
  uo.organization_id,
  'facebook',
  'fb_demo_002',
  'Sarah Williams',
  5,
  'Love love LOVE this platform! As a small business owner, Odo Market has been essential for keeping up with our social media. The scheduling feature is perfect and I can manage everything from one place. Couldn''t do it without them! 💯',
  false,
  NOW() - INTERVAL '4 days'
FROM user_organizations uo
LIMIT 1
ON CONFLICT (organization_id, platform, external_id) DO NOTHING;
