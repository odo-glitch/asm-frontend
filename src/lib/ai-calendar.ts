import { createClient } from '@/lib/supabase/client'
import { SocialAccount } from './social-accounts'

interface CalendarGenerationConfig {
  startDate: string
  endDate: string
  postsPerDay: number
  platforms: string[]
  contentTheme: string
  tone: string
}

interface GeneratedPost {
  content: string
  platform: string
  scheduledTime: Date
}

export async function generateCalendarPosts(config: CalendarGenerationConfig) {
  const supabase = createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Fetch user's social accounts for the selected platforms
  const { data: accounts, error: accountsError } = await supabase
    .from('social_accounts')
    .select('*')
    .in('platform', config.platforms)
    .eq('user_id', user.id)

  if (accountsError) {
    throw new Error('Failed to fetch social accounts')
  }

  // Generate posts using OpenAI
  const posts = await generatePostsWithAI(config, accounts || [])

  // Save all generated posts to the database
  const postsToInsert = posts.map(post => {
    const account = accounts?.find(acc => acc.platform === post.platform)
    return {
      user_id: user.id,
      social_account_id: account?.id,
      content: post.content,
      scheduled_for: post.scheduledTime.toISOString(),
      status: 'scheduled'
    }
  })

  const { data: insertedPosts, error: insertError } = await supabase
    .from('scheduled_posts')
    .insert(postsToInsert)
    .select()

  if (insertError) {
    console.error('Error inserting scheduled posts:', insertError)
    throw insertError
  }

  return insertedPosts
}

async function generatePostsWithAI(
  config: CalendarGenerationConfig, 
  accounts: SocialAccount[]
): Promise<GeneratedPost[]> {
  const posts: GeneratedPost[] = []
  
  const startDate = new Date(config.startDate)
  const endDate = new Date(config.endDate)
  const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  for (let dayOffset = 0; dayOffset < daysDiff; dayOffset++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(startDate.getDate() + dayOffset)

    for (let postNum = 0; postNum < config.postsPerDay; postNum++) {
      // Rotate through platforms
      const platformIndex = (dayOffset * config.postsPerDay + postNum) % config.platforms.length
      const platform = config.platforms[platformIndex]
      
      // Set posting time (distribute throughout the day)
      const hour = 9 + (postNum * 4) // Posts at 9 AM, 1 PM, 5 PM, etc.
      const scheduledTime = new Date(currentDate)
      scheduledTime.setHours(hour, 0, 0, 0)

      try {
        // Generate content using the OpenAI API through our route
        const response = await fetch('/api/generate-post', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: `${config.contentTheme} - Create engaging content for day ${dayOffset + 1} of our content calendar`,
            platform,
            tone: config.tone
          })
        })

        if (!response.ok) {
          throw new Error('Failed to generate content')
        }

        const { content } = await response.json()

        posts.push({
          content,
          platform,
          scheduledTime
        })
      } catch (error) {
        console.error('Error generating post with AI:', error)
        // Fallback to template-based generation
        const templates = getContentTemplates(config.tone, config.contentTheme)
        const content = generatePlatformSpecificContent(
          platform,
          templates,
          config.contentTheme,
          dayOffset
        )

        posts.push({
          content,
          platform,
          scheduledTime
        })
      }
    }
  }

  return posts
}

function getContentTemplates(tone: string, theme: string): string[] {
  const baseTemplates: Record<string, string[]> = {
    professional: [
      `Excited to share insights on ${theme}. What are your thoughts on this topic?`,
      `Did you know? Here's a key fact about ${theme} that might surprise you.`,
      `Industry update: Latest developments in ${theme} you should know about.`,
      `Pro tip: Here's how to make the most of ${theme} in your work.`
    ],
    casual: [
      `Hey everyone! Let's chat about ${theme} today 🚀`,
      `Quick thought on ${theme} - would love to hear your take!`,
      `${theme} made simple - here's what you need to know 💡`,
      `Weekend vibes and thinking about ${theme}. Anyone else? 😊`
    ],
    friendly: [
      `Happy to share some thoughts on ${theme} with you all!`,
      `Let's explore ${theme} together - drop your questions below!`,
      `Sharing is caring! Here's what I learned about ${theme} recently.`,
      `${theme} tip of the day coming your way! 🌟`
    ],
    informative: [
      `Breaking down ${theme}: Key points you should understand`,
      `${theme} explained: A comprehensive overview`,
      `5 essential facts about ${theme} every professional should know`,
      `Deep dive into ${theme}: What the data tells us`
    ],
    inspirational: [
      `Let ${theme} be your motivation to achieve greatness today! ✨`,
      `Success story: How ${theme} transformed our approach`,
      `Your journey with ${theme} starts here - believe in the process!`,
      `Monday motivation: ${theme} edition 💪`
    ]
  }

  return baseTemplates[tone] || baseTemplates.professional
}

function generatePlatformSpecificContent(
  platform: string,
  templates: string[],
  theme: string,
  dayIndex: number
): string {
  const template = templates[dayIndex % templates.length]
  let content = template.replace(/\${theme}/g, theme)

  // Platform-specific modifications
  switch (platform) {
    case 'twitter':
      // Keep it short for Twitter
      content = content.substring(0, 250) + '...'
      break
    case 'linkedin':
      // Add professional hashtags
      content += '\n\n#ProfessionalDevelopment #BusinessGrowth #' + theme.replace(/\s+/g, '')
      break
    case 'instagram':
      // Add emojis and hashtags for Instagram
      content += '\n\n📸 #' + theme.replace(/\s+/g, '') + ' #InstaDaily #BusinessTips'
      break
    case 'facebook':
      // Add engagement question for Facebook
      content += '\n\nWhat\'s your experience with this? Share in the comments!'
      break
  }

  return content
}

// In a production environment, this would make an actual API call to OpenAI
// For now, we're using template-based generation
export async function generatePostWithOpenAI(
  prompt: string,
  platform: string,
  tone: string
): Promise<string> {
  // This is where you would integrate with OpenAI API
  // Example implementation:
  /*
  const response = await fetch('/api/generate-post', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, platform, tone })
  })
  
  const data = await response.json()
  return data.content
  */
  
  // For now, return a placeholder
  return `[AI Generated] ${prompt} - Tailored for ${platform} in ${tone} tone.`
}