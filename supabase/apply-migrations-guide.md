# How to Apply the Database Migrations

## The Issue
You're seeing the error: "Could not find the table 'public.user_organizations' in the schema cache"

This means the organizations-related tables haven't been created in your Supabase database yet.

## Solution

### Option 1: Run the Complete Migration Script (Recommended)
1. Open your Supabase project dashboard
2. Go to the SQL Editor section
3. Copy the entire contents of `supabase/run-all-migrations.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the script

This will create all necessary tables including:
- `organizations`
- `user_organizations` (the missing table)
- `organization_invitations`
- All other required tables with proper relationships

### Option 2: Run Only the Organizations Migration
If you already have other tables set up:
1. Open your Supabase SQL Editor
2. Copy the contents of `supabase/migrations/005_create_organizations_tables.sql`
3. Paste and run it

### Option 3: Using Supabase CLI
If you have Supabase CLI installed:
```bash
# From the asm directory
cd supabase
supabase db push
```

## After Running Migrations

1. **Verify the tables exist:**
   - Go to the Table Editor in Supabase
   - You should see the `user_organizations` table listed

2. **Clear any caches:**
   - If using the backend, restart it
   - Clear browser cache if accessing from frontend

3. **Test the functionality:**
   - Try creating or accessing an organization
   - The error should be resolved

## Important Notes

- The `user_organizations` table is crucial for the many-to-many relationship between users and organizations
- It stores user roles (owner, admin, member, viewer) for each organization
- Make sure to run migrations in order if running them individually
- The `run-all-migrations.sql` script includes all necessary tables, indexes, RLS policies, and triggers

## Troubleshooting

If you still see the error after running migrations:
1. Check if the table was created: Run `SELECT * FROM user_organizations LIMIT 1;` in SQL Editor
2. Refresh the schema cache in Supabase
3. Ensure your backend is using the correct Supabase URL and keys
4. Check that Row Level Security policies are properly applied