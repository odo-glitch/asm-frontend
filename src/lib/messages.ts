import { createClient } from '@/lib/supabase/client'

export interface Conversation {
  id: string
  user_id: string
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'tiktok'
  customer_id: string
  customer_name: string
  customer_avatar?: string | null
  last_message?: string | null
  last_message_time: string
  unread_count: number
  metadata?: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface MessageAttachment {
  id: string
  mime_type: string
  name?: string | null
  image_url?: string | null
  file_url?: string | null
  video_url?: string | null
}

export interface Message {
  id: string
  conversation_id: string
  platform_message_id?: string | null
  text: string
  sender: 'user' | 'customer'
  sender_name?: string
  sender_avatar?: string | null
  image_url?: string | null
  attachment_type?: string | null
  attachments?: MessageAttachment[]
  timestamp: string
  read: boolean
  metadata?: Record<string, unknown>
  created_at?: string
}

// Fetch all conversations for the current user
export async function fetchConversations(): Promise<Conversation[]> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('last_message_time', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    throw error
  }

  return data || []
}

// Fetch messages for a specific conversation
export async function fetchMessages(conversationId: string): Promise<Message[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('timestamp', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    throw error
  }

  return data || []
}

// Create or update a conversation
export async function upsertConversation(
  platform: string,
  customerId: string,
  customerName: string,
  customerAvatar?: string
): Promise<Conversation> {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('conversations')
    .upsert({
      user_id: user.id,
      platform,
      customer_id: customerId,
      customer_name: customerName,
      customer_avatar: customerAvatar
    }, {
      onConflict: 'user_id,platform,customer_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting conversation:', error)
    throw error
  }

  return data
}

// Send a message
export async function sendMessage(
  conversationId: string,
  text: string,
  platformMessageId?: string
): Promise<Message> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      text,
      sender: 'user',
      platform_message_id: platformMessageId,
      read: true // User's own messages are always read
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    throw error
  }

  return data
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .eq('sender', 'customer')
    .eq('read', false)

  if (error) {
    console.error('Error marking messages as read:', error)
    throw error
  }

  // Reset unread count
  await supabase
    .from('conversations')
    .update({ unread_count: 0 })
    .eq('id', conversationId)
}

// Delete a conversation
export async function deleteConversation(conversationId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)

  if (error) {
    console.error('Error deleting conversation:', error)
    throw error
  }
}

// Helper to format timestamp
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

// Sync messages from social platforms (placeholder for webhook integration)
export async function syncPlatformMessages(platform: string, accountId: string): Promise<void> {
  // This would be called by webhooks or periodic sync
  // Implementation depends on each platform's API
  
  console.log(`Syncing messages for ${platform} account ${accountId}`)
  
  // Example flow:
  // 1. Fetch new messages from platform API
  // 2. For each message:
  //    - Create/update conversation
  //    - Add message to database
  //    - Update unread counts
}