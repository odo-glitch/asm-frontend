import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { 
      prompt, 
      platform, 
      tone,
      // New optional parameters
      postType = 'general',
      targetAudience = 'general audience',
      includeEmojis = true,
      includeHashtags = true,
      hashtagCount = 3,
      callToAction = true,
      postGoal = 'engagement',
      brandVoice = null
    } = await request.json()

    // Validate input
    if (!prompt || !platform || !tone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const platformLimits = {
      twitter: 280,
      facebook: 2000,
      linkedin: 3000,
      instagram: 2200
    }

    const toneDescriptions = {
      professional: 'professional and authoritative',
      casual: 'casual and conversational',
      friendly: 'warm and approachable',
      informative: 'educational and detailed',
      inspirational: 'motivating and uplifting'
    }

    const platformGuidelines = {
      twitter: 'Keep it concise and engaging. Use relevant hashtags. Maximum 280 characters.',
      facebook: 'Be conversational and encourage engagement. Can include longer form content.',
      linkedin: 'Professional tone, industry-focused. Share insights and expertise.',
      instagram: 'Visual-first platform. Include emojis and relevant hashtags. Call-to-action for engagement.'
    }

    // Post type strategies
    const postTypeStrategies: Record<string, string> = {
      question: 'Ask an engaging question to spark conversation and replies',
      tip: 'Share a valuable tip or advice. Use numbers or bullet points when possible',
      announcement: 'Make an exciting announcement. Build anticipation and clarity',
      story: 'Tell a compelling story with a beginning, middle, and end',
      promotional: 'Promote while providing value. Focus on benefits, not just features',
      educational: 'Teach something valuable. Break down complex topics simply',
      general: 'Create engaging content that resonates with the audience'
    }

    // Goal-specific instructions
    const goalInstructions: Record<string, string> = {
      engagement: 'Encourage likes, comments, and shares. Ask questions or include interactive elements',
      awareness: 'Focus on reach and visibility. Make it shareable and memorable',
      conversion: 'Include clear call-to-action. Create urgency or highlight value proposition',
      education: 'Focus on teaching and providing value. Be clear and comprehensive'
    }

    // Build enhanced system prompt
    let systemPrompt = `You are an expert social media content creator and copywriter specializing in ${platform}.

PLATFORM: ${platform}
TONE: ${toneDescriptions[tone as keyof typeof toneDescriptions]}
POST TYPE: ${postType}
TARGET AUDIENCE: ${targetAudience}
GOAL: ${postGoal}

PLATFORM GUIDELINES:
${platformGuidelines[platform as keyof typeof platformGuidelines]}

POST TYPE STRATEGY:
${postTypeStrategies[postType] || postTypeStrategies.general}

GOAL INSTRUCTIONS:
${goalInstructions[postGoal]}

FORMATTING REQUIREMENTS:
- Maximum length: ${platformLimits[platform as keyof typeof platformLimits]} characters
- Emojis: ${includeEmojis ? `Include ${platform === 'instagram' ? '3-5' : '1-2'} relevant emojis naturally throughout` : 'Do not use emojis'}
- Hashtags: ${includeHashtags ? `Include ${hashtagCount} relevant hashtags at the end` : 'Do not include hashtags'}
- Call-to-action: ${callToAction ? 'Include a clear, compelling call-to-action' : 'No call-to-action needed'}
${brandVoice ? `- Brand Voice: ${brandVoice}` : ''}

BEST PRACTICES:
- Start with a hook that grabs attention
- Write for ${targetAudience} specifically
- Use short paragraphs for readability
- Include specific, actionable insights
- End with engagement prompt (question, CTA, or thought-provoking statement)
${platform === 'linkedin' ? '- Use professional insights and industry knowledge' : ''}
${platform === 'twitter' ? '- Be punchy and memorable within character limit' : ''}
${platform === 'instagram' ? '- Write for visual content, assume there will be an image' : ''}
${platform === 'facebook' ? '- Encourage conversation and community building' : ''}

OUTPUT ONLY THE POST CONTENT. Do not include meta-commentary or explanations.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Create a ${platform} post about: ${prompt}`
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const generatedContent = completion.choices[0]?.message?.content || ''

    // Trim content to platform limits
    const limit = platformLimits[platform as keyof typeof platformLimits] || 2000
    const finalContent = generatedContent.substring(0, limit)

    return NextResponse.json({
      content: finalContent,
      platform,
      tone
    })

  } catch (error) {
    console.error('Error generating post:', error)
    return NextResponse.json(
      { error: 'Failed to generate post' },
      { status: 500 }
    )
  }
}