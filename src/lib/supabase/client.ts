import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables:', {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseKey
    });
    throw new Error('Missing required Supabase configuration. Check your environment variables.');
  }

  try {
    console.log('Initializing Supabase client...');
    const client = createBrowserClient(supabaseUrl, supabaseKey);
    
    if (!client) {
      throw new Error('Failed to create Supabase client');
    }

    console.log('Supabase client initialized successfully');
    return client;
  } catch (error) {
    console.error('Error creating Supabase client:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
}