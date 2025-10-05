# Google OAuth Setup Guide

This guide will walk you through setting up Google OAuth for your application.

## Prerequisites
- A Google account
- Access to your Supabase project dashboard

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown and select "New Project"
3. Give your project a name (e.g., "ASM App")
4. Click "Create"

## Step 2: Enable Google+ API

1. In the Google Cloud Console, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click on it and press "Enable"

## Step 3: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in the required fields:
     - App name: Your app name
     - User support email: Your email
     - Developer contact: Your email
   - Add scopes: `email` and `profile`
   - Add test users if in development
4. Back in credentials, create OAuth client ID:
   - Application type: "Web application"
   - Name: "Supabase Auth"
   - Authorized redirect URIs: Add your Supabase callback URL
     - Format: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
     - You can find your project ref in your Supabase project URL

## Step 4: Configure Supabase

1. Copy the Client ID and Client Secret from Google
2. Go to your Supabase dashboard
3. Navigate to Authentication → Providers
4. Find Google and toggle it on
5. Paste your Client ID and Client Secret
6. Save the configuration

## Step 5: Update Your Application

Your application is already configured to support Google OAuth! The signup and login forms now include "Sign up/in with Google" buttons.

## Testing

1. Go to your app's signup or login page
2. Click "Sign up with Google" or "Sign in with Google"
3. You'll be redirected to Google's consent page
4. After authorization, you'll be redirected back to your app
5. New users will be sent to the Connect Account page
6. Existing users will go directly to the dashboard

## Troubleshooting

### "Redirect URI mismatch" error
- Double-check that the redirect URI in Google Console matches exactly with Supabase's callback URL
- Make sure there are no trailing slashes

### "This app is blocked" error
- If in development, make sure you've added test users in the OAuth consent screen
- For production, you'll need to verify your app with Google

### Users not redirected properly after login
- Check the callback route logic in `/app/auth/callback/route.ts`
- Ensure the middleware is properly configured

## Production Considerations

1. **Verify your app**: For production use with more than 100 users, you'll need to submit your app for Google verification
2. **Privacy Policy**: You'll need a privacy policy URL
3. **Terms of Service**: You'll need terms of service URL
4. **App Logo**: Add a professional logo for the consent screen
5. **Scopes**: Only request the minimum scopes needed