import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SettingsContent } from '@/components/settings/SettingsContent'
import { AppLayout } from '@/components/layout/AppLayout'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <AppLayout>
      <SettingsContent userEmail={user.email!} userId={user.id} />
    </AppLayout>
  )
}