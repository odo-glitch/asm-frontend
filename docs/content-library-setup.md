# Content Library Setup Guide

## Overview
The content library allows users to manage their media files (images, videos, documents) from various sources:
- Direct uploads
- Canva imports
- Dropbox integration

## Storage Configuration

### Supabase Storage Bucket
The content library uses a Supabase storage bucket called `content-library` with the following configuration:
- **Public Access**: Currently set to true for easier access
- **File Size Limit**: 50MB
- **Allowed File Types**: 
  - Images: JPEG, PNG, GIF, WebP
  - Videos: MP4, MPEG
  - Documents: PDF

### Running Migrations
To create the storage bucket, run the migration:
```bash
npx supabase migration up
```

## OAuth Integrations

### Canva Integration
To enable Canva imports:

1. Create a Canva app at https://www.canva.com/developers/
2. Add these environment variables to `.env.local`:
   ```
   NEXT_PUBLIC_CANVA_CLIENT_ID=your_canva_client_id
   CANVA_CLIENT_SECRET=your_canva_client_secret
   ```
3. Set the redirect URI in Canva to: `https://your-domain.com/api/auth/canva/callback`

### Dropbox Integration
To enable Dropbox linking:

1. Create a Dropbox app at https://www.dropbox.com/developers/apps
2. Add these environment variables to `.env.local`:
   ```
   NEXT_PUBLIC_DROPBOX_APP_KEY=your_dropbox_app_key
   DROPBOX_APP_SECRET=your_dropbox_app_secret
   ```
3. Set the redirect URI in Dropbox to: `https://your-domain.com/api/auth/dropbox/callback`

## API Routes Required

You'll need to create these API routes to handle OAuth callbacks:

### `/api/auth/canva/callback`
```typescript
// Handle Canva OAuth callback
// Exchange code for access token
// Import user's designs
```

### `/api/auth/dropbox/callback`
```typescript
// Handle Dropbox OAuth callback
// Exchange code for access token
// Link Dropbox files
```

## Database Schema

The content library uses two main tables:

### `content_library` table
- Stores metadata for all content items
- Links to files in Supabase storage
- Tracks source (upload, canva, dropbox)

### `content_folders` table
- Organizes content into folders
- Supports nested folder structure

## Usage

### Uploading Files
Files are uploaded to Supabase storage and metadata is saved to the database:
```typescript
const item = await uploadContent(file, 'Marketing', ['social', 'banner'])
```

### Fetching Content
```typescript
const items = await fetchContentItems()
const folders = await fetchContentFolders()
```

### Managing Content
```typescript
// Update item
await updateContentItem(id, { name: 'New Name', tags: ['updated'] })

// Delete item
await deleteContentItem(id)

// Create folder
await createFolder('Campaign 2024')
```

## Security

- Files are stored with user ID prefix: `{user_id}/{timestamp}_{filename}`
- RLS policies ensure users can only access their own content
- Storage bucket policies prevent unauthorized access

## Future Enhancements

1. **Thumbnail Generation**: Automatically generate thumbnails for images and videos
2. **File Compression**: Compress large images before storage
3. **Search & Filtering**: Full-text search across content metadata
4. **Batch Operations**: Select multiple items for bulk actions
5. **External CDN**: Serve files through a CDN for better performance