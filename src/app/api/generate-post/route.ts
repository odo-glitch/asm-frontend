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

    const { prompt, platform, tone } = await request.json()

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

    // Create an optimized prompt for OpenAI
    const systemPrompt = `You are a social media content expert. Create a ${platform} post with a ${toneDescriptions[tone as keyof typeof toneDescriptions]} tone. ${platformGuidelines[platform as keyof typeof platformGuidelines]}`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Create a social media post about: ${prompt}`
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