import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    console.log('Generate reply API called');
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reviewText, rating, authorName, platform } = await request.json();
    console.log('Generating reply for:', { authorName, rating, platform });

    if (!reviewText || !rating || !authorName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Platform-specific guidelines
    const platformGuidelines = {
      google: 'This is for Google Business Profile. Keep responses professional and emphasize quality service.',
      facebook: 'This is for Facebook. Be friendly and personable, encourage engagement.',
      yelp: 'This is for Yelp. Address specific points and show commitment to customer satisfaction.'
    };

    const platformGuide = platformGuidelines[platform as keyof typeof platformGuidelines] || '';

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a professional business owner responding to customer reviews. ${platformGuide}

Your responses should be:
- Professional and courteous
- Personalized to address specific points in the review
- Show genuine appreciation for feedback
- Address any concerns raised thoughtfully
- Be concise (2-4 sentences)
- Use the reviewer's name naturally
- End with an invitation to return or connect further if appropriate

For positive reviews (4-5 stars): 
- Express sincere gratitude
- Highlight what made their experience special
- Reinforce your commitment to quality

For neutral reviews (3 stars): 
- Thank them for honest feedback
- Acknowledge areas for improvement
- Show commitment to better service

For negative reviews (1-2 stars): 
- Apologize sincerely and specifically
- Acknowledge their concerns without making excuses
- Offer concrete steps to resolve the issue
- Invite them to contact you directly`
          },
          {
            role: 'user',
            content: `Generate a professional response to this ${rating}-star review from ${authorName} on ${platform}: "${reviewText}"`
          }
        ],
        temperature: 0.8,
        max_tokens: 200,
      });

      const reply = completion.choices[0].message.content?.trim() || '';

      return NextResponse.json({ reply });
    } catch (openAIError: any) {
      console.error('OpenAI API error:', {
        message: openAIError.message,
        type: openAIError.type,
        code: openAIError.code,
        status: openAIError.status
      });
      
      // Fallback to template-based responses if OpenAI fails
      console.log('Using fallback template response');
      let templateReply = '';
      
      if (rating >= 4) {
        templateReply = `Thank you so much for your wonderful review, ${authorName}! We're thrilled to hear about your positive experience. Your feedback means the world to us, and we look forward to serving you again soon!`;
      } else if (rating === 3) {
        templateReply = `Thank you for taking the time to share your feedback, ${authorName}. We appreciate your honest review and are constantly working to improve our service. We hope to exceed your expectations on your next visit.`;
      } else {
        templateReply = `Dear ${authorName}, we sincerely apologize that your experience didn't meet expectations. Your feedback is invaluable, and we'd love the opportunity to make things right. Please reach out to us directly so we can address your concerns.`;
      }
      
      return NextResponse.json({ reply: templateReply });
    }
  } catch (error) {
    console.error('Error generating reply:', error);
    return NextResponse.json(
      { error: 'Failed to generate reply' },
      { status: 500 }
    );
  }
}
