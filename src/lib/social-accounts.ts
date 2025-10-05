import { createClient } from '@/lib/supabase/client';

export interface SocialAccount {
  id: string;
  user_id: string;
  platform: string;
  account_name: string;
  account_id: string;
  access_token: string;
  refresh_token: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchUserSocialAccounts(): Promise<SocialAccount[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.error('No authenticated user found');
    return [];
  }

  const { data, error } = await supabase
    .from('social_accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching social accounts:', error);
    return [];
  }

  return data || [];
}