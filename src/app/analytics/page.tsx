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
  change: number
  icon: React.ReactNode
}

function KPICard({ title, value, change, icon }: KPICardProps) {
  const isPositive = change >= 0

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          {icon}
        </div>
        <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>{Math.abs(change)}%</span>
        </div>
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
        // Generate analytics based on connected accounts
        if (accounts.length > 0) {
          // Generate engagement data for the last 30 days
          const days = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90
          const engagement = Array.from({ length: days }, (_, i) => ({
            day: new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            engagement: Math.floor(Math.random() * 800 * accounts.length) + 200,
            impressions: Math.floor(Math.random() * 2500 * accounts.length) + 1000
          }))

          // Platform data based on connected accounts
          const platforms = accounts.reduce((acc: Array<{ platform: string; engagement: number; accountName: string }>, account: SocialAccount) => {
            const engagementValue = Math.floor(Math.random() * 5000) + 1000
            acc.push({ 
              platform: account.platform.charAt(0).toUpperCase() + account.platform.slice(1),
              engagement: engagementValue,
              accountName: account.account_name
            })
            return acc
          }, [])

          // Follower growth data
          const followerGrowth = Array.from({ length: 7 }, (_, i) => ({
            week: `Week ${i + 1}`,
            followers: 10000 + (i * 250 * accounts.length) + Math.floor(Math.random() * 100)
          }))

          // Top posts based on connected accounts
          const posts = accounts.flatMap((account: SocialAccount) => [
            {
              id: `${account.id}-1`,
              content: `Great engagement on ${account.platform}! Thanks to all our followers.`,
              platform: account.platform.charAt(0).toUpperCase() + account.platform.slice(1),
              likes: Math.floor(Math.random() * 3000) + 500,
              comments: Math.floor(Math.random() * 200) + 20,
              date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
            }
          ])

          setAnalyticsData({
            totalImpressions: engagement.reduce((sum, day) => sum + day.impressions, 0),
            totalEngagements: engagement.reduce((sum, day) => sum + day.engagement, 0),
            followerGrowth: Math.floor(Math.random() * 2000) + 500,
            postsPublished: accounts.length * 12,
            engagementData: engagement,
            platformData: platforms,
            followerGrowthData: followerGrowth,
            topPosts: posts.sort((a, b) => b.likes - a.likes).slice(0, 5)
          })
        }
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Impressions"
          value={formatNumber(analyticsData.totalImpressions)}
          change={12.5}
          icon={<Eye className="w-6 h-6 text-blue-600" />}
        />
        <KPICard
          title="Total Engagements"
          value={formatNumber(analyticsData.totalEngagements)}
          change={8.3}
          icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
        />
        <KPICard
          title="Follower Growth"
          value={`+${formatNumber(analyticsData.followerGrowth)}`}
          change={15.2}
          icon={<Users className="w-6 h-6 text-blue-600" />}
        />
        <KPICard
          title="Posts Published"
          value={analyticsData.postsPublished}
          change={-5.2}
          icon={<FileText className="w-6 h-6 text-blue-600" />}
        />
      </div>

      {/* Main Chart - Engagement Over Time */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Engagement Over Time</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={analyticsData.engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                interval={4}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
                name="Engagements"
              />
              <Line
                type="monotone"
                dataKey="impressions"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
                name="Impressions"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Comparison Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

        {/* Follower Growth */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Follower Growth</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.followerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="followers"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ fill: '#10B981', r: 4 }}
                />
              </LineChart>
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
