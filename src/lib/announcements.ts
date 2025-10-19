import { createClient } from '@/lib/supabase/client'

export interface Announcement {
  id: string
  organization_id: string
  user_id: string
  title: string
  message: string
  created_at: string
  updated_at: string
  author_name?: string
}

export async function fetchAnnouncements(organizationId: string): Promise<Announcement[]> {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (error) {
      console.error('Error fetching announcements:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return []
    }
    
    return data || []
  } catch (error) {
    console.error('Exception fetching announcements:', error)
    return []
  }
}

export async function createAnnouncement(
  organizationId: string,
  title: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }
    
    console.log('Creating announcement:', {
      organizationId,
      userId: user.id,
      title
    })
    
    const { error } = await supabase
      .from('announcements')
      .insert({
        organization_id: organizationId,
        user_id: user.id,
        title,
        message
      })
    
    if (error) {
      console.error('Error creating announcement:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Exception creating announcement:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function deleteAnnouncement(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting announcement:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error deleting announcement:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
