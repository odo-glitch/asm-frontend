# Supabase Setup Instructions

## Prerequisites
- A Supabase account (create one at https://supabase.com)
- Your Next.js app (already set up)

## Setting up Supabase

### 1. Create a Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New project"
3. Fill in:
   - Project name
   - Database password (save this securely)
   - Region (choose one close to your users)
4. Click "Create new project"

### 2. Get your API Keys
1. Once your project is created, go to Settings → API
2. Copy these values:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Update your .env.local file
Replace the placeholder values in your `.env.local` file with your actual Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Configure Authentication (Optional but Recommended)

#### Email Authentication Settings
1. Go to Authentication → Providers in your Supabase dashboard
2. Ensure Email provider is enabled
3. Configure email settings:
   - **Enable Email Confirmations**: Toggle based on your preference
   - **Enable Email Change Confirmations**: Toggle based on your preference

#### Google OAuth Setup
1. Go to Authentication → Providers in your Supabase dashboard
2. Find and enable the Google provider
3. You'll need to:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com)
   - Enable the Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-ref.supabase.co/auth/v1/callback`
4. Copy your Google Client ID and Client Secret to Supabase
5. Save the configuration

#### Configure Redirect URLs
1. Go to Authentication → URL Configuration
2. Add your site URL to the allowed redirect URLs:
   - `http://localhost:3000/**` (for development)
   - `https://your-domain.com/**` (for production)

#### Email Templates (Optional)
1. Go to Authentication → Email Templates
2. Customize the confirmation email template if desired

## Running the Application

1. Install dependencies (if not already done):
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Visit http://localhost:3000

## Application Flow

- **Home Page** (`/`): Redirects authenticated users to dashboard, shows login/signup options for guests
- **Sign Up** (`/auth/signup`): Create a new account
- **Login** (`/auth/login`): Sign in to existing account  
- **Dashboard** (`/dashboard`): Protected page, only accessible when logged in
- **Auth Callback** (`/auth/callback`): Handles email confirmation redirects

## Testing the Authentication

1. Navigate to `/auth/signup`
2. Create a new account with your email
3. If email confirmations are enabled:
   - Check your email for the confirmation link
   - Click the link to verify your account
4. Sign in at `/auth/login`
5. You'll be redirected to the dashboard

## Troubleshooting

### Common Issues

1. **"Invalid API Key"**
   - Double-check your `.env.local` values
   - Ensure no extra spaces or quotes around the values

2. **Email not sending**
   - Check your Supabase email settings
   - For development, you might want to disable email confirmations

3. **Redirect issues**
   - Ensure your site URL is added to the allowed redirect URLs in Supabase
   - Check that the middleware is properly configured

## Next Steps

- Add password reset functionality
- Implement OAuth providers (Google, GitHub, etc.)
- Add user profile management
- Set up Row Level Security (RLS) policies for your database tables

## OAuth Setup for Social Media Platforms

### Prerequisites
1. Run the database migration to create the `social_accounts` table:
   - Go to your Supabase Dashboard > SQL Editor
   - Run the SQL from `supabase/migrations/001_create_social_accounts.sql`

2. Configure OAuth providers in Supabase:
   - Go to Authentication → Providers in Supabase Dashboard
   - Enable and configure each provider (LinkedIn, Twitter, Facebook, Instagram)
   - Add the callback URL: `https://your-project.supabase.co/auth/v1/callback`

### Running the Backend Service
The OAuth token storage requires the backend service to be running:

1. Navigate to the backend folder:
   ```bash
   cd ../asm-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the backend `.env` file:
   - Add your Supabase Service Role Key
   - Generate a secure 32-character encryption key

4. Run the backend:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:3001` by default.

### Testing OAuth Flow
1. Sign up for a new account
2. You'll be redirected to the Connect Account page
3. Click on any social platform button
4. Authorize the app on the social platform
5. You'll be redirected back and the connection will be saved securely