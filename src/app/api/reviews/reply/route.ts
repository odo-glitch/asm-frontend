import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { reviewId, replyText, platform } = await request.json();

    if (!reviewId || !replyText || !platform) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update review with reply
    const { data: review, error } = await supabase
      .from('reviews')
      .update({
        replied: true,
        reply_text: replyText,
        replied_at: new Date().toISOString()
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      console.error('Error updating review:', error);
      return NextResponse.json(
        { error: 'Failed to save reply' },
        { status: 500 }
      );
    }

    // Here you would integrate with the actual platform API
    // to post the reply to Google/Facebook/Yelp
    // For now, we just save it to our database
    
    // Example integration points:
    // - Google My Business API
    // - Facebook Graph API
    // - Yelp API
    
    // TODO: Implement platform-specific reply posting
    try {
      switch (platform) {
        case 'google':
          // await postToGoogleMyBusiness(reviewId, replyText);
          console.log('Would post to Google My Business:', replyText);
          break;
        case 'facebook':
          // await postToFacebook(reviewId, replyText);
          console.log('Would post to Facebook:', replyText);
          break;
        case 'yelp':
          // Yelp doesn't support direct reply API for most businesses
          console.log('Yelp reply would need to be posted manually');
          break;
      }
    } catch (platformError) {
      console.error('Error posting to platform:', platformError);
      // Continue even if platform posting fails - we still saved the reply locally
    }

    return NextResponse.json({ 
      success: true, 
      review,
      message: 'Reply saved successfully'
    });
  } catch (error) {
    console.error('Error in reply API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
