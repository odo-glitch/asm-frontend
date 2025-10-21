import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { pageId, pageName, accessToken, organizationId } = body

    if (!pageId || !pageName || !accessToken) {
      return NextResponse.json(
        { error: 'Missing required fields: pageId, pageName, accessToken' },
        { status: 400 }
      )
    }

    // Check if account already exists
    const { data: existing } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('platform', 'facebook')
      .eq('account_id', pageId)
      .single()

    if (existing) {
      // Update existing account
      const { data, error } = await supabase
        .from('social_accounts')
        .update({
          account_name: pageName,
          access_token: accessToken,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating Facebook page:', error)
        return NextResponse.json(
          { error: 'Failed to update Facebook page' },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        success: true,
        account: data,
        message: 'Facebook page updated successfully' 
      })
    }

    // Create new account
    const { data, error } = await supabase
      .from('social_accounts')
      .insert({
        user_id: user.id,
        organization_id: organizationId || null,
        platform: 'facebook',
        account_name: pageName,
        account_id: pageId,
        access_token: accessToken,
        refresh_token: null
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving Facebook page:', error)
      return NextResponse.json(
        { error: 'Failed to save Facebook page', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true,
      account: data,
      message: 'Facebook page connected successfully' 
    })

  } catch (error) {
    console.error('Error in save-page API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
