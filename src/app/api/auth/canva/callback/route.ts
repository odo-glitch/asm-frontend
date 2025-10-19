import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    // Handle error from Canva
    if (error) {
      console.error('Canva OAuth error:', error)
      return NextResponse.redirect(
        new URL(`/library?error=${encodeURIComponent('Canva authorization failed')}`, request.url)
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
    const clientId = process.env.NEXT_PUBLIC_CANVA_CLIENT_ID
    const clientSecret = process.env.CANVA_CLIENT_SECRET
    const redirectUri = `${request.nextUrl.origin}/api/auth/canva/callback`

    const tokenResponse = await fetch('https://api.canva.com/rest/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId!,
        client_secret: clientSecret!,
        redirect_uri: redirectUri,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Canva token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/library?error=token_exchange_failed', request.url)
      )
    }

    const tokenData = await tokenResponse.json()
    const { access_token, refresh_token, expires_in } = tokenData

    // Get user info from Canva
    const userResponse = await fetch('https://api.canva.com/rest/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    })

    if (!userResponse.ok) {
      console.error('Failed to get Canva user info')
      return NextResponse.redirect(
        new URL('/library?error=user_info_failed', request.url)
      )
    }

    const canvaUser = await userResponse.json()

    // Store Canva connection in database (you may need to create a table for this)
    // For now, we'll just redirect to the library with success
    // TODO: Store access_token, refresh_token in a canva_connections table

    return NextResponse.redirect(
      new URL('/library?canva_connected=true', request.url)
    )

  } catch (error) {
    console.error('Canva callback error:', error)
    return NextResponse.redirect(
      new URL('/library?error=callback_failed', request.url)
    )
  }
}
