'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout, useMobileMenu } from '@/components/layout/AppLayout'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card } from '@/components/ui/card'
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts'
import { 
  Users, 
  Eye, 
  MessageSquare,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Facebook,
  Linkedin,
  Instagram 
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface KPICardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
}

function KPICard({ title, value, change, icon }: KPICardProps) {
  const isPositive = change !== undefined ? change >= 0 : true

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </Card>
  )
}

function PlatformIcon({ platform }: { platform: string }) {
  const icons = {
    Facebook: <Facebook className="w-5 h-5 text-blue-600" />,
    Instagram: <Instagram className="w-5 h-5 text-pink-600" />,
    LinkedIn: <Linkedin className="w-5 h-5 text-blue-700" />,
    Twitter: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    X: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    TikTok: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    )
  }
  return icons[platform as keyof typeof icons] || null
}

function AnalyticsContent() {
  const router = useRouter()
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useMobileMenu()
  const [timeframe, setTimeframe] = useState('30days')
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  interface AnalyticsDataType {
    totalImpressions: number;
    totalEngagements: number;
    followerGrowth: number;
    postsPublished: number;
    engagementData: Array<{ day: string; engagement: number; impressions: number }>;
    platformData: Array<{ platform: string; engagement: number; accountName: string }>;
    followerGrowthData: Array<{ week: string; followers: number }>;
    topPosts: Array<{ id: string; content: string; platform: string; likes: number; comments: number; date: string }>;
  }

  const [analyticsData, setAnalyticsData] = useState<AnalyticsDataType>({
    totalImpressions: 0,
    totalEngagements: 0,
    followerGrowth: 0,
    postsPublished: 0,
    engagementData: [],
    platformData: [],
    followerGrowthData: [],
    topPosts: []
  })

  // Load accounts on mount
  useEffect(() => {
    async function loadAccounts() {
      try {
        const fetchedAccounts = await fetchUserSocialAccounts()
        setAccounts(fetchedAccounts)
      } catch (error) {
        console.error('Failed to load accounts:', error)
      }
    }
    loadAccounts()
  }, [])

  // Load analytics data when timeframe or accounts change
  useEffect(() => {
    async function loadAnalyticsData() {
      if (accounts.length === 0) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const days = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90
        
        // Fetch real analytics from backend for each platform
        const analyticsPromises = accounts.map(async (account: SocialAccount) => {
          try {
            const userId = account.user_id
            const platform = account.platform.toLowerCase()
            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/${platform}/analytics/${userId}?days=${days}`
            
            console.log(`Fetching analytics for ${account.platform} (${account.account_name}):`, url)
            
            const response = await fetch(url)
            
            if (!response.ok) {
              const errorText = await response.text()
              console.error(`Failed to fetch ${account.platform} analytics:`, response.status, errorText)
              return null
            }
            
            const data = await response.json()
            console.log(`✓ Got ${account.platform} analytics:`, data.analytics)
            return data
          } catch (error) {
            console.error(`Error fetching ${account.platform} analytics:`, error)
            return null
          }
        })

        const analyticsResults = await Promise.all(analyticsPromises)
        const validAnalytics = analyticsResults.filter(result => result !== null)

        if (validAnalytics.length === 0) {
          // No data available, set empty state
          setAnalyticsData({
            totalImpressions: 0,
            totalEngagements: 0,
            followerGrowth: 0,
            postsPublished: 0,
            engagementData: [],
            platformData: [],
            followerGrowthData: [],
            topPosts: []
          })
          setIsLoading(false)
          return
        }

        // Aggregate analytics from all platforms
        const totalEngagements = validAnalytics.reduce((sum, result) => sum + result.analytics.total_engagements, 0)
        const totalPosts = validAnalytics.reduce((sum, result) => sum + result.analytics.total_posts, 0)

        // Platform data for chart
        const platformData = validAnalytics.map(result => ({
          platform: result.platform.charAt(0).toUpperCase() + result.platform.slice(1),
          engagement: result.analytics.total_engagements,
          accountName: result.account_name
        }))

        // Collect all posts from all platforms
        interface PostData {
          id: string;
          content: string;
          platform: string;
          likes: number;
          comments: number;
          shares?: number;
          engagement?: number;
          created_time: string;
        }

        const allPosts = validAnalytics.flatMap(result => 
          result.posts.map((post: PostData) => ({
            id: post.id,
            content: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
            platform: result.platform.charAt(0).toUpperCase() + result.platform.slice(1),
            likes: post.likes,
            comments: post.comments,
            date: post.created_time
          }))
        )

        // Sort by engagement (likes + comments) and get top 5
        const topPosts = allPosts
          .sort((a, b) => (b.likes + b.comments) - (a.likes + a.comments))
          .slice(0, 5)

        // Generate engagement timeline (simplified - would need more detailed API data for actual timeline)
        const engagementData = Array.from({ length: days }, (_, i) => ({
          day: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          engagement: Math.floor(totalEngagements / days),
          impressions: 0 // Would need additional API calls for impressions
        }))

        setAnalyticsData({
          totalImpressions: 0, // Not available from current API
          totalEngagements: totalEngagements,
          followerGrowth: 0, // Would need additional API call
          postsPublished: totalPosts,
          engagementData: engagementData,
          platformData: platformData,
          followerGrowthData: [], // Would need additional API call
          topPosts: topPosts
        })
      } catch (error) {
        console.error('Failed to load analytics data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalyticsData()
  }, [accounts, timeframe])

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <>
      <Sidebar 
        accounts={accounts} 
        onCreatePost={() => router.push('/create-post')}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="lg:ml-64">
        <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
          <option value="90days">Last 90 days</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      ) : accounts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No connected accounts found. Connect your social media accounts to see analytics.</p>
          <button
            onClick={() => router.push('/settings')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Connect Accounts
          </button>
        </div>
      ) : (
        <>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="Total Engagements"
          value={formatNumber(analyticsData.totalEngagements)}
          icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
        />
        <KPICard
          title="Posts Published"
          value={analyticsData.postsPublished}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
        />
      </div>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Performance by Platform */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Performance by Platform</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.platformData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="platform" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white p-2 border rounded shadow-sm">
                          <p className="text-sm font-semibold">{payload[0].payload.accountName}</p>
                          <p className="text-sm">{payload[0].payload.platform}</p>
                          <p className="text-sm text-blue-600">Engagement: {payload[0].value?.toLocaleString()}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar 
                  dataKey="engagement" 
                  fill="#3B82F6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Top Performing Posts Table */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Top-Performing Posts</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium text-gray-700">Post Content</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Platform</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Likes</th>
                <th className="text-center py-3 px-4 font-medium text-gray-700">Comments</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.topPosts.map((post) => (
                <tr key={post.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="text-sm line-clamp-2 max-w-md">{post.content}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={post.platform} />
                      <span className="text-sm">{post.platform}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium">{post.likes.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span className="font-medium">{post.comments.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {new Date(post.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </>
      )}
    </div>
      </div>
    </>
  )
}

export default function AnalyticsPage() {
  return (
    <AppLayout>
      <AnalyticsContent />
    </AppLayout>
  )
}
