import { createClient } from '@/lib/supabase/client';
import { getSelectedOrganizationId } from './organization-context';

export interface SocialAccount {
  id: string;
  user_id: string;
  organization_id: string | null;
  platform: string;
  account_name: string;
  account_id: string;
  access_token: string;
  refresh_token: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchUserSocialAccounts(organizationId?: string | null): Promise<SocialAccount[]> {
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

    // Get selected organization if not provided
    const orgId = organizationId !== undefined ? organizationId : getSelectedOrganizationId();
    console.log('Filtering by organization:', orgId || 'personal');

    // Fetch social accounts with error handling and organization filter
    console.log('Fetching social accounts for user...');
    let query = supabase
      .from('social_accounts')
      .select('*')
      .eq('user_id', user.id);
    
    // Filter by organization
    if (orgId) {
      query = query.eq('organization_id', orgId);
    } else {
      query = query.is('organization_id', null);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });

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