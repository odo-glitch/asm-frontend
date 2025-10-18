-- Quick Fix: Reconnect superadmin to Odo Marketing organization
-- Run this in Supabase Studio > SQL Editor

-- Step 1: Check your current situation
SELECT 
  'Your User Info' as info_type,
  u.id as user_id,
  u.email,
  CASE WHEN sa.user_id IS NOT NULL THEN 'Yes' ELSE 'No' END as is_superadmin
FROM auth.users u
LEFT JOIN super_admins sa ON sa.user_id = u.id
WHERE u.email = auth.email(); -- Your current email

-- Step 2: Check Odo Marketing organization
SELECT 
  'Odo Marketing Org' as info_type,
  id as org_id,
  name,
  slug,
  created_at
FROM organizations
WHERE name = 'Odo Marketing';

-- Step 3: Check current organization connections
SELECT 
  'Current Connections' as info_type,
  uo.user_id,
  uo.organization_id,
  o.name as org_name,
  uo.role
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid();

-- Step 4: FIX - Reconnect you to Odo Marketing organization
INSERT INTO user_organizations (user_id, organization_id, role, joined_at)
SELECT 
  auth.uid(),  -- Your user ID
  o.id,        -- Odo Marketing org ID
  'owner',     -- Your role
  NOW()
FROM organizations o
WHERE o.name = 'Odo Marketing'
ON CONFLICT (user_id, organization_id) 
DO UPDATE SET 
  role = 'owner',
  joined_at = NOW();

-- Step 5: Insert demo reviews with correct organization
INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
SELECT 
  o.id,
  'google',
  'google_demo_001',
  'Jennifer Martinez',
  5,
  'Absolutely amazing service from Odo Market! Their social media management has transformed our online presence. Response times are incredible and the content quality is top-notch. Highly recommend to any business looking to grow their digital footprint!',
  false,
  NOW() - INTERVAL '1 day'
FROM organizations o
WHERE o.name = 'Odo Marketing'
ON CONFLICT (organization_id, platform, external_id) DO NOTHING;

INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
SELECT 
  o.id,
  'google',
  'google_demo_002',
  'David Thompson',
  4,
  'Really impressed with Odo Market''s professionalism. They helped us schedule posts across multiple platforms and the analytics insights have been invaluable for our marketing strategy. Great team to work with!',
  false,
  NOW() - INTERVAL '3 days'
FROM organizations o
WHERE o.name = 'Odo Marketing'
ON CONFLICT (organization_id, platform, external_id) DO NOTHING;

INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
SELECT 
  o.id,
  'google',
  'google_demo_003',
  'Rachel Kim',
  5,
  'Best decision we made for our business! Odo Market''s AI-powered tools saved us hours of work every week. The calendar feature is brilliant and their customer support is always quick to respond.',
  false,
  NOW() - INTERVAL '5 days'
FROM organizations o
WHERE o.name = 'Odo Marketing'
ON CONFLICT (organization_id, platform, external_id) DO NOTHING;

INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
SELECT 
  o.id,
  'facebook',
  'fb_demo_001',
  'Michael Chen',
  5,
  'Game changer for our social media strategy! Odo Market makes managing multiple accounts so easy. The AI content generation is surprisingly good and saves us tons of time. Worth every penny! 🚀',
  false,
  NOW() - INTERVAL '2 days'
FROM organizations o
WHERE o.name = 'Odo Marketing'
ON CONFLICT (organization_id, platform, external_id) DO NOTHING;

INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
SELECT 
  o.id,
  'facebook',
  'fb_demo_002',
  'Sarah Williams',
  5,
  'Love love LOVE this platform! As a small business owner, Odo Market has been essential for keeping up with our social media. The scheduling feature is perfect and I can manage everything from one place. Couldn''t do it without them! 💯',
  false,
  NOW() - INTERVAL '4 days'
FROM organizations o
WHERE o.name = 'Odo Marketing'
ON CONFLICT (organization_id, platform, external_id) DO NOTHING;

-- Step 6: Verify everything worked
SELECT 
  'Final Verification' as check_type,
  COUNT(*) as count
FROM user_organizations uo
JOIN organizations o ON o.id = uo.organization_id
WHERE uo.user_id = auth.uid()
  AND o.name = 'Odo Marketing';

SELECT 
  'Demo Reviews Created' as check_type,
  COUNT(*) as count
FROM reviews r
JOIN organizations o ON o.id = r.organization_id
WHERE o.name = 'Odo Marketing';

-- You should see:
-- 1 in the first count (your connection)
-- 5 in the second count (the demo reviews)
