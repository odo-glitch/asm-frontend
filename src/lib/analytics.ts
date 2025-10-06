import { createClient } from '@/lib/supabase/client'

export interface AnalyticsData {
  totalImpressions: number
  totalEngagements: number
  followerGrowth: number
  postsPublished: number
  engagementData: Array<{
    day: string
    engagement: number
    impressions: number
  }>
  platformData: Array<{
    platform: string
    engagement: number
    accountName: string
  }>
  followerGrowthData: Array<{
    week: string
    followers: number
  }>
  topPosts: Array<{
    id: string
    content: string
    platform: string
    likes: number
    comments: number
    date: string
  }>
}

export async function fetchAnalyticsData(timeframe: string = '30days'): Promise<AnalyticsData> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  // Calculate date range based on timeframe
  const days = timeframe === '7days' ? 7 : timeframe === '30days' ? 30 : 90
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    // Fetch analytics events
    const { data: events, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (eventsError) {
      console.error('Error fetching analytics events:', eventsError)
    }

    // Fetch post analytics
    const { data: posts, error: postsError } = await supabase
      .from('post_analytics')
      .select('*')
      .gte('posted_at', startDate.toISOString())
      .order('likes', { ascending: false })
      .limit(5)

    if (postsError) {
      console.error('Error fetching post analytics:', postsError)
    }

    // Fetch follower history
    const { data: followerHistory, error: followerError } = await supabase
      .from('follower_history')
      .select('*')
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true })

    if (followerError) {
      console.error('Error fetching follower history:', followerError)
    }

    // Process data for charts
    const engagementByDay = processEngagementData(events || [], days)
    const platformEngagement = processPlatformData(events || [])
    const followerGrowth = processFollowerGrowth(followerHistory || [])
    const topPostsFormatted = formatTopPosts(posts || [])

    // Calculate totals
    const totalImpressions = events?.reduce((sum, e) => 
      e.event_type === 'impression' ? sum + (e.value || 1) : sum, 0) || 0
    const totalEngagements = events?.reduce((sum, e) => 
      ['engagement', 'like', 'comment', 'share'].includes(e.event_type) ? sum + (e.value || 1) : sum, 0) || 0
    const followerGrowthCount = calculateFollowerGrowth(followerHistory || [])
    const postsPublished = posts?.length || 0

    return {
      totalImpressions,
      totalEngagements,
      followerGrowth: followerGrowthCount,
      postsPublished,
      engagementData: engagementByDay,
      platformData: platformEngagement,
      followerGrowthData: followerGrowth,
      topPosts: topPostsFormatted
    }
  } catch (error) {
    console.error('Error in fetchAnalyticsData:', error)
    // Return default data structure
    return {
      totalImpressions: 0,
      totalEngagements: 0,
      followerGrowth: 0,
      postsPublished: 0,
      engagementData: [],
      platformData: [],
      followerGrowthData: [],
      topPosts: []
    }
  }
}

interface AnalyticsEvent {
  created_at: string;
  event_type: string;
  value?: number;
  platform?: string;
}

function processEngagementData(events: AnalyticsEvent[], days: number) {
  const data = []
  const today = new Date()
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.created_at)
      return eventDate.toDateString() === date.toDateString()
    })
    
    const engagement = dayEvents.filter(e => 
      ['engagement', 'like', 'comment', 'share'].includes(e.event_type)
    ).reduce((sum, e) => sum + (e.value || 1), 0)
    
    const impressions = dayEvents.filter(e => 
      e.event_type === 'impression'
    ).reduce((sum, e) => sum + (e.value || 1), 0)
    
    data.push({ day: dateStr, engagement, impressions })
  }
  
  return data
}

interface PlatformData {
  platform: string;
  engagement: number;
  accountName: string;
}

function processPlatformData(events: AnalyticsEvent[]) {
  const platformMap = new Map<string, PlatformData>()
  
  events.forEach(event => {
    if (!event.platform) return
    
    const key = event.platform
    if (!platformMap.has(key)) {
      platformMap.set(key, {
        platform: event.platform,
        engagement: 0,
        accountName: '' // This would be filled from social_accounts join
      })
    }
    
    if (['engagement', 'like', 'comment', 'share'].includes(event.event_type)) {
      const current = platformMap.get(key)
      if (current) {
        current.engagement += (event.value || 1)
        platformMap.set(key, current)
      }
    }
  })
  
  return Array.from(platformMap.values())
}

function processFollowerGrowth(history: FollowerHistory[]) {
  // Group by week
  const weeklyData = []
  const weeks = 7
  
  for (let i = 0; i < weeks; i++) {
    const weekData = history.filter(h => {
      const recordDate = new Date(h.recorded_at)
      const weekNumber = Math.floor((Date.now() - recordDate.getTime()) / (7 * 24 * 60 * 60 * 1000))
      return weekNumber === i
    })
    
    const avgFollowers = weekData.length > 0
      ? Math.round(weekData.reduce((sum, h) => sum + h.follower_count, 0) / weekData.length)
      : 0
      
    weeklyData.unshift({
      week: `Week ${weeks - i}`,
      followers: avgFollowers
    })
  }
  
  return weeklyData
}

interface FollowerHistory {
  recorded_at: string;
  follower_count: number;
}

function calculateFollowerGrowth(history: FollowerHistory[]): number {
  if (history.length < 2) return 0
  
  const sorted = history.sort((a, b) => 
    new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  )
  
  const oldest = sorted[0]
  const newest = sorted[sorted.length - 1]
  
  return newest.follower_count - oldest.follower_count
}

interface Post {
  id: string;
  content?: string;
  platform: string;
  likes?: number;
  comments?: number;
  posted_at: string;
}

function formatTopPosts(posts: Post[]) {
  return posts.map(post => ({
    id: post.id,
    content: post.content || 'No content available',
    platform: post.platform,
    likes: post.likes || 0,
    comments: post.comments || 0,
    date: post.posted_at
  }))
}