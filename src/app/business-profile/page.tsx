'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts'
import { 
  Eye, 
  Search, 
  MousePointer, 
  Star, 
  TrendingUp,
  MessageSquare,
  Sparkles
} from 'lucide-react'
import Logo from '@/components/Logo'
import { Line, Bar } from 'recharts'
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Types for reviews
interface Review {
  id: string
  platform: 'google' | 'facebook' | 'yelp'
  rating: number
  reviewerName: string
  reviewText: string
  date: string
  replied: boolean
  replyText?: string
}

// Mock data for performance metrics
const mockPerformanceData = {
  totalViews: 12543,
  totalSearches: 3421,
  totalActions: 892,
  viewsChange: 12.5,
  searchesChange: -2.3,
  actionsChange: 8.7
}

// Mock data for charts
const mockViewsData = [
  { date: 'Mon', views: 1200 },
  { date: 'Tue', views: 1350 },
  { date: 'Wed', views: 1100 },
  { date: 'Thu', views: 1400 },
  { date: 'Fri', views: 1600 },
  { date: 'Sat', views: 1800 },
  { date: 'Sun', views: 1500 }
]

const mockActionsData = [
  { action: 'Website Clicks', count: 342 },
  { action: 'Phone Calls', count: 256 },
  { action: 'Directions', count: 189 },
  { action: 'Messages', count: 105 }
]

// Mock reviews data
const mockReviews: Review[] = [
  {
    id: '1',
    platform: 'google',
    rating: 5,
    reviewerName: 'Sarah Johnson',
    reviewText: 'Excellent service! The team was professional and went above and beyond my expectations. Highly recommend!',
    date: '2025-09-28',
    replied: false
  },
  {
    id: '2',
    platform: 'facebook',
    rating: 4,
    reviewerName: 'Mike Chen',
    reviewText: 'Great experience overall. The only minor issue was the wait time, but the quality made up for it.',
    date: '2025-09-25',
    replied: true,
    replyText: 'Thank you for your feedback, Mike! We appreciate your patience and are working on reducing wait times.'
  },
  {
    id: '3',
    platform: 'yelp',
    rating: 3,
    reviewerName: 'Emily Davis',
    reviewText: 'Service was okay, but I expected more based on the reviews. Room for improvement.',
    date: '2025-09-20',
    replied: false
  },
  {
    id: '4',
    platform: 'google',
    rating: 5,
    reviewerName: 'Robert Williams',
    reviewText: 'Outstanding! Best in the area without a doubt. Professional, efficient, and friendly staff.',
    date: '2025-09-18',
    replied: true,
    replyText: 'Thank you so much for your kind words, Robert! We\'re thrilled to hear you had such a positive experience.'
  }
]

export default function BusinessProfilePage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'performance' | 'reviews'>('performance')
  const [selectedReview, setSelectedReview] = useState<Review | null>(mockReviews[0])
  const [replyText, setReplyText] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [reviews, setReviews] = useState<Review[]>(mockReviews)

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
      } catch (error) {
        console.error('Failed to load data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleGenerateAIReply = async () => {
    if (!selectedReview) return
    
    setIsGeneratingAI(true)
    try {
      const response = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewText: selectedReview.reviewText,
          rating: selectedReview.rating,
          reviewerName: selectedReview.reviewerName
        })
      })

      if (!response.ok) throw new Error('Failed to generate reply')

      const data = await response.json()
      setReplyText(data.reply)
    } catch (error) {
      console.error('Failed to generate AI reply:', error)
      // Fallback to a template response
      const templates = [
        `Thank you for your feedback, ${selectedReview.reviewerName}! We truly appreciate you taking the time to share your experience with us.`,
        `Hi ${selectedReview.reviewerName}, thank you for your review! Your feedback is invaluable to us and helps us improve our service.`,
        `Dear ${selectedReview.reviewerName}, we appreciate your honest feedback. We're always striving to provide the best experience possible.`
      ]
      setReplyText(templates[Math.floor(Math.random() * templates.length)])
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handlePostReply = () => {
    if (!selectedReview || !replyText.trim()) return

    // Update the review with the reply
    setReviews(prev => prev.map(review => 
      review.id === selectedReview.id 
        ? { ...review, replied: true, replyText: replyText }
        : review
    ))
    
    // Update selected review
    setSelectedReview(prev => prev ? { ...prev, replied: true, replyText: replyText } : null)
    
    // Clear reply text
    setReplyText('')
    
    // In a real app, you would send this to your backend
    console.log('Posting reply:', replyText)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    )
  }

  if (isLoading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading business profile...</p>
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

        {/* Main Content */}
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
              <p className="text-gray-600 mt-1">Monitor your business performance and manage customer reviews</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('performance')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'performance'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Performance
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'reviews'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reviews
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'performance' ? (
              <div className="space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Total Views */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Views</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {mockPerformanceData.totalViews.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        mockPerformanceData.viewsChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="w-4 h-4" />
                        {Math.abs(mockPerformanceData.viewsChange)}%
                      </div>
                    </div>
                  </div>

                  {/* Total Searches */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Search className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Searches</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {mockPerformanceData.totalSearches.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        mockPerformanceData.searchesChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className={mockPerformanceData.searchesChange < 0 ? 'rotate-180' : ''} />
                        {Math.abs(mockPerformanceData.searchesChange)}%
                      </div>
                    </div>
                  </div>

                  {/* Total Actions */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <MousePointer className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Actions</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {mockPerformanceData.totalActions.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1 text-sm font-medium ${
                        mockPerformanceData.actionsChange > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <TrendingUp className="w-4 h-4" />
                        {Math.abs(mockPerformanceData.actionsChange)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Views Over Time */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Views Over Time</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={mockViewsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Line 
                            type="monotone" 
                            dataKey="views" 
                            stroke="#3B82F6" 
                            strokeWidth={2}
                            dot={{ fill: '#3B82F6' }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Customer Actions */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Actions</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={mockActionsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="action" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="count" fill="#8B5CF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-6">
                {/* Left Panel - Reviews List */}
                <div className="w-1/3 bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
                    <p className="text-sm text-gray-600 mt-1">{reviews.length} total reviews</p>
                  </div>
                  <div className="divide-y divide-gray-100 overflow-y-auto max-h-[calc(100vh-20rem)]">
                    {reviews.map((review) => (
                      <button
                        key={review.id}
                        onClick={() => {
                          setSelectedReview(review)
                          setReplyText('')
                        }}
                        className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                          selectedReview?.id === review.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {renderStars(review.rating)}
                              <span className="text-xs text-gray-500">{review.platform}</span>
                            </div>
                            {review.replied && (
                              <MessageSquare className="w-4 h-4 text-green-600" />
                            )}
                          </div>
                          <p className="font-medium text-sm text-gray-900">{review.reviewerName}</p>
                          <p className="text-sm text-gray-600 line-clamp-2">{review.reviewText}</p>
                          <p className="text-xs text-gray-500">{review.date}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Panel - Review Details */}
                <div className="flex-1 bg-white rounded-lg shadow">
                  {selectedReview ? (
                    <div className="p-6 space-y-6">
                      {/* Review Header */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {renderStars(selectedReview.rating)}
                            <span className="text-sm text-gray-500 capitalize">{selectedReview.platform}</span>
                          </div>
                          <span className="text-sm text-gray-500">{selectedReview.date}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">{selectedReview.reviewerName}</h3>
                      </div>

                      {/* Review Text */}
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{selectedReview.reviewText}</p>
                      </div>

                      {/* Previous Reply */}
                      {selectedReview.replied && selectedReview.replyText && (
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <p className="text-sm font-medium text-gray-700">Your Reply:</p>
                          <p className="text-sm text-gray-600">{selectedReview.replyText}</p>
                        </div>
                      )}

                      {/* Reply Section */}
                      {!selectedReview.replied && (
                        <div className="space-y-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">Write a Reply</h4>
                            <button
                              onClick={handleGenerateAIReply}
                              disabled={isGeneratingAI}
                              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Sparkles className="w-4 h-4" />
                              {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                            </button>
                          </div>
                          
                          <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Type your reply here..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                          />
                          
                          <button
                            onClick={handlePostReply}
                            disabled={!replyText.trim()}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                          >
                            Post Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>Select a review to view details</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}