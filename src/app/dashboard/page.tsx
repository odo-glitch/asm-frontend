import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardContent } from '@/components/dashboard/DashboardContent'
import { AppLayout } from '@/components/layout/AppLayout'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  return (
    <AppLayout>
      <DashboardContent userEmail={user.email!} userId={user.id} />
    </AppLayout>
  )
}