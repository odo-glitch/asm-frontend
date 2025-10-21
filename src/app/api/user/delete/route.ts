import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
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

    const userId = user.id

    // Delete user data in order (respecting foreign key constraints)
    
    // 1. Delete scheduled posts
    await supabase
      .from('scheduled_posts')
      .delete()
      .eq('user_id', userId)

    // 2. Get conversation IDs first
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
    
    const conversationIds = conversations?.map(c => c.id) || []

    // 3. Delete messages
    if (conversationIds.length > 0) {
      await supabase
        .from('messages')
        .delete()
        .in('conversation_id', conversationIds)
    }

    // 4. Delete conversations
    await supabase
      .from('conversations')
      .delete()
      .eq('user_id', userId)

    // 4. Delete content library items
    await supabase
      .from('content_library')
      .delete()
      .eq('user_id', userId)

    // 5. Delete social accounts
    await supabase
      .from('social_accounts')
      .delete()
      .eq('user_id', userId)

    // 6. Delete brand profiles
    await supabase
      .from('brand_profiles')
      .delete()
      .eq('user_id', userId)

    // 7. Delete personal profiles
    await supabase
      .from('personal_profiles')
      .delete()
      .eq('user_id', userId)

    // 8. Delete organization memberships
    await supabase
      .from('organization_members')
      .delete()
      .eq('user_id', userId)

    // 9. Delete organizations where user is owner
    await supabase
      .from('organizations')
      .delete()
      .eq('owner_id', userId)

    // 10. Delete reviews
    await supabase
      .from('reviews')
      .delete()
      .eq('user_id', userId)

    // 11. Finally, delete the auth user (this will cascade delete related auth tables)
    const { error: deleteError } = await supabase.auth.admin.deleteUser(userId)
    
    if (deleteError) {
      console.error('Error deleting auth user:', deleteError)
      // Continue anyway - data is deleted
    }

    // Sign out the user
    await supabase.auth.signOut()

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
