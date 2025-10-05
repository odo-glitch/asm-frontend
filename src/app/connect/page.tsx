import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ConnectAccountUI from '@/components/connect/ConnectAccountUI'

export default async function ConnectAccountPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user already has connected accounts
  const { data: socialAccounts } = await supabase
    .from('social_accounts')
    .select('platform')
    .eq('user_id', user.id)

  return <ConnectAccountUI existingConnections={socialAccounts || []} />
}