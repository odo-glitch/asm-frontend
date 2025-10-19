import { createClient } from '@/lib/supabase/client'

export interface ContentItem {
  id: string
  user_id: string
  type: 'image' | 'video' | 'document'
  name: string
  url: string
  thumbnail_url?: string | null
  size: number
  mime_type?: string | null
  source: 'upload' | 'canva' | 'dropbox'
  folder?: string | null
  tags: string[]
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ContentFolder {
  id: string
  user_id: string
  name: string
  parent_id?: string | null
  created_at: string
}

export async function fetchContentItems(): Promise<ContentItem[]> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('content_library')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching content items:', error)
    throw error
  }

  return data || []
}

export async function fetchContentFolders(): Promise<ContentFolder[]> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('content_folders')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching folders:', error)
    throw error
  }

  return data || []
}

export async function uploadContent(
  file: File, 
  folder?: string, 
  tags: string[] = [],
  source: 'upload' | 'canva' | 'dropbox' = 'upload'
): Promise<ContentItem> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Upload file to Supabase Storage
  const fileName = `${user.id}/${Date.now()}_${file.name}`
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('content-library')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Error uploading file:', uploadError)
    throw uploadError
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('content-library')
    .getPublicUrl(fileName)

  // Determine content type
  let type: 'image' | 'video' | 'document' = 'document'
  if (file.type.startsWith('image/')) type = 'image'
  else if (file.type.startsWith('video/')) type = 'video'

  // Create thumbnail for images (in production, you'd generate actual thumbnails)
  const thumbnailUrl = type === 'image' ? publicUrl : null

  // Save to database
  const { data, error } = await supabase
    .from('content_library')
    .insert({
      user_id: user.id,
      type,
      name: file.name,
      url: publicUrl,
      thumbnail_url: thumbnailUrl,
      size: file.size,
      mime_type: file.type,
      source,
      folder,
      tags
    })
    .select()
    .single()

  if (error) {
    console.error('Error saving content item:', error)
    // Clean up uploaded file if database insert fails
    await supabase.storage
      .from('content-library')
      .remove([fileName])
    throw error
  }

  return data
}

export async function deleteContentItem(id: string): Promise<void> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('content_library')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting content item:', error)
    throw error
  }
}

export async function updateContentItem(
  id: string, 
  updates: Partial<Pick<ContentItem, 'name' | 'folder' | 'tags'>>
): Promise<ContentItem> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('content_library')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating content item:', error)
    throw error
  }

  return data
}

export async function createFolder(name: string, parentId?: string): Promise<ContentFolder> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('content_folders')
    .insert({
      user_id: user.id,
      name,
      parent_id: parentId
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating folder:', error)
    throw error
  }

  return data
}

// OAuth integration helpers
export function getCanvaAuthUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_CANVA_CLIENT_ID
  const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/canva/callback`)
  // Using Canva's standard scopes
  const scope = 'design:content:read design:meta:read'
  
  return `https://www.canva.com/api/v1/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scope)}`
}

export function getDropboxAuthUrl(): string {
  const clientId = process.env.NEXT_PUBLIC_DROPBOX_APP_KEY
  const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/dropbox/callback`)
  
  return `https://www.dropbox.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code`
}