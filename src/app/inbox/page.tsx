'use client'

import { useState, useEffect } from 'react'
import { useRouter, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AppLayout, useMobileMenu } from '@/components/layout/AppLayout'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts'
import { Send, User, Instagram } from 'lucide-react'
import Logo from '@/components/Logo'
import { 
  fetchConversations, 
  fetchMessages, 
  sendMessage,
  markMessagesAsRead,
  formatMessageTime,
  type Conversation,
  type Message
} from '@/lib/messages'

// Custom Platform Icon Components
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
)

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
  </svg>
)

// Platform icons mapping
const platformIcons = {
  twitter: XIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
  instagram: Instagram,
  tiktok: TikTokIcon,
}

const platformColors = {
  twitter: 'bg-black',
  facebook: 'bg-[#0866FF]',
  linkedin: 'bg-[#0A66C2]',
  instagram: 'bg-purple-600',
  tiktok: 'bg-black',
}

function InboxContent() {
  const router = useRouter()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu()
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([])
  const [replyText, setReplyText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)
  const [facebookStatus, setFacebookStatus] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          redirect('/auth/login')
        }
        
        setUser(user)
        const fetchedAccounts = await fetchUserSocialAccounts()
        setAccounts(fetchedAccounts)
        
        // Fetch conversations from both Facebook and Instagram
        const allConversations: Conversation[] = []
        
        // Try Facebook Messenger
        try {
          console.log('Fetching Facebook Messenger conversations for user:', user.id)
          console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL)
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/facebook/conversations/${user.id}`)
          
          console.log('Facebook API response status:', response.status)
          
          if (response.ok) {
            const data = await response.json()
            console.log('Facebook API response data:', data)
            
            if (data.conversations && data.conversations.length > 0) {
              console.log('✅ Found', data.conversations.length, 'Facebook conversations')
              allConversations.push(...data.conversations)
            } else {
              console.log('⚠️ No Facebook conversations found')
            }
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            console.error('❌ Facebook API error:', response.status, errorData)
            setFacebookStatus(`FB: ${errorData.error || 'Permission required'}`)
          }
        } catch (fbError) {
          console.error('❌ Facebook API exception:', fbError)
          setFacebookStatus(`FB: ${fbError instanceof Error ? fbError.message : 'Connection error'}`)
        }

        // Try Instagram
        try {
          console.log('Fetching Instagram conversations for user:', user.id)
          
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instagram/conversations/${user.id}`)
          
          console.log('Instagram API response status:', response.status)
          
          if (response.ok) {
            const data = await response.json()
            console.log('Instagram API response data:', data)
            
            if (data.conversations && data.conversations.length > 0) {
              console.log('✅ Found', data.conversations.length, 'Instagram conversations')
              allConversations.push(...data.conversations)
            } else {
              console.log('⚠️ No Instagram conversations found')
            }
          } else {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
            console.error('❌ Instagram API error:', response.status, errorData)
            const currentStatus = facebookStatus || ''
            setFacebookStatus(currentStatus ? `${currentStatus} | IG: ${errorData.error}` : `IG: ${errorData.error}`)
          }
        } catch (igError) {
          console.error('❌ Instagram API exception:', igError)
          const currentStatus = facebookStatus || ''
          const igMsg = igError instanceof Error ? igError.message : 'Connection error'
          setFacebookStatus(currentStatus ? `${currentStatus} | IG: ${igMsg}` : `IG: ${igMsg}`)
        }

        // If we have conversations from either platform, use them
        if (allConversations.length > 0) {
          console.log('✅ Total conversations found:', allConversations.length)
          
          // Sort by last message time (most recent first)
          allConversations.sort((a, b) => 
            new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
          )
          
          setConversations(allConversations)
          setSelectedConversation(allConversations[0])
          
          // Fetch messages for first conversation
          const firstConv = allConversations[0]
          const apiEndpoint = firstConv.platform === 'facebook' ? 'facebook' : 'instagram'
          const messagesResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${apiEndpoint}/conversations/${user.id}/${firstConv.id}/messages`
          )
          if (messagesResponse.ok) {
            const messagesData = await messagesResponse.json()
            setSelectedMessages(messagesData.messages)
          }
          
          setFacebookStatus('success')
          return // Exit early if we found conversations
        } else {
          console.log('⚠️ No conversations found from any platform')
          if (!facebookStatus) {
            setFacebookStatus('no_messages')
          }
        }

        // If no Facebook messages, try database
        try {
          const conversations = await fetchConversations()
          if (conversations.length > 0) {
            setConversations(conversations)
            setSelectedConversation(conversations[0])
            const messages = await fetchMessages(conversations[0].id)
            setSelectedMessages(messages)
          }
          // No conversations - empty state will be shown
        } catch (error) {
          console.error('Failed to fetch conversations:', error)
          
          // Check if it's a "relation does not exist" error
          if (error instanceof Error && error.message?.includes('relation') && error.message?.includes('does not exist')) {
            setDbError('Database tables not found.')
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Real-time polling for conversation list (to catch new messages from any conversation)
  useEffect(() => {
    if (!user) return

    const pollConversations = async () => {
      try {
        const allConversations: Conversation[] = []
        
        // Fetch Facebook conversations
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/facebook/conversations/${user.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.conversations && data.conversations.length > 0) {
              allConversations.push(...data.conversations)
            }
          }
        } catch (error) {
          // Silently fail
        }

        // Fetch Instagram conversations
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/instagram/conversations/${user.id}`)
          if (response.ok) {
            const data = await response.json()
            if (data.conversations && data.conversations.length > 0) {
              allConversations.push(...data.conversations)
            }
          }
        } catch (error) {
          // Silently fail
        }

        if (allConversations.length > 0) {
          // Sort by most recent message first
          allConversations.sort((a, b) => 
            new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
          )
          setConversations(allConversations)
        }
      } catch (error) {
        console.error('Failed to poll conversations:', error)
      }
    }

    // Poll every 15 seconds
    const interval = setInterval(pollConversations, 15000)

    // Cleanup on unmount
    return () => clearInterval(interval)
  }, [user])

  // Real-time polling for new messages in selected conversation
  useEffect(() => {
    if (!selectedConversation || !user) return

    const pollMessages = async () => {
      try {
        if (selectedConversation.platform === 'instagram' || selectedConversation.platform === 'facebook') {
          const apiEndpoint = selectedConversation.platform
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${apiEndpoint}/conversations/${user.id}/${selectedConversation.id}/messages`
          )
          if (response.ok) {
            const data = await response.json()
            setSelectedMessages(data.messages)
          }
        } else {
          const messages = await fetchMessages(selectedConversation.id)
          setSelectedMessages(messages)
        }
      } catch (error) {
        console.error('Failed to poll messages:', error)
      }
    }

    // Poll every 10 seconds
    const interval = setInterval(pollMessages, 10000)

    // Cleanup on unmount or when conversation changes
    return () => clearInterval(interval)
  }, [selectedConversation, user])

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation || !user) return

    setSendingMessage(true)
    try {
      // For Instagram and Facebook, use backend API
      if (selectedConversation.platform === 'instagram' || selectedConversation.platform === 'facebook') {
        const apiEndpoint = selectedConversation.platform
        
        // For Facebook, we need to send recipientId (PSID) instead of conversation ID
        const requestBody: { message: string; recipientId?: string } = {
          message: replyText
        }
        
        // Facebook requires the recipient's PSID
        if (selectedConversation.platform === 'facebook') {
          if (!selectedConversation.customer_id || selectedConversation.customer_id === 'unknown') {
            throw new Error('Cannot send message: Customer ID not available')
          }
          requestBody.recipientId = selectedConversation.customer_id
        }
        
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${apiEndpoint}/conversations/${user.id}/${selectedConversation.id}/reply`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          }
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to send message')
        }

        // Create message object for local state
        const newMessage: Message = {
          id: `temp-${Date.now()}`,
          conversation_id: selectedConversation.id,
          text: replyText,
          sender: 'user',
          sender_name: 'You',
          timestamp: new Date().toISOString(),
          read: true
        }
        
        setSelectedMessages(prev => [...prev, newMessage])
      } else {
        // For other platforms, use Supabase directly
        const newMessage = await sendMessage(selectedConversation.id, replyText)
        setSelectedMessages(prev => [...prev, newMessage])
      }

      // Update the conversation in the list and re-sort by most recent
      setConversations(convs => {
        const updatedConvs = convs.map(conv => {
          if (conv.id === selectedConversation.id) {
            return {
              ...conv,
              last_message: replyText,
              last_message_time: new Date().toISOString()
            }
          }
          return conv
        })
        
        // Sort by most recent message first
        return updatedConvs.sort((a, b) => 
          new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
        )
      })

      // Clear reply text
      setReplyText('')
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSendingMessage(false)
    }
  }

  const handleConversationSelect = async (conversation: Conversation) => {
    setSelectedConversation(conversation)
    
    // Mark conversation as read (reset unread count)
    if (conversation.unread_count > 0) {
      setConversations(convs => convs.map(conv => {
        if (conv.id === conversation.id) {
          return { ...conv, unread_count: 0 }
        }
        return conv
      }))
    }
    
    // If it's a Facebook or Instagram conversation, fetch from appropriate API
    if ((conversation.platform === 'facebook' || conversation.platform === 'instagram') && user) {
      try {
        const apiEndpoint = conversation.platform === 'facebook' ? 'facebook' : 'instagram'
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${apiEndpoint}/conversations/${user.id}/${conversation.id}/messages`
        )
        if (response.ok) {
          const data = await response.json()
          setSelectedMessages(data.messages)
          return
        }
      } catch (error) {
        console.error(`Failed to fetch ${conversation.platform} messages:`, error)
      }
    }
    
    // Fallback to database messages
    try {
      const messages = await fetchMessages(conversation.id)
      setSelectedMessages(messages)
      
      // Mark messages as read
      if (conversation.unread_count > 0) {
        await markMessagesAsRead(conversation.id)
        setConversations(convs => convs.map(conv => {
          if (conv.id === conversation.id) {
            return { ...conv, unread_count: 0 }
          }
          return conv
        }))
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      setSelectedMessages([])
    }
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading conversations...</p>
      </div>
    </div>
  }

  return (
    <>
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <Logo className="h-16 w-auto text-[#61497e]" />
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.email}</span>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-screen pt-16">
        {/* Sidebar */}
        <Sidebar 
          accounts={accounts} 
          onCreatePost={() => router.push('/create-post')}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content - Three Panel Layout */}
        <div className="flex-1 lg:ml-64 flex flex-col">
          {/* Connection Status Banner */}
          {facebookStatus && facebookStatus !== 'success' && (
            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      {facebookStatus === 'no_messages' && 'No messages found. Connect your Instagram or Facebook page to start receiving messages.'}
                      {facebookStatus.includes('not found') && 'No Instagram or Facebook accounts connected yet.'}
                      {facebookStatus.includes('FB:') && facebookStatus.includes('IG:') && (
                        <>Facebook: {facebookStatus.split('|')[0].replace('FB:', '').trim()} | Instagram: {facebookStatus.split('|')[1].replace('IG:', '').trim()}</>
                      )}
                      {facebookStatus.includes('Permission') && ' Facebook needs pages_messaging permission (via Messenger product). Instagram needs instagram_manage_messages permission.'}
                      {!facebookStatus.includes('not found') && !facebookStatus.includes('no_messages') && !facebookStatus.includes('Permission') && !facebookStatus.includes('FB:') && facebookStatus}
                    </p>
                  </div>
                </div>
                <a 
                  href="/settings" 
                  className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 whitespace-nowrap"
                >
                  Go to Settings
                </a>
              </div>
            </div>
          )}
          
          {/* Database Error Banner */}
          {dbError && (
            <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {dbError} Currently showing demo data.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex-1 flex">
            {/* Left Panel - Conversation List */}
            <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <p className="text-sm text-gray-600 mt-1">
                {conversations.reduce((acc, conv) => acc + conv.unread_count, 0)} unread
              </p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Send className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Connect your social media accounts to start receiving messages
                  </p>
                  <a
                    href="/settings"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Connect Accounts
                  </a>
                </div>
              ) : (
                conversations.map((conversation) => {
                const Icon = platformIcons[conversation.platform]
                const bgColor = platformColors[conversation.platform]
                
                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleConversationSelect(conversation)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Profile Picture Placeholder */}
                      <div className="relative flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {conversation.customer_avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img 
                              src={conversation.customer_avatar} 
                              alt={conversation.customer_name}
                              className="w-12 h-12 rounded-full"
                            />
                          ) : (
                            <User className="w-6 h-6 text-gray-500" />
                          )}
                        </div>
                        {/* Platform Icon */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${bgColor} rounded-full flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                      </div>
                      
                      {/* Conversation Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`text-sm truncate ${
                            conversation.unread_count > 0 
                              ? 'font-bold text-gray-900' 
                              : 'font-medium text-gray-900'
                          }`}>
                            {conversation.customer_name}
                          </h3>
                          <span className={`text-xs ml-2 flex-shrink-0 ${
                            conversation.unread_count > 0 
                              ? 'font-semibold text-gray-900' 
                              : 'text-gray-500'
                          }`}>
                            {formatMessageTime(conversation.last_message_time)}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${
                          conversation.unread_count > 0 
                            ? 'font-semibold text-gray-900' 
                            : 'text-gray-600'
                        }`}>
                          {conversation.last_message || 'No messages yet'}
                        </p>
                      </div>
                      
                      {/* Unread Badge */}
                      {conversation.unread_count > 0 && (
                        <div className="flex-shrink-0 ml-2">
                          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-blue-600 rounded-full">
                            {conversation.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })
              )}
            </div>
          </div>

          {/* Middle Panel - Chat Window */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {selectedConversation.customer_name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedConversation.platform}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 pt-0 pb-4">
                  <div className="space-y-4">
                    {selectedMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {/* Profile Picture for customer messages */}
                        {message.sender === 'customer' && (
                          <div className="flex-shrink-0">
                            {message.sender_avatar ? (
                              <img 
                                src={message.sender_avatar} 
                                alt={message.sender_name || 'Customer'}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 shadow'
                        }`}>
                          {/* Render attachments if available */}
                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mb-2 space-y-2">
                              {message.attachments.map((attachment, index) => {
                                // Image attachment
                                if (attachment.mime_type?.startsWith('image/') && attachment.image_url) {
                                  return (
                                    <img 
                                      key={attachment.id || index}
                                      src={attachment.image_url} 
                                      alt={attachment.name || 'Image'}
                                      className="rounded max-w-full h-auto max-h-64 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    />
                                  );
                                }
                                
                                // Video attachment
                                if (attachment.mime_type?.startsWith('video/') && (attachment.video_url || attachment.file_url)) {
                                  return (
                                    <video 
                                      key={attachment.id || index}
                                      controls 
                                      className="rounded max-w-full h-auto max-h-64"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                      }}
                                    >
                                      <source src={attachment.video_url || attachment.file_url || ''} type={attachment.mime_type} />
                                      Your browser does not support the video tag.
                                    </video>
                                  );
                                }
                                
                                // Audio attachment
                                if (attachment.mime_type?.startsWith('audio/') && attachment.file_url) {
                                  return (
                                    <audio 
                                      key={attachment.id || index}
                                      controls 
                                      className="w-full"
                                    >
                                      <source src={attachment.file_url} type={attachment.mime_type} />
                                      Your browser does not support the audio tag.
                                    </audio>
                                  );
                                }
                                
                                // Generic file attachment
                                if (attachment.file_url) {
                                  return (
                                    <a 
                                      key={attachment.id || index}
                                      href={attachment.file_url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className={`text-sm underline ${
                                        message.sender === 'user' ? 'text-blue-100' : 'text-blue-600'
                                      }`}
                                    >
                                      📎 {attachment.name || 'Download attachment'}
                                    </a>
                                  );
                                }
                                
                                return null;
                              })}
                            </div>
                          )}
                          
                          {/* Legacy: Show image_url if attachments not available */}
                          {!message.attachments && message.image_url && (
                            <div className="mb-2">
                              <img 
                                src={message.image_url} 
                                alt="Attachment"
                                className="rounded max-w-full h-auto max-h-64 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Show text if available */}
                          {message.text && (
                            <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                          )}
                          
                          {/* Show placeholder if no text and no attachments */}
                          {!message.text && (!message.attachments || message.attachments.length === 0) && !message.image_url && message.attachment_type && (
                            <p className="text-sm italic">
                              [{message.attachment_type} attachment]
                            </p>
                          )}
                          
                          <p className={`text-xs mt-1 ${
                            message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {new Date(message.timestamp).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reply Box */}
                <div className="bg-white border-t border-gray-200 px-6 py-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendReply()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || sendingMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {sendingMessage ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Select a conversation to start messaging</p>
              </div>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default function InboxPage() {
  return (
    <AppLayout>
      <InboxContent />
    </AppLayout>
  )
}