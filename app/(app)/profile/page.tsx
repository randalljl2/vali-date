import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'
import type { UserProfile, UserPhoto, DailyConfidence } from '@/types'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/onboarding')

  const today = new Date().toISOString().split('T')[0]

  const [
    { data: todayConfidence },
    { count: matchCount },
    { count: answersCount },
    { data: photos },
  ] = await Promise.all([
    supabase.from('daily_confidence').select('*').eq('user_id', user.id).eq('date', today).maybeSingle(),
    supabase.from('matches').select('*', { count: 'exact', head: true })
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    supabase.from('user_answers').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('user_photos').select('*').eq('user_id', user.id).order('position', { ascending: true }),
  ])

  return (
    <ProfileClient
      profile={profile as UserProfile}
      photos={(photos ?? []) as UserPhoto[]}
      todayConfidence={todayConfidence as DailyConfidence | null}
      matchCount={matchCount ?? 0}
      answersCount={answersCount ?? 0}
      email={user.email ?? ''}
    />
  )
}
