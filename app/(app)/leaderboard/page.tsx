import { createClient } from '@/lib/supabase/server'
import { LeaderboardClient } from './LeaderboardClient'
import type { UserProfile, Streak } from '@/types'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profiles } = await supabase
    .from('users')
    .select('*')
    .order('average_score', { ascending: false })
    .limit(50)

  const profileIds = (profiles ?? []).map((p: UserProfile) => p.id)
  const { data: streaks } = profileIds.length
    ? await supabase.from('streaks').select('*').in('user_id', profileIds)
    : { data: [] }

  const streakMap = Object.fromEntries(
    (streaks ?? []).map((s: Streak) => [s.user_id, s])
  )

  return (
    <LeaderboardClient
      profiles={(profiles ?? []) as UserProfile[]}
      streakMap={streakMap}
      currentUserId={user.id}
    />
  )
}
