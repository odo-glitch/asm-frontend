# Unified Inbox Setup Guide

## Overview
The Unified Inbox allows users to manage all their social media messages in one centralized location.

## Database Setup

### Running Migrations
Before using the Unified Inbox, you need to create the necessary database tables. Run the migration:

```bash
# If using Supabase CLI
npx supabase migration up

# Or manually run the SQL in Supabase Dashboard:
# 1. Go to SQL Editor in your Supabase dashboard
# 2. Copy the content from supabase/migrations/003_create_messages_tables.sql
# 3. Run the SQL
```

### Tables Created
1. **conversations** - Stores conversation metadata
2. **messages** - Stores individual messages

## Testing the Setup

### Check if tables exist
You can verify the tables were created by running this query in Supabase SQL Editor:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('conversations', 'messages');
```

### Insert test data (optional)
To test with some sample data:

```sql
-- Insert a test conversation
INSERT INTO conversations (
  user_id,
  platform,
  customer_id,
  customer_name,
  last_message,
  last_message_time,
  unread_count
) VALUES (
  auth.uid(), -- Current user
  'twitter',
  'test_customer_1',
  'Test Customer',
  'Hello, this is a test message!',
  NOW(),
  1
) RETURNING *;

-- Get the conversation ID from above, then insert a message
INSERT INTO messages (
  conversation_id,
  text,
  sender,
  timestamp
) VALUES (
  'YOUR_CONVERSATION_ID_HERE', -- Replace with ID from above
  'Hello, this is a test message!',
  'customer',
  NOW()
);
```

## Troubleshooting

### "relation does not exist" error
This means the tables haven't been created. Run the migration as described above.

### Authentication errors
Make sure you're logged in and have a valid session.

### No conversations showing
This is normal for new users. The app will show mock data if no real conversations exist.

## Integration with Social Platforms

To receive real messages from social platforms, you'll need to:

1. **Set up webhooks** for each platform
2. **Configure OAuth** for sending replies
3. **Implement platform-specific APIs**

### Twitter Integration
- Use Twitter API v2
- Set up Account Activity API for webhooks
- Required scopes: `dm.read`, `dm.write`

### Facebook Integration
- Use Facebook Messenger Platform
- Set up webhooks for message events
- Required permissions: `pages_messaging`

### LinkedIn Integration
- Use LinkedIn Messaging API
- Set up webhooks for message events
- Required scopes: `w_messages`

## Next Steps

1. Run the database migration
2. Test the inbox with mock data
3. Set up platform webhooks
4. Configure OAuth for each platform
5. Implement real-time updates with Supabase subscriptions