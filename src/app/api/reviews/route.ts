import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Auth error in reviews API:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Fetching reviews for user:', user.id);

    // Get user's organization - use maybeSingle to avoid errors
    const { data: userOrgs, error: orgError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (orgError) {
      console.error('Error fetching user organization:', orgError);
      return NextResponse.json({ reviews: [] });
    }

    if (!userOrgs) {
      console.log('No organization found for user');
      return NextResponse.json({ reviews: [] });
    }

    console.log('Fetching reviews for organization:', userOrgs.organization_id);

    // Fetch reviews from database
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('organization_id', userOrgs.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews from DB:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // If table doesn't exist, return empty array
      if (error.code === '42P01') {
        console.log('Reviews table does not exist yet');
        return NextResponse.json({ reviews: [] });
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch reviews', details: error.message },
        { status: 500 }
      );
    }

    console.log('Reviews fetched successfully:', reviews?.length || 0);
    return NextResponse.json({ reviews: reviews || [] });
  } catch (error) {
    console.error('Unexpected error in reviews API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const {
      platform,
      author_name,
      author_image,
      rating,
      text,
      review_url,
      external_id
    } = body;

    // Validate required fields
    if (!platform || !author_name || !rating || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user's organization
    const { data: userOrgs, error: orgError } = await supabase
      .from('user_organizations')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    if (orgError || !userOrgs) {
      console.error('Error fetching user organization:', orgError);
      return NextResponse.json(
        { error: 'No organization found' },
        { status: 404 }
      );
    }

    // Insert review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert([
        {
          organization_id: userOrgs.organization_id,
          platform,
          author_name,
          author_image,
          rating,
          text,
          review_url,
          external_id,
          replied: false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      return NextResponse.json(
        { error: 'Failed to create review' },
        { status: 500 }
      );
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error in reviews POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
