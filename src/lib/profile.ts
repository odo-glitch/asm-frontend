import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  first_name?: string
  nickname?: string
  avatar_url?: string
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return {
    id: user.id,
    email: user.email || '',
    full_name: user.user_metadata?.full_name,
    first_name: user.user_metadata?.first_name,
    nickname: user.user_metadata?.nickname,
    avatar_url: user.user_metadata?.avatar_url
  }
}

export async function updateUserProfile(updates: {
  full_name?: string
  first_name?: string
  nickname?: string
  avatar_url?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase.auth.updateUser({
      data: updates
    })
    
    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export async function uploadProfilePicture(file: File): Promise<{ url?: string; error?: string }> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'User not authenticated' }
    }
    
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/avatar.${fileExt}`
    
    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type
      })
    
    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      return { error: uploadError.message }
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)
    
    // Update user metadata with avatar URL
    await updateUserProfile({ avatar_url: publicUrl })
    
    return { url: publicUrl }
  } catch (error) {
    console.error('Error uploading profile picture:', error)
    return { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

export function getDisplayName(profile: UserProfile | null): string {
  if (!profile) return 'User'
  
  // Priority: nickname > first_name > full_name > email username
  return profile.nickname || 
         profile.first_name || 
         profile.full_name?.split(' ')[0] || 
         profile.email?.split('@')[0] || 
         'User'
}
