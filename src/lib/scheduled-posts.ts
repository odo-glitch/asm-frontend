import { createClient } from '@/lib/supabase/client';

export interface ScheduledPost {
  id: string;
  user_id: string;
  social_account_id: string;
  content: string;
  scheduled_for: string; // Changed from scheduled_time to scheduled_for
  platform: string;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  published_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateScheduledPostData {
  social_account_id: string;
  content: string;
  scheduled_time: string;
}

export async function createScheduledPost(data: CreateScheduledPostData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: post, error } = await supabase
    .from('scheduled_posts')
    .insert({
      user_id: user.id,
      social_account_id: data.social_account_id,
      content: data.content,
      scheduled_for: data.scheduled_time, // Map to correct field name
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating scheduled post:', error);
    throw error;
  }

  return post;
}

export async function fetchScheduledPosts(): Promise<ScheduledPost[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: posts, error } = await supabase
    .from('scheduled_posts')
    .select(`
      *,
      social_accounts!inner(platform)
    `)
    .eq('user_id', user.id)
    .order('scheduled_for', { ascending: true });

  if (error) {
    console.error('Error fetching scheduled posts:', error);
    throw error;
  }

  // Map the results to include platform from the joined social_accounts table
  return posts?.map(post => ({
    ...post,
    platform: post.social_accounts?.platform || 'unknown'
  })) || [];
}