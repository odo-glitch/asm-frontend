import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  // OAuth parameters from backend redirect
  const platform = requestUrl.searchParams.get('platform')
  const userId = requestUrl.searchParams.get('userId')
  const accessToken = requestUrl.searchParams.get('accessToken')
  // These values are received but handled by backend
  // const refreshToken = requestUrl.searchParams.get('refreshToken')
  // const expiresIn = requestUrl.searchParams.get('expiresIn')
  // const accountName = requestUrl.searchParams.get('accountName')
  // const accountId = requestUrl.searchParams.get('accountId')
  const error = requestUrl.searchParams.get('error')
  
  // Supabase auth code (for login, not social connections)
  const code = requestUrl.searchParams.get('code')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/settings?error=${error}`)
  }

  // Handle social media OAuth callback from backend
  if (platform && userId && accessToken) {
    // The backend has already saved the encrypted tokens
    // Just redirect to settings with success message
    return NextResponse.redirect(`${requestUrl.origin}/settings?connected=${platform}`)
  }

  // Handle Supabase auth code (for user login only, not social connections)
  if (code && !platform) {
    const supabase = await createClient()
    
    const { data, error: authError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!authError && data.session) {
      // This is for Supabase user authentication (login/signup)
      // Not for social media connections
      return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
    } else if (authError) {
      console.error('Supabase auth error:', authError)
      return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=auth_failed`)
    }
  }

  // Default redirect
  return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
}