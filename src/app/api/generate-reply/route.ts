import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { reviewText, rating, reviewerName } = await request.json()

    if (!reviewText || !rating || !reviewerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate AI reply using OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional business owner responding to customer reviews. 
            Your responses should be:
            - Professional and courteous
            - Personalized to address specific points in the review
            - Show appreciation for feedback
            - Address any concerns raised
            - Be concise (2-3 sentences max)
            - End with an invitation to return or connect further if appropriate
            
            For positive reviews (4-5 stars): Express gratitude and highlight what made their experience special.
            For neutral reviews (3 stars): Thank them for feedback and mention improvements being made.
            For negative reviews (1-2 stars): Apologize sincerely, acknowledge concerns, and offer to make it right.`
          },
          {
            role: "user",
            content: `Generate a professional response to this ${rating}-star review from ${reviewerName}: "${reviewText}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      })

      const reply = completion.choices[0].message.content

      return NextResponse.json({ reply })
    } catch (openAIError) {
      console.error('OpenAI API error:', openAIError)
      
      // Fallback to template-based responses
      let templateReply = ''
      
      if (rating >= 4) {
        templateReply = `Thank you so much for your wonderful review, ${reviewerName}! We're thrilled to hear about your positive experience. Your feedback means the world to us, and we look forward to serving you again soon!`
      } else if (rating === 3) {
        templateReply = `Thank you for taking the time to share your feedback, ${reviewerName}. We appreciate your honest review and are constantly working to improve our service. We hope to exceed your expectations on your next visit.`
      } else {
        templateReply = `Dear ${reviewerName}, we sincerely apologize that your experience didn't meet expectations. Your feedback is invaluable, and we'd love the opportunity to make things right. Please reach out to us directly so we can address your concerns.`
      }
      
      return NextResponse.json({ reply: templateReply })
    }
  } catch (error) {
    console.error('Error generating reply:', error)
    return NextResponse.json(
      { error: 'Failed to generate reply' },
      { status: 500 }
    )
  }
}