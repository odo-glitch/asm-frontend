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
  Sparkles,
  Globe
} from 'lucide-react'
import Logo from '@/components/Logo'
import { Line, Bar } from 'recharts'
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Types for business profile data
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

interface PerformanceData {
  totalViews: number
  totalSearches: number
  totalActions: number
  viewsChange: number
  searchesChange: number
  actionsChange: number
}

interface ViewsData {
  date: string
  views: number
}

interface ActionData {
  action: string
  count: number
}

interface BusinessProfile {
  isConnected: boolean
  performanceData?: PerformanceData
  viewsData?: ViewsData[]
  actionsData?: ActionData[]
  reviews?: Review[]
}

export default function BusinessProfilePage() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null)
  const [activeTab, setActiveTab] = useState<'performance' | 'reviews'>('performance')
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({ isConnected: false })
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Connect Google Business Profile
  const handleConnectGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google-business`
  }

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

        // Fetch business profile data
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/business-profile`, {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data: BusinessProfile = await response.json()
          setBusinessProfile(data)
          if (data.reviews?.[0]) {
            setSelectedReview(data.reviews[0])
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
    } finally {
      setIsGeneratingAI(false)
    }
  }

  const handlePostReply = async () => {
    if (!selectedReview || !replyText.trim()) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/business-profile/reviews/${selectedReview.id}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ replyText })
      })

      if (!response.ok) throw new Error('Failed to post reply')

      // Update the review in the state
      setBusinessProfile(prev => ({
        ...prev,
        reviews: prev.reviews?.map(review =>
          review.id === selectedReview.id
            ? { ...review, replied: true, replyText }
            : review
        )
      }))
      
      // Update selected review
      setSelectedReview(prev => prev ? { ...prev, replied: true, replyText } : null)
      
      // Clear reply text
      setReplyText('')
    } catch (error) {
      console.error('Failed to post reply:', error)
    }
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
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading business profile...</p>
        </div>
      </div>
    )
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
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
                <p className="text-gray-600 mt-1">Monitor your business performance and manage customer reviews</p>
              </div>
              {!businessProfile.isConnected && (
                <button
                  onClick={handleConnectGoogle}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Connect Google Business Profile
                </button>
              )}
            </div>

            {!businessProfile.isConnected ? (
              <div className="text-center py-12">
                <Globe className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No business profile connected</h3>
                <p className="mt-1 text-sm text-gray-500">Connect your Google Business Profile to start managing your business presence.</p>
                <div className="mt-6">
                  <button
                    onClick={handleConnectGoogle}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Connect Google Business Profile
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                                {businessProfile.performanceData?.totalViews.toLocaleString() ?? '0'}
                              </p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 text-sm font-medium ${
                            (businessProfile.performanceData?.viewsChange ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <TrendingUp className="w-4 h-4" />
                            {Math.abs(businessProfile.performanceData?.viewsChange ?? 0)}%
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
                                {businessProfile.performanceData?.totalSearches.toLocaleString() ?? '0'}
                              </p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 text-sm font-medium ${
                            (businessProfile.performanceData?.searchesChange ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <TrendingUp className={(businessProfile.performanceData?.searchesChange ?? 0) < 0 ? 'rotate-180' : ''} />
                            {Math.abs(businessProfile.performanceData?.searchesChange ?? 0)}%
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
                                {businessProfile.performanceData?.totalActions.toLocaleString() ?? '0'}
                              </p>
                            </div>
                          </div>
                          <div className={`flex items-center gap-1 text-sm font-medium ${
                            (businessProfile.performanceData?.actionsChange ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            <TrendingUp className="w-4 h-4" />
                            {Math.abs(businessProfile.performanceData?.actionsChange ?? 0)}%
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
                            <LineChart data={businessProfile.viewsData ?? []}>
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
                            <BarChart data={businessProfile.actionsData ?? []}>
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
                        <p className="text-sm text-gray-600 mt-1">{businessProfile.reviews?.length ?? 0} total reviews</p>
                      </div>
                      <div className="divide-y divide-gray-100 overflow-y-auto max-h-[calc(100vh-20rem)]">
                        {businessProfile.reviews?.map((review) => (
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}