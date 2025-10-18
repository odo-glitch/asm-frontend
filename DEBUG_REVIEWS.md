# Debug: Reviews Not Showing in localhost:3000

## Step 1: Check if the reviews table exists

Open Supabase Studio or run this SQL query:

```sql
SELECT * FROM public.reviews;
```

If the table doesn't exist, you need to create it first.

## Step 2: Create the reviews table

Run this command to create the table:

```bash
cd asm
supabase migration new create_reviews_table
```

Then copy the contents from `011_create_reviews_table.sql` to the new migration file.

OR, run the migration directly in Supabase Studio:

1. Go to your Supabase project
2. Navigate to SQL Editor
3. Paste the contents of `011_create_reviews_table.sql`
4. Run the query

## Step 3: Insert demo reviews

After the table is created, insert the demo data by running this SQL in Supabase Studio:

```sql
-- Check your organization ID first
SELECT * FROM user_organizations WHERE user_id = auth.uid();

-- Then insert reviews using that organization_id
-- Replace 'YOUR_ORG_ID' with the actual organization_id from above

INSERT INTO public.reviews (organization_id, platform, external_id, author_name, rating, text, replied, created_at)
VALUES
  ('YOUR_ORG_ID', 'google', 'google_demo_001', 'Jennifer Martinez', 5, 'Absolutely amazing service from Odo Market! Their social media management has transformed our online presence. Response times are incredible and the content quality is top-notch. Highly recommend to any business looking to grow their digital footprint!', false, NOW() - INTERVAL '1 day'),
  ('YOUR_ORG_ID', 'google', 'google_demo_002', 'David Thompson', 4, 'Really impressed with Odo Market''s professionalism. They helped us schedule posts across multiple platforms and the analytics insights have been invaluable for our marketing strategy. Great team to work with!', false, NOW() - INTERVAL '3 days'),
  ('YOUR_ORG_ID', 'google', 'google_demo_003', 'Rachel Kim', 5, 'Best decision we made for our business! Odo Market''s AI-powered tools saved us hours of work every week. The calendar feature is brilliant and their customer support is always quick to respond.', false, NOW() - INTERVAL '5 days'),
  ('YOUR_ORG_ID', 'facebook', 'fb_demo_001', 'Michael Chen', 5, 'Game changer for our social media strategy! Odo Market makes managing multiple accounts so easy. The AI content generation is surprisingly good and saves us tons of time. Worth every penny! 🚀', false, NOW() - INTERVAL '2 days'),
  ('YOUR_ORG_ID', 'facebook', 'fb_demo_002', 'Sarah Williams', 5, 'Love love LOVE this platform! As a small business owner, Odo Market has been essential for keeping up with our social media. The scheduling feature is perfect and I can manage everything from one place. Couldn''t do it without them! 💯', false, NOW() - INTERVAL '4 days');
```

## Step 4: Debug API endpoint

Visit this URL in your browser while logged in:
```
http://localhost:3000/api/reviews/debug
```

This will show you:
- If you're authenticated
- Your user organizations
- Reviews in the database
- Any errors

## Step 5: Check browser console

1. Open localhost:3000/reviews
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for any errors
5. Go to Network tab
6. Refresh the page
7. Check the `/api/reviews` request - what's the response?

## Quick Fix Option

If you want to bypass the organization check for testing, you can temporarily modify the API:

Edit `src/app/api/reviews/route.ts` line 26-28:

```typescript
// Comment out the organization check temporarily
// if (!userOrgs) {
//   return NextResponse.json({ reviews: [] });
// }

// Fetch ALL reviews for testing
const { data: reviews, error } = await supabase
  .from('reviews')
  .select('*')
  // .eq('organization_id', userOrgs.organization_id)  // Comment this out
  .order('created_at', { ascending: false });
```

## Common Issues:

1. **Not logged in**: Make sure you're logged in at localhost:3000
2. **Table doesn't exist**: Run the migration in Supabase Studio
3. **No organization**: Make sure your user has an organization in user_organizations table
4. **Wrong organization_id**: The demo reviews need to use YOUR organization_id

## To check everything is working:

1. Go to Supabase Studio > Table Editor
2. Select `reviews` table
3. You should see 5 reviews
4. Check that `organization_id` matches your `user_organizations` table

Let me know which step fails and I'll help you fix it!
