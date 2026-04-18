import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NavBar } from '@/components/NavBar'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if onboarding is complete (users row must exist)
  const { data: profile } = await supabase
    .from('users').select('id').eq('id', user.id).maybeSingle()

  if (!profile) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-bg flex flex-col max-w-lg mx-auto relative">
      <main className="flex-1 pb-20">
        {children}
      </main>
      <NavBar />
    </div>
  )
}
