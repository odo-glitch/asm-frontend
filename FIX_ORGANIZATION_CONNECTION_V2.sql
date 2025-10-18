-- Quick Fix V2: Reconnect superadmin to Odo Marketing organization
-- Run this in Supabase Studio > SQL Editor

-- Step 1: Find your user ID from super_admins table
SELECT 
  'Your SuperAdmin User' as info,
  sa.user_id,
  u.email
FROM super_admins sa
JOIN auth.users u ON u.id = sa.user_id;

-- Step 2: Find Odo Marketing organization
SELECT 
  'Odo Marketing Org' as info,
  id as org_id,
  name,
  slug
FROM organizations
WHERE name = 'Odo Marketing';

-- Step 3: Now let's reconnect using a variable approach
DO $$
DECLARE
  v_user_id UUID;
  v_org_id UUID;
BEGIN
  -- Get the superadmin user ID
  SELECT user_id INTO v_user_id 
  FROM super_admins 
  LIMIT 1;
  
  -- Get Odo Marketing org ID
  SELECT id INTO v_org_id 
  FROM organizations 
  WHERE name = 'Odo Marketing' 
  LIMIT 1;
  
  -- Show what we found
  RAISE NOTICE 'User ID: %', v_user_id;
  RAISE NOTICE 'Org ID: %', v_org_id;
  
  -- Reconnect user to organization
  IF v_user_id IS NOT NULL AND v_org_id IS NOT NULL THEN
    INSERT INTO user_organizations (user_id, organization_id, role, joined_at)
    VALUES (v_user_id, v_org_id, 'owner', NOW())
    ON CONFLICT (user_id, organization_id) 
    DO UPDATE SET 
      role = 'owner',
      joined_at = NOW();
    
    RAISE NOTICE 'Successfully reconnected user to organization!';
    
    -- Insert demo reviews
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
    
    RAISE NOTICE 'Demo reviews inserted!';
  ELSE
    RAISE NOTICE 'ERROR: Could not find user or organization';
  END IF;
END $$;

-- Step 4: Verify the connection was created
SELECT 
  'Connection Verified' as status,
  u.email,
  o.name as organization,
  uo.role,
  uo.joined_at
FROM user_organizations uo
JOIN auth.users u ON u.id = uo.user_id
JOIN organizations o ON o.id = uo.organization_id
JOIN super_admins sa ON sa.user_id = uo.user_id
WHERE o.name = 'Odo Marketing';

-- Step 5: Verify reviews were created
SELECT 
  'Reviews Created' as status,
  COUNT(*) as review_count,
  COUNT(CASE WHEN platform = 'google' THEN 1 END) as google_reviews,
  COUNT(CASE WHEN platform = 'facebook' THEN 1 END) as facebook_reviews
FROM reviews r
JOIN organizations o ON o.id = r.organization_id
WHERE o.name = 'Odo Marketing';

-- Step 6: Show all reviews
SELECT 
  r.platform,
  r.author_name,
  r.rating,
  LEFT(r.text, 50) || '...' as review_preview,
  r.created_at
FROM reviews r
JOIN organizations o ON o.id = r.organization_id
WHERE o.name = 'Odo Marketing'
ORDER BY r.created_at DESC;
