# Apply Organization Content Library Migration

## Overview
This migration adds organization-based content management to the content library, allowing users to:
- Upload content specific to an organization
- Share content across all organizations they belong to
- See content previews (videos, images) in the app
- Each organization has its own isolated content

## Migration File
The migration is located at: `supabase/migrations/014_add_organization_to_content_library.sql`

## How to Apply the Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the migration file: `supabase/migrations/014_add_organization_to_content_library.sql`
5. Copy the entire contents of the file
6. Paste it into the SQL Editor
7. Click **Run** to execute the migration

### Option 2: Supabase CLI (If you have local setup)

```bash
# From the asm directory
npx supabase migration up
```

## What the Migration Does

### 1. Adds New Columns
- Adds `organization_id` to `content_library` table
- Adds `visibility` field with values: `organization` or `all_organizations`
- Adds `organization_id` to `content_folders` table

### 2. Updates Row Level Security (RLS) Policies
- Users can view content from their organizations
- Users can view content marked as `all_organizations` if they belong to any organization
- Only organization admins/owners can manage organization content
- Personal content (where organization_id is NULL) remains private to the user

### 3. Creates Indexes
- Indexes on `organization_id` for faster queries

## Verification

After running the migration, verify it worked by running this query in the SQL Editor:

```sql
-- Check if columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'content_library' 
AND column_name IN ('organization_id', 'visibility');

-- Check if policies were created
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'content_library';
```

You should see:
- `organization_id` column of type `uuid`
- `visibility` column of type `text`
- New RLS policies for organization-based access

## Testing the Feature

1. **Upload Content**:
   - Go to the Content Library page
   - Click "Upload Content"
   - Select visibility: "This Organization Only" or "All My Organizations"
   - Upload a file
   - You should see the visibility badge on the content

2. **Switch Organizations**:
   - Use the brand switcher in the sidebar
   - Select a different organization
   - Content should be filtered based on the selected organization

3. **View Preview**:
   - For images: Preview should display in the grid
   - For videos: Video icon should show (actual video preview can be implemented)
   - Visibility badge (Private/Shared) should display on each item

4. **Create Post**:
   - Click "Create Post" button
   - Select content from the library
   - Selected items should be highlighted

## Rollback (If Needed)

If you need to rollback this migration, run:

```sql
-- Remove new columns
ALTER TABLE content_library DROP COLUMN IF EXISTS organization_id;
ALTER TABLE content_library DROP COLUMN IF EXISTS visibility;
ALTER TABLE content_folders DROP COLUMN IF EXISTS organization_id;

-- Drop indexes
DROP INDEX IF EXISTS idx_content_library_organization;
DROP INDEX IF EXISTS idx_content_folders_organization;

-- Recreate original policies (refer to migration 008_create_content_library.sql)
```

## Important Notes

1. **Existing Content**: After migration, existing content will have:
   - `organization_id = NULL` (personal content)
   - `visibility = 'organization'` (default)

2. **Storage Bucket**: The content files in the `content-library` storage bucket are not affected by this migration. Only database records are updated.

3. **Permissions**: Make sure the user running the migration has sufficient permissions in Supabase.

## Support

If you encounter any issues:
1. Check the Supabase logs in the dashboard
2. Verify all previous migrations were applied successfully
3. Ensure the organizations tables exist (migration 007)
4. Check that RLS is enabled on the tables
