import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Handle error from Dropbox
    if (error) {
      console.error('Dropbox OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/library?error=${encodeURIComponent('Dropbox authorization failed')}`, request.url)
      )
    }

    // Check if code is present
    if (!code) {
      return NextResponse.redirect(
        new URL('/library?error=missing_code', request.url)
      )
    }

    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.redirect(
        new URL('/auth/login', request.url)
      )
    }

    // Exchange code for access token
    const clientId = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY
    const clientSecret = process.env.DROPBOX_APP_SECRET
    const redirectUri = `${request.nextUrl.origin}/api/auth/dropbox/callback`

    const tokenResponse = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Dropbox token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/library?error=token_exchange_failed', request.url)
      )
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token } = tokenData

    // Get user info from Dropbox
    const userResponse = await fetch('https://api.dropboxapi.com/2/users/get_current_account', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Failed to get Dropbox user info')
      return NextResponse.redirect(
        new URL('/library?error=user_info_failed', request.url)
      )
    }

    const dropboxUser = await userResponse.json()

    // Store Dropbox connection in database (you may need to create a table for this)
    // For now, we'll just redirect to the library with success
    // TODO: Store access_token, refresh_token in a dropbox_connections table

    return NextResponse.redirect(
      new URL('/library?dropbox_connected=true', request.url)
    )

  } catch (error) {
    console.error('Dropbox callback error:', error)
    return NextResponse.redirect(
      new URL('/library?error=callback_failed', request.url)
    )
  }
}
