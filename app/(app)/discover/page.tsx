import { createClient } from '@/lib/supabase/server'
import { DiscoverClient } from './DiscoverClient'
import type { UserProfile, UserPhoto, Streak, NearMatchWithRater, SubscriptionTier } from '@/types'

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch rated IDs, current user's age preferences, and subscription tier in parallel
  const [{ data: ratedRows }, { data: currentUser }] = await Promise.all([
    supabase.from('ratings').select('rated_id').eq('rater_id', user.id),
    supabase.from('users').select('preferred_age_min, preferred_age_max, subscription_tier').eq('id', user.id).single(),
  ])

  const ratedIds = (ratedRows ?? []).map((r) => r.rated_id)

  const ageMin = currentUser?.preferred_age_min ?? 18
  const ageMax = currentUser?.preferred_age_max ?? 65

  // Profiles not yet rated by this user, excluding self, filtered by age preference
  let profilesQuery = supabase
    .from('users')
    .select('*')
    .neq('id', user.id)
    .gte('age', ageMin)
    .order('created_at', { ascending: false })
    .limit(20)

  // Only apply upper bound if not at the max (65+ means no upper limit)
  if (ageMax < 65) {
    profilesQuery = profilesQuery.lte('age', ageMax)
  }

  if (ratedIds.length > 0) {
    profilesQuery = profilesQuery.not('id', 'in', `(${ratedIds.join(',')})`)
  }

  const { data: profiles } = await profilesQuery

  const profileIds = (profiles ?? []).map((p: UserProfile) => p.id)

  // Fetch photos, streaks, and today's confidence in parallel
  const today = new Date().toISOString().split('T')[0]

  const [photosResult, streaksResult, confidenceResult] = await Promise.all(
    profileIds.length
      ? [
          supabase
            .from('user_photos')
            .select('*')
            .in('user_id', profileIds)
            .order('position', { ascending: true }),
          supabase.from('streaks').select('*').in('user_id', profileIds),
          supabase
            .from('daily_confidence')
            .select('user_id, score')
            .in('user_id', profileIds)
            .eq('date', today),
        ]
      : [
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),
          Promise.resolve({ data: [] }),
        ]
  )

  // Group photos by user_id
  const photoMap: Record<string, UserPhoto[]> = {}
  for (const photo of ((photosResult.data ?? []) as UserPhoto[])) {
    if (!photoMap[photo.user_id]) photoMap[photo.user_id] = []
    photoMap[photo.user_id].push(photo)
  }

  // Streak map
  const streakMap = Object.fromEntries(
    ((streaksResult.data ?? []) as Streak[]).map((s) => [s.user_id, s])
  )

  // Confidence map: user_id → score (1–10)
  const confidenceMap: Record<string, number> = {}
  for (const row of (confidenceResult.data ?? []) as { user_id: string; score: number }[]) {
    confidenceMap[row.user_id] = row.score
  }

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  // Ratings given today + ratings received today (momentum) — in parallel
  const [{ count: ratingsToday }, { count: ratingsReceivedToday }] = await Promise.all([
    supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('rater_id', user.id)
      .gte('created_at', todayStart.toISOString()),
    supabase
      .from('ratings')
      .select('*', { count: 'exact', head: true })
      .eq('rated_id', user.id)
      .gte('created_at', todayStart.toISOString()),
  ])

  // Near matches received (others rated me a 4)
  const { data: rawNearMatches } = await supabase
    .from('near_matches')
    .select('*')
    .eq('rated_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch rater profiles for near matches (only for Plus/Premium)
  const subscriptionTier = (currentUser?.subscription_tier ?? 'free') as SubscriptionTier
  let nearMatchesWithRaters: NearMatchWithRater[] = []

  if (rawNearMatches && rawNearMatches.length > 0) {
    if (subscriptionTier !== 'free') {
      const raterIds = rawNearMatches.map((nm) => nm.rater_id)
      const { data: raterProfiles } = await supabase
        .from('users')
        .select('id, name, photo_url, average_score')
        .in('id', raterIds)

      const raterMap = new Map((raterProfiles ?? []).map((p) => [p.id, p]))
      nearMatchesWithRaters = rawNearMatches.map((nm) => ({
        ...nm,
        rater: raterMap.get(nm.rater_id) ?? { id: nm.rater_id, name: '?', photo_url: null, average_score: 0 },
      })) as NearMatchWithRater[]
    } else {
      nearMatchesWithRaters = rawNearMatches.map((nm) => ({
        ...nm,
        rater: { id: nm.rater_id, name: '?', photo_url: null, average_score: 0 },
      })) as NearMatchWithRater[]
    }
  }

  // For Plus/Premium: which near matches has B already sent a convince me for?
  let sentConvinceMeNearMatchIds: string[] = []
  if (subscriptionTier !== 'free' && nearMatchesWithRaters.length > 0) {
    const nearMatchIds = nearMatchesWithRaters.map((nm) => nm.id)
    const { data: sentMessages } = await supabase
      .from('convince_me_messages')
      .select('near_match_id')
      .in('near_match_id', nearMatchIds)
      .eq('sender_id', user.id) // B is the sender

    sentConvinceMeNearMatchIds = (sentMessages ?? []).map((m) => m.near_match_id)
  }

  // Hot Right Now — top-rated profiles by average_score, excluding self and already-rated
  // (ratings RLS only exposes rows the current user is party to, so we rank via users table)
  let hotQuery = supabase
    .from('users')
    .select('*')
    .neq('id', user.id)
    .gt('rating_count', 0)
    .order('average_score', { ascending: false })
    .limit(3)

  if (ratedIds.length > 0) {
    hotQuery = hotQuery.not('id', 'in', `(${ratedIds.join(',')})`)
  }

  const { data: hotProfiles } = await hotQuery

  return (
    <DiscoverClient
      initialProfiles={(profiles ?? []) as UserProfile[]}
      photoMap={photoMap}
      hotProfiles={(hotProfiles ?? []) as UserProfile[]}
      streakMap={streakMap}
      confidenceMap={confidenceMap}
      ratingsToday={ratingsToday ?? 0}
      ratingsReceivedToday={ratingsReceivedToday ?? 0}
      nearMatches={nearMatchesWithRaters}
      subscriptionTier={subscriptionTier}
      sentConvinceMeNearMatchIds={sentConvinceMeNearMatchIds}
      userId={user.id}
    />
  )
}
