# Reviews Management Demo - API Access Request

This demo showcases the review management system built for requesting API access from Google and Facebook.

## Overview

The Reviews page (`/reviews`) demonstrates how Odo Market will use API access to:
- **Google Business Profile API**: Fetch and respond to customer reviews
- **Facebook Pages API**: Manage Facebook page reviews
- **AI-Powered Replies**: Generate professional, contextual responses using OpenAI

## Demo Features

### 1. **Multi-Platform Review Management**
- Displays reviews from Google Business Profile (Odo Market)
- Shows Facebook Page reviews (Odo Market)
- Each review card prominently displays the business profile name

### 2. **AI Reply Generation**
- Click on any review to select it
- Use the "Generate AI Reply" button to create a professional response
- AI analyzes the review sentiment and rating to generate appropriate replies
- Edit the generated reply before sending

### 3. **Review Statistics**
- Total reviews count
- Average rating calculation
- Pending replies tracker
- Response rate percentage

## Setup Instructions

### 1. Run Database Migration
```bash
cd asm
supabase db push
```

This will create the `reviews` table and populate it with sample data showing:
- 3 Google Business Profile reviews (Odo Market)
- 2 Facebook Page reviews (Odo Market)

### 2. Verify OpenAI API Key
Ensure your `.env.local` file has:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. Access the Demo
Navigate to: `http://localhost:3000/reviews` (or your deployed URL)

## Using the Demo for API Access Requests

### For Google My Business API Request:
1. Navigate to `/reviews`
2. Show the demo notice banner explaining the integration
3. Point out the "Google Business Profile (Odo Market)" sections
4. Demonstrate clicking a Google review
5. Show the AI reply generation feature
6. Explain how this will help respond to customers faster

### For Facebook Graph API Request:
1. Show the Facebook Page (Odo Market) reviews
2. Demonstrate the same reply workflow
3. Explain the centralized management benefits

## Sample Reviews Included

### Google Business Profile (Odo Market)
- **Jennifer Martinez** (5 stars) - Praises social media management transformation
- **David Thompson** (4 stars) - Impressed with professionalism and analytics
- **Rachel Kim** (5 stars) - Highlights AI tools and calendar features

### Facebook Page (Odo Market)
- **Michael Chen** (5 stars) - Calls it a game changer for multi-account management
- **Sarah Williams** (5 stars) - Small business owner testimonial

## Key Points for API Access Request

**Why we need Google Business Profile API access:**
- Centralize review management for businesses
- Enable faster response times with AI assistance
- Improve customer satisfaction and online reputation
- Provide analytics on review sentiment and trends

**Why we need Facebook Pages API access:**
- Unified dashboard for all social media reviews
- Consistent brand voice across platforms
- Automated response suggestions
- Better customer engagement tracking

## Technical Implementation

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui, TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI GPT-3.5-turbo
- **Authentication**: Supabase Auth with RLS policies

## Files Structure

```
src/
├── app/
│   ├── reviews/
│   │   └── page.tsx                    # Main reviews page
│   └── api/
│       └── reviews/
│           ├── route.ts                # Fetch/create reviews
│           ├── generate-reply/
│           │   └── route.ts           # AI reply generation
│           └── reply/
│               └── route.ts           # Save replies
supabase/
└── migrations/
    └── 011_create_reviews_table.sql    # Database schema + sample data
```

## Next Steps After API Approval

1. **Google My Business Integration**:
   - Implement OAuth flow for Google My Business
   - Add webhook for new review notifications
   - Enable direct reply posting to Google

2. **Facebook Pages Integration**:
   - Implement Facebook OAuth
   - Set up webhooks for review updates
   - Add reply posting to Facebook Graph API

3. **Enhanced Features**:
   - Sentiment analysis dashboard
   - Automated reply suggestions based on business guidelines
   - Review trend analytics
   - Multi-location support

## Support

For questions about this demo or API integration:
- Review the code in `/src/app/reviews/`
- Check API routes in `/src/app/api/reviews/`
- See database schema in `/supabase/migrations/011_create_reviews_table.sql`
