import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserProfileClient } from './UserProfileClient'
import type { UserProfile, UserPhoto } from '@/types'

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const [
    { data: profile },
    { data: photos },
    { data: confidence },
    { data: compatScore },
  ] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('user_photos').select('*').eq('user_id', userId).order('position', { ascending: true }),
    supabase.from('daily_confidence').select('score').eq('user_id', userId).eq('date', today).maybeSingle(),
    supabase.from('compatibility_scores')
      .select('score')
      .or(`and(user_a_id.eq.${user.id},user_b_id.eq.${userId}),and(user_a_id.eq.${userId},user_b_id.eq.${user.id})`)
      .maybeSingle(),
  ])

  if (!profile) redirect('/matches')

  return (
    <UserProfileClient
      profile={profile as UserProfile}
      photos={(photos ?? []) as UserPhoto[]}
      confidenceToday={confidence?.score ?? null}
      compatibilityScore={compatScore?.score ?? null}
    />
  )
}
