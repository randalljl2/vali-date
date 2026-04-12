import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileClient } from './ProfileClient'
import { getTier } from '@/lib/utils'
import type { UserProfile, UserPhoto, Streak, DailyConfidence } from '@/types'

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

  // Parallel fetches
  const [
    { data: streak },
    { data: todayConfidence },
    { count: matchCount },
    { count: ratingsGiven },
    { data: photos },
  ] = await Promise.all([
    supabase.from('streaks').select('*').eq('user_id', user.id).single(),
    supabase.from('daily_confidence').select('*').eq('user_id', user.id).eq('date', today).single(),
    supabase.from('matches').select('*', { count: 'exact', head: true }).or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
    supabase.from('ratings').select('*', { count: 'exact', head: true }).eq('rater_id', user.id),
    supabase.from('user_photos').select('*').eq('user_id', user.id).order('position', { ascending: true }),
  ])

  // Tier movement: compare current tier to snapshot tier
  const currentTier = getTier(profile.average_score)
  const snapshotTier = profile.score_snapshot !== null ? getTier(profile.score_snapshot) : null
  const tierOrder = ['Newcomer', 'Rising', 'Validated', 'Certified', 'Iconic']
  const tierMovedUp =
    snapshotTier !== null &&
    tierOrder.indexOf(currentTier) > tierOrder.indexOf(snapshotTier)

  // Hot streak boost status
  const boostActivatedAt = profile.hot_streak_boost_activated_at ?? null
  const boostExpiresAt = boostActivatedAt
    ? new Date(new Date(boostActivatedAt).getTime() + 60 * 60 * 1000)
    : null
  const boostActive = boostExpiresAt ? boostExpiresAt > new Date() : false
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const boostUsedThisWeek = boostActivatedAt
    ? new Date(boostActivatedAt) > sevenDaysAgo
    : false

  return (
    <ProfileClient
      profile={profile as UserProfile}
      photos={(photos ?? []) as UserPhoto[]}
      streak={streak as Streak | null}
      todayConfidence={todayConfidence as DailyConfidence | null}
      matchCount={matchCount ?? 0}
      ratingsGiven={ratingsGiven ?? 0}
      email={user.email ?? ''}
      tierMovedUp={tierMovedUp}
      currentTier={currentTier}
      boostActivatedAt={boostActivatedAt}
      boostActive={boostActive}
      boostUsedThisWeek={boostUsedThisWeek}
    />
  )
}
