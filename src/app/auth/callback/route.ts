import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // Check if this is a new user (created within the last minute)
      const createdAt = new Date(data.user.created_at)
      const now = new Date()
      const timeDiff = now.getTime() - createdAt.getTime()
      const minutesDiff = timeDiff / (1000 * 60)
      
      // If user was created less than 1 minute ago, redirect to connect page
      if (minutesDiff < 1) {
        return NextResponse.redirect(`${origin}/connect`)
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(`${origin}/dashboard`)
}