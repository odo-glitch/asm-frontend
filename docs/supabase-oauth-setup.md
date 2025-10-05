# Supabase OAuth Setup Guide

This guide explains how to configure OAuth providers in Supabase for social media authentication.

## Overview

Instead of handling OAuth directly through the backend, we'll use Supabase's built-in OAuth providers. This is more secure and easier to manage.

## Setting Up OAuth in Supabase Dashboard

### 1. Access Authentication Settings

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **Providers**

### 2. Configure Each Provider

#### Facebook (also handles Instagram)

1. Find **Facebook** in the providers list and click **Enable**
2. You'll need:
   - **App ID**: From Facebook Developers
   - **App Secret**: From Facebook Developers

3. **Facebook App Setup**:
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Create app or use existing one
   - Add these redirect URLs in Facebook app settings:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - Required permissions: email, public_profile

4. Copy the App ID and Secret to Supabase

#### LinkedIn

1. Find **LinkedIn** in the providers list and click **Enable**
2. You'll need:
   - **API Key**: Your LinkedIn Client ID
   - **Secret Key**: Your LinkedIn Client Secret

3. **LinkedIn App Setup**:
   - Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
   - In OAuth 2.0 settings, add redirect URL:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - Products needed: "Sign In with LinkedIn using OpenID Connect"

4. Copy the Client ID and Secret to Supabase

#### Twitter

1. Find **Twitter** in the providers list and click **Enable**
2. You'll need:
   - **API Key**: Your Twitter Client ID
   - **API Secret**: Your Twitter Client Secret

3. **Twitter App Setup**:
   - Go to [Twitter Developer Portal](https://developer.twitter.com)
   - In OAuth 2.0 settings, add callback URL:
     ```
     https://<your-project-ref>.supabase.co/auth/v1/callback
     ```
   - Required scopes: tweet.read, tweet.write, users.read

4. Copy the Client ID and Secret to Supabase

### 3. Configure Redirect URLs

In Supabase Dashboard → Authentication → URL Configuration:

1. **Site URL**: `http://localhost:3000` (or your production URL)
2. **Redirect URLs** (add all of these):
   ```
   http://localhost:3000/api/auth/callback
   http://localhost:3000/settings
   https://your-production-domain.com/api/auth/callback
   https://your-production-domain.com/settings
   ```

## Testing the Integration

1. Make sure your backend is running (for token encryption)
2. Go to Settings → Connected Accounts
3. Click "Add Account"
4. Select a platform
5. You should be redirected to the platform's OAuth page
6. After authorization, you'll return to your app
7. The account should appear in connected accounts

## How It Works

1. **User clicks connect** → Supabase handles OAuth flow
2. **Platform authorizes** → Returns to Supabase callback
3. **Supabase creates session** → Includes provider tokens
4. **App callback** → Extracts tokens and saves encrypted to backend
5. **Backend stores** → Encrypted tokens in social_accounts table

## Security Benefits

- OAuth secrets are managed by Supabase, not your app
- Provider tokens are encrypted before storage
- No need to handle OAuth flows manually
- Automatic token refresh handled by Supabase

## Troubleshooting

### "Provider not enabled" error
- Make sure you've enabled the provider in Supabase Dashboard
- Check that you've saved the API keys correctly

### Redirect mismatch errors
- Ensure redirect URLs match exactly in both Supabase and provider settings
- Include both http (dev) and https (prod) URLs

### Token not saving
- Check that your backend is running
- Verify BACKEND_URL in frontend .env
- Check backend logs for encryption errors

### Account name shows as "Unknown"
- This is normal for some providers
- The actual username is fetched after connection

## Next Steps

After setting up OAuth:
1. Test each provider thoroughly
2. Implement token refresh logic
3. Add error handling for expired tokens
4. Set up webhooks for real-time updates