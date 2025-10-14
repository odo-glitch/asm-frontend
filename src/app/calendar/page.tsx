'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { CreatePostModal } from '@/components/dashboard/CreatePostModal'
import { Card } from '@/components/ui/card'
import { SocialAccount, fetchUserSocialAccounts } from '@/lib/social-accounts'
import { fetchScheduledPosts, ScheduledPost } from '@/lib/scheduled-posts'
import { generateCalendarPosts } from '@/lib/ai-calendar'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  Sparkles,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Loader2
} from 'lucide-react'

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  posts: ScheduledPost[]
}

interface GenerateCalendarModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (config: CalendarGenerationConfig) => void
  accounts: SocialAccount[]
  isGenerating: boolean
}

interface CalendarGenerationConfig {
  startDate: string
  endDate: string
  postsPerDay: number
  platforms: string[]
  contentTheme: string
  tone: string
}

function PlatformIcon({ platform }: { platform: string }) {
  const icons = {
    facebook: <Facebook className="w-4 h-4" />,
    instagram: <Instagram className="w-4 h-4" />,
    linkedin: <Linkedin className="w-4 h-4" />,
    twitter: <Twitter className="w-4 h-4" />
  }
  return icons[platform as keyof typeof icons] || null
}

function GenerateCalendarModal({ isOpen, onClose, onGenerate, accounts, isGenerating }: GenerateCalendarModalProps) {
  const [config, setConfig] = useState<CalendarGenerationConfig>({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    postsPerDay: 1,
    platforms: [],
    contentTheme: '',
    tone: 'professional'
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate(config)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Generate Calendar</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={config.startDate}
                onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={config.endDate}
                onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Posts Per Day</label>
            <input
              type="number"
              min="1"
              max="5"
              value={config.postsPerDay}
              onChange={(e) => setConfig({ ...config, postsPerDay: parseInt(e.target.value) })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Platforms</label>
            <div className="space-y-2">
              {accounts.map((account) => (
                <label key={account.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={account.platform}
                    checked={config.platforms.includes(account.platform)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({ ...config, platforms: [...config.platforms, account.platform] })
                      } else {
                        setConfig({ ...config, platforms: config.platforms.filter(p => p !== account.platform) })
                      }
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <PlatformIcon platform={account.platform} />
                    <span>{account.account_name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content Theme</label>
            <input
              type="text"
              placeholder="e.g., Product launches, Industry tips, Company culture"
              value={config.contentTheme}
              onChange={(e) => setConfig({ ...config, contentTheme: e.target.value })}
              className="w-full p-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tone</label>
            <select
              value={config.tone}
              onChange={(e) => setConfig({ ...config, tone: e.target.value })}
              className="w-full p-2 border rounded-lg"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="informative">Informative</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isGenerating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={config.platforms.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </span>
              ) : (
                'Generate Calendar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false)
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        const [fetchedAccounts, posts] = await Promise.all([
          fetchUserSocialAccounts(),
          fetchScheduledPosts()
        ])
        setAccounts(fetchedAccounts)
        setScheduledPosts(posts)
      } catch (error) {
        console.error('Failed to load calendar data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleGenerateCalendar = async (config: CalendarGenerationConfig) => {
    setIsGenerating(true)
    try {
      await generateCalendarPosts(config)
      // Refresh scheduled posts after generation
      const posts = await fetchScheduledPosts()
      setScheduledPosts(posts)
      setIsGenerateModalOpen(false)
      // You could add a success notification here
    } catch (error) {
      console.error('Failed to generate calendar:', error)
      // You could add an error notification here
    } finally {
      setIsGenerating(false)
    }
  }

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: CalendarDay[] = []

    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({
        date,
        isCurrentMonth: false,
        posts: getPostsForDate(date)
      })
    }

    // Add days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({
        date,
        isCurrentMonth: true,
        posts: getPostsForDate(date)
      })
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length // 6 weeks * 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({
        date,
        isCurrentMonth: false,
        posts: getPostsForDate(date)
      })
    }

    return days
  }

  const getPostsForDate = (date: Date): ScheduledPost[] => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduled_for)
      return postDate.toDateString() === date.toDateString()
    })
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleDayClick = (date: Date) => {
    setSelectedDate(date)
    setIsModalOpen(true)
  }

  const days = getDaysInMonth(currentDate)
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <AppLayout>
      <Sidebar 
        accounts={accounts} 
        onCreatePost={() => setIsModalOpen(true)}
      />
      
      <div className="ml-64">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold">Content Calendar</h1>
            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              disabled={accounts.length === 0}
            >
              <Sparkles className="w-4 h-4" />
              Generate Calendar
            </button>
          </div>

          {/* Calendar Navigation */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold">{monthName}</h2>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div>
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((day, index) => {
                  const isToday = day.date.toDateString() === new Date().toDateString()
                  const hasScheduledPosts = day.posts.length > 0

                  return (
                    <div
                      key={index}
                      onClick={() => day.isCurrentMonth && handleDayClick(day.date)}
                      className={`
                        min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors
                        ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'}
                        ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}
                        ${!day.isCurrentMonth ? 'opacity-50' : ''}
                      `}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm ${isToday ? 'font-bold text-blue-600' : ''}`}>
                          {day.date.getDate()}
                        </span>
                        {hasScheduledPosts && (
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3 text-blue-600" />
                            <span className="text-xs text-blue-600">{day.posts.length}</span>
                          </div>
                        )}
                      </div>

                      {/* Show scheduled posts preview */}
                      <div className="space-y-1">
                        {day.posts.slice(0, 3).map((post, postIndex) => (
                          <div key={postIndex} className="flex items-center gap-1">
                            <PlatformIcon platform={post.platform} />
                            <span className="text-xs text-gray-600 truncate">
                              {new Date(post.scheduled_for).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        ))}
                        {day.posts.length > 3 && (
                          <span className="text-xs text-gray-500">+{day.posts.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-blue-600" />
                <span>Scheduled Posts</span>
              </div>
            </div>
          </Card>

          {/* Empty state */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading calendar...</p>
            </div>
          ) : accounts.length === 0 ? (
            <Card className="p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No connected accounts found</p>
              <p className="text-gray-400">Connect your social media accounts to start scheduling posts</p>
            </Card>
          ) : null}
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedDate(null)
        }}
        accounts={accounts}
        defaultDate={selectedDate || undefined}
        onPostScheduled={async () => {
          // Refresh scheduled posts after creating a new one
          const posts = await fetchScheduledPosts()
          setScheduledPosts(posts)
        }}
      />

      <GenerateCalendarModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onGenerate={handleGenerateCalendar}
        accounts={accounts}
        isGenerating={isGenerating}
      />
    </AppLayout>
  )
}
