'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts'
import { Twitter, Facebook, Linkedin, Send, User, Instagram } from 'lucide-react'
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

// Platform icons mapping
const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  instagram: Instagram,
}

const platformColors = {
  twitter: 'bg-blue-400',
  facebook: 'bg-blue-600',
  linkedin: 'bg-blue-700',
  instagram: 'bg-purple-600',
}

// Helper to generate mock conversations with correct schema
function generateMockConversations(): Conversation[] {
  const userId = 'mock-user-id'
  const now = new Date()
  
  return [
    {
      id: '1',
      user_id: userId,
      platform: 'twitter',
      customer_id: 'twitter_sarah_123',
      customer_name: 'Sarah Johnson',
      customer_avatar: null,
      last_message: 'Hi, I love your product! Can you tell me more about...',
      last_message_time: new Date(now.getTime() - 2 * 60000).toISOString(), // 2 minutes ago
      unread_count: 2,
      metadata: {},
      created_at: new Date(now.getTime() - 86400000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 60000).toISOString()
    },
    {
      id: '2',
      user_id: userId,
      platform: 'facebook',
      customer_id: 'fb_mike_456',
      customer_name: 'Mike Thompson',
      customer_avatar: null,
      last_message: 'Thanks for the quick response!',
      last_message_time: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
      unread_count: 0,
      metadata: {},
      created_at: new Date(now.getTime() - 172800000).toISOString(),
      updated_at: new Date(now.getTime() - 3600000).toISOString()
    },
    {
      id: '3',
      user_id: userId,
      platform: 'linkedin',
      customer_id: 'li_emily_789',
      customer_name: 'Emily Davis',
      customer_avatar: null,
      last_message: 'Looking forward to connecting!',
      last_message_time: new Date(now.getTime() - 10800000).toISOString(), // 3 hours ago
      unread_count: 1,
      metadata: {},
      created_at: new Date(now.getTime() - 259200000).toISOString(),
      updated_at: new Date(now.getTime() - 10800000).toISOString()
    }
  ]
}

// Helper to generate mock messages
function generateMockMessages(conversationId: string): Message[] {
  const now = new Date()
  const messages: Record<string, Message[]> = {
    '1': [
      {
        id: '1-1',
        conversation_id: '1',
        platform_message_id: 'tw_msg_001',
        text: 'Hi there! I saw your recent post about the new features.',
        sender: 'customer',
        timestamp: new Date(now.getTime() - 300000).toISOString(),
        read: false,
        metadata: {},
        created_at: new Date(now.getTime() - 300000).toISOString()
      },
      {
        id: '1-2',
        conversation_id: '1',
        platform_message_id: 'tw_msg_002',
        text: 'Thank you for reaching out! I\'d be happy to help.',
        sender: 'user',
        timestamp: new Date(now.getTime() - 240000).toISOString(),
        read: true,
        metadata: {},
        created_at: new Date(now.getTime() - 240000).toISOString()
      },
      {
        id: '1-3',
        conversation_id: '1',
        platform_message_id: 'tw_msg_003',
        text: 'Hi, I love your product! Can you tell me more about the pricing plans?',
        sender: 'customer',
        timestamp: new Date(now.getTime() - 120000).toISOString(),
        read: false,
        metadata: {},
        created_at: new Date(now.getTime() - 120000).toISOString()
      }
    ],
    '2': [
      {
        id: '2-1',
        conversation_id: '2',
        platform_message_id: 'fb_msg_001',
        text: 'Is your service available in Canada?',
        sender: 'customer',
        timestamp: new Date(now.getTime() - 5400000).toISOString(),
        read: true,
        metadata: {},
        created_at: new Date(now.getTime() - 5400000).toISOString()
      },
      {
        id: '2-2',
        conversation_id: '2',
        platform_message_id: 'fb_msg_002',
        text: 'Yes! We offer full service across Canada.',
        sender: 'user',
        timestamp: new Date(now.getTime() - 4500000).toISOString(),
        read: true,
        metadata: {},
        created_at: new Date(now.getTime() - 4500000).toISOString()
      },
      {
        id: '2-3',
        conversation_id: '2',
        platform_message_id: 'fb_msg_003',
        text: 'Thanks for the quick response!',
        sender: 'customer',
        timestamp: new Date(now.getTime() - 3600000).toISOString(),
        read: true,
        metadata: {},
        created_at: new Date(now.getTime() - 3600000).toISOString()
      }
    ],
    '3': [
      {
        id: '3-1',
        conversation_id: '3',
        platform_message_id: 'li_msg_001',
        text: 'I\'m interested in learning more about your B2B solutions.',
        sender: 'customer',
        timestamp: new Date(now.getTime() - 14400000).toISOString(),
        read: true,
        metadata: {},
        created_at: new Date(now.getTime() - 14400000).toISOString()
      },
      {
        id: '3-2',
        conversation_id: '3',
        platform_message_id: 'li_msg_002',
        text: 'I\'d be happy to schedule a call to discuss our enterprise options.',
        sender: 'user',
        timestamp: new Date(now.getTime() - 12600000).toISOString(),
        read: true,
        metadata: {},
        created_at: new Date(now.getTime() - 12600000).toISOString()
      },
      {
        id: '3-3',
        conversation_id: '3',
        platform_message_id: 'li_msg_003',
        text: 'Looking forward to connecting!',
        sender: 'customer',
        timestamp: new Date(now.getTime() - 10800000).toISOString(),
        read: false,
        metadata: {},
        created_at: new Date(now.getTime() - 10800000).toISOString()
      }
    ]
  }
  
  return messages[conversationId] || []
}

export default function InboxPage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [selectedMessages, setSelectedMessages] = useState<Message[]>([])
  const [replyText, setReplyText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [dbError, setDbError] = useState<string | null>(null)

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
        
        // Fetch conversations from database
        try {
          const conversations = await fetchConversations()
          if (conversations.length > 0) {
            setConversations(conversations)
            setSelectedConversation(conversations[0])
            const messages = await fetchMessages(conversations[0].id)
            setSelectedMessages(messages)
          } else {
            // Use mock data if no real conversations
            const mockConvs = generateMockConversations()
            setConversations(mockConvs)
            setSelectedConversation(mockConvs[0])
            setSelectedMessages(generateMockMessages(mockConvs[0].id))
          }
        } catch (error: any) {
          console.error('Failed to fetch conversations:', error)
          
          // Check if it's a "relation does not exist" error
          if (error?.message?.includes('relation') && error?.message?.includes('does not exist')) {
            setDbError('Database tables not found. Please run migrations to enable message storage.')
            console.warn('📋 Database tables not found. Please run the migration:')
            console.warn('📋 npx supabase migration up')
            console.warn('📋 Or apply the SQL from: supabase/migrations/003_create_messages_tables.sql')
          }
          
          // Fallback to mock data
          const mockConvs = generateMockConversations()
          setConversations(mockConvs)
          setSelectedConversation(mockConvs[0])
          setSelectedMessages(generateMockMessages(mockConvs[0].id))
        }
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return

    setSendingMessage(true)
    try {
      // Send message to database
      const newMessage = await sendMessage(selectedConversation.id, replyText)
      
      // Add to local state
      setSelectedMessages(prev => [...prev, newMessage])

      // Update the conversation in the list
      setConversations(convs => convs.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            last_message: replyText,
            last_message_time: new Date().toISOString()
          }
        }
        return conv
      }))

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
    
    // Fetch messages for this conversation
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
      // Fallback to mock messages
      setSelectedMessages(generateMockMessages(conversation.id))
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
        <Sidebar accounts={accounts} />

        {/* Main Content - Three Panel Layout */}
        <div className="flex-1 ml-64 flex flex-col">
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
                    <a href="/docs/inbox-setup.md" className="ml-1 font-medium underline text-yellow-700 hover:text-yellow-600">
                      View setup guide
                    </a>
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
              {conversations.map((conversation) => {
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
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {conversation.customer_name}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {formatMessageTime(conversation.last_message_time)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 truncate">
                          {conversation.last_message}
                        </p>
                      </div>
                      
                      {/* Unread Badge */}
                      {conversation.unread_count > 0 && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                            {conversation.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
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
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-4">
                    {selectedMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-900 shadow'
                        }`}>
                          <p className="text-sm">{message.text}</p>
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
  )
}