import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    const debug: any = {
      user: user ? { id: user.id, email: user.email } : null,
      userError: userError?.message || null,
    };

    if (!user) {
      return NextResponse.json({
        debug,
        message: 'Not authenticated'
      });
    }

    // Check user organizations
    const { data: userOrgs, error: orgError } = await supabase
      .from('user_organizations')
      .select('*')
      .eq('user_id', user.id);

    debug.userOrganizations = userOrgs;
    debug.orgError = orgError?.message || null;

    if (userOrgs && userOrgs.length > 0) {
      // Check reviews for first org
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select('*')
        .eq('organization_id', userOrgs[0].organization_id);

      debug.reviews = reviews;
      debug.reviewsError = reviewsError?.message || null;
      debug.reviewsCount = reviews?.length || 0;

      // Check all reviews in database
      const { data: allReviews, error: allReviewsError } = await supabase
        .from('reviews')
        .select('*');

      debug.allReviewsCount = allReviews?.length || 0;
      debug.allReviewsError = allReviewsError?.message || null;
    }

    return NextResponse.json({ debug });
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
