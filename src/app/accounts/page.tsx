import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppLayout } from '@/components/layout/AppLayout'
import { AccountsPage } from '@/components/accounts/AccountsPage'

export default async function AccountsPageWrapper() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <AppLayout>
      <AccountsPage />
    </AppLayout>
  )
}
