import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SubscribeClient } from './SubscribeClient'
import type { SubscriptionTier } from '@/types'

export default async function SubscribePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  return (
    <SubscribeClient currentTier={(profile?.subscription_tier ?? 'free') as SubscriptionTier} />
  )
}
