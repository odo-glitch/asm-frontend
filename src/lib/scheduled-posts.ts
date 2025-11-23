import { createClient } from '@/lib/supabase/client';
import { getSelectedOrganizationId } from './organization-context';

export interface ScheduledPost {
  id: string;
  user_id: string;
  social_account_id: string;
  content: string;
  scheduled_time: string; // ISO timestamp
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
  scheduled_time: string | null; // null for "Post Now" (will use current time), string for scheduled posts
}

export async function createScheduledPost(data: CreateScheduledPostData) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  // For "Post Now", use current time; for scheduled, use the provided time
  // This ensures scheduled_time is never null (for database compatibility)
  const scheduledTime = data.scheduled_time || new Date().toISOString();

  const { data: post, error } = await supabase
    .from('scheduled_posts')
    .insert({
      user_id: user.id,
      social_account_id: data.social_account_id,
      content: data.content,
      scheduled_time: scheduledTime,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating scheduled post:', error);
    throw error;
  }

  return post;
}

export async function fetchScheduledPosts(organizationId?: string | null): Promise<ScheduledPost[]> {
  const supabase = createClient();
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('User not authenticated for scheduled posts');
      return [];
    }

    // Get selected organization if not provided
    const orgId = organizationId !== undefined ? organizationId : getSelectedOrganizationId();
    console.log('Fetching scheduled posts for organization:', orgId || 'personal');

    const { data: posts, error } = await supabase
      .from('scheduled_posts')
      .select(`
        *,
        social_accounts!inner(platform, organization_id)
      `)
      .eq('user_id', user.id)
      .order('scheduled_time', { ascending: true });

    if (error) {
      console.error('Error fetching scheduled posts:', error);
      return []; // Return empty array instead of throwing
    }

    // Filter posts by organization and map platform
    const filteredPosts = posts?.filter(post => {
      const postOrgId = post.social_accounts?.organization_id;
      // Match organization filter
      if (orgId) {
        return postOrgId === orgId;
      } else {
        return postOrgId === null;
      }
    }).map(post => ({
      ...post,
      platform: post.social_accounts?.platform || 'unknown'
    })) || [];

    console.log('Scheduled posts fetched:', filteredPosts.length);
    return filteredPosts;
  } catch (error) {
    console.error('Exception fetching scheduled posts:', error);
    return []; // Return empty array on any error
  }
}

export async function updateScheduledPost(postId: string, updates: Partial<Pick<ScheduledPost, 'content' | 'scheduled_time'>>) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: post, error } = await supabase
    .from('scheduled_posts')
    .update(updates)
    .eq('id', postId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating scheduled post:', error);
    throw error;
  }

  return post;
}

export async function deleteScheduledPost(postId: string) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('scheduled_posts')
    .delete()
    .eq('id', postId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting scheduled post:', error);
    throw error;
  }

  return true;
}