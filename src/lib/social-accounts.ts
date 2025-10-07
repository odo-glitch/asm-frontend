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
  try {
    console.log('Initializing social accounts fetch...');
    const supabase = createClient();
    
    if (!supabase) {
      throw new Error('Failed to initialize Supabase client');
    }

    // Get user with error handling
    console.log('Getting authenticated user...');
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Auth error in social accounts:', {
        message: authError.message,
        status: authError.status || 'unknown',
        name: authError.name,
        stack: authError.stack
      });
      throw authError;
    }

    const user = authData.user;
    if (!user) {
      throw new Error('No authenticated user found');
    }

    console.log('User authenticated successfully:', { 
      id: user.id,
      email: user.email
    });

    // Fetch social accounts with error handling
    console.log('Fetching social accounts for user...');
    const { data, error } = await supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Social accounts fetch error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    if (!data) {
      console.log('No social accounts found for user:', user.id);
      return [];
    }

    console.log('Social accounts fetched successfully:', {
      count: data.length
    });

    return data;
  } catch (error) {
    console.error('Unexpected error in fetchUserSocialAccounts:', error);
    return [];
  }
}