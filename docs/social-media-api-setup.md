# Social Media API Setup Guide

This guide explains how to set up API keys for each social media platform to enable posting functionality in your ASM (Automated Social Media) application.

## Prerequisites

- A backend server running at `http://localhost:3001` (or your production URL)
- The frontend application with the settings page implemented
- Access to developer accounts for each platform you want to integrate

## Environment Variables

Add these to your **backend** `.env` file (`asm-backend/.env`):

```env
# Backend URL (update for production)
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000

# Facebook/Instagram API
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# LinkedIn API
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Twitter API
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Existing keys (keep these)
SUPABASE_SERVICE_ROLE_KEY=your_existing_key
ENCRYPTION_KEY=your_existing_32_char_key
```

## Platform-Specific Setup

### 1. Facebook & Instagram

Facebook API also handles Instagram Business accounts.

1. **Create a Facebook App:**
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Click "My Apps" → "Create App"
   - Choose "Business" type
   - Fill in app details

2. **Configure OAuth Settings:**
   - In your app dashboard, go to "Settings" → "Basic"
   - Add your App Domain: `localhost:3001` (development) or your production domain
   - Save your App ID and App Secret

3. **Add Products:**
   - Add "Facebook Login" product
   - Set Valid OAuth Redirect URIs:
     ```
     http://localhost:3001/api/auth/facebook/callback
     https://your-domain.com/api/auth/facebook/callback
     ```
   - Add "Instagram Basic Display" for Instagram support

4. **Request Permissions:**
   - Go to "App Review" → "Permissions and Features"
   - Request these permissions:
     - `pages_show_list`
     - `pages_read_engagement`
     - `pages_manage_posts`
     - `instagram_basic`
     - `instagram_content_publish`

### 2. LinkedIn

1. **Create a LinkedIn App:**
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
   - Click "Create app"
   - Fill in required information
   - Select your LinkedIn Page as the company

2. **Configure OAuth 2.0:**
   - In your app settings, go to "Auth" tab
   - Add Authorized redirect URLs:
     ```
     http://localhost:3001/api/auth/linkedin/callback
     https://your-domain.com/api/auth/linkedin/callback
     ```

3. **Request Access:**
   - Go to "Products" tab
   - Request access to:
     - "Share on LinkedIn" (for posting)
     - "Sign In with LinkedIn using OpenID Connect"

4. **Copy Credentials:**
   - Go to "Auth" tab
   - Copy Client ID and Client Secret

### 3. Twitter (X)

1. **Create a Twitter App:**
   - Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
   - Create a new Project and App
   - Save your API Key and API Key Secret

2. **Apply for Elevated Access:**
   - Required for posting tweets
   - Go to "Projects & Apps" → Your app → "Settings"
   - Apply for Elevated access (may take 24-48 hours)

3. **Configure OAuth 2.0:**
   - In app settings, set up OAuth 2.0
   - Set Callback URLs:
     ```
     http://localhost:3001/api/auth/twitter/callback
     https://your-domain.com/api/auth/twitter/callback
     ```
   - Enable required scopes:
     - `tweet.read`
     - `tweet.write`
     - `users.read`
     - `offline.access`

4. **Generate Client Credentials:**
   - Go to "Keys and tokens"
   - Generate OAuth 2.0 Client ID and Client Secret

## Testing Your Setup

1. **Start your backend server:**
   ```bash
   cd asm-backend
   npm run dev
   ```

2. **Start your frontend:**
   ```bash
   cd asm
   npm run dev
   ```

3. **Navigate to Settings:**
   - Go to `http://localhost:3000/settings`
   - Click "Add Account" in the Connected Accounts section
   - Select a platform to test

4. **Verify the connection:**
   - You should be redirected to the platform's OAuth page
   - After authorization, you'll be redirected back to settings
   - The account should appear in your connected accounts list

## Troubleshooting

### Common Issues:

1. **"OAuth not configured" error:**
   - Ensure all required environment variables are set in the backend `.env`
   - Restart the backend server after adding environment variables

2. **Redirect URI mismatch:**
   - Make sure the redirect URIs in your app settings exactly match what's in the code
   - Include both http (development) and https (production) versions

3. **Permission errors:**
   - Some platforms require app review before certain permissions work
   - Start with basic permissions for testing

4. **CORS errors:**
   - Ensure your backend CORS configuration includes your frontend URL
   - Check that `FRONTEND_URL` is set correctly in backend `.env`

## Security Notes

- **Never expose API secrets in frontend code**
- All OAuth flows should go through your backend
- Use HTTPS in production for all OAuth redirects
- Regularly rotate your API keys
- Store tokens encrypted (already implemented in the backend)

## Next Steps

After setting up the APIs:

1. Test posting functionality with each connected account
2. Implement token refresh logic for expired tokens
3. Add webhook support for real-time updates
4. Set up monitoring for API rate limits

## API Rate Limits

Be aware of each platform's rate limits:
- **Facebook/Instagram**: 200 calls per hour per user
- **LinkedIn**: 300 requests per day (varies by endpoint)
- **Twitter**: 300 posts per 3 hours (with Elevated access)

Plan your posting schedule accordingly to avoid hitting these limits.