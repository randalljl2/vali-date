import { createClient } from '@/lib/supabase/server'
import { DiscoverClient } from './DiscoverClient'
import type { DiscoverProfile, UserProfile, UserPhoto } from '@/types'

// Server-side compatibility computation
async function computeCompatibility(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  myAnswers: Array<{ question_set: number; question_number: number; answer: string; importance: number }>,
  theirAnswers: Array<{ question_set: number; question_number: number; answer: string; importance: number }>
): Promise<{ score: number | null; sharedCount: number }> {
  const mapThem = new Map(theirAnswers.map(a => [`${a.question_set}-${a.question_number}`, a]))
  let numerator = 0, denominator = 0, sharedCount = 0
  for (const a of myAnswers) {
    const b = mapThem.get(`${a.question_set}-${a.question_number}`)
    if (!b) continue
    sharedCount++
    if (a.answer === b.answer) { numerator += a.importance + b.importance; denominator += a.importance + b.importance }
    else denominator += Math.max(a.importance, b.importance)
  }
  if (sharedCount < 10) return { score: null, sharedCount }
  return { score: Math.round((numerator / denominator) * 100), sharedCount }
}

export default async function DiscoverPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: currentUser } = await supabase
    .from('users')
    .select('preferred_age_min, preferred_age_max, gender, show_me')
    .eq('id', user.id)
    .single()

  const ageMin  = currentUser?.preferred_age_min ?? 18
  const ageMax  = currentUser?.preferred_age_max ?? 65
  const myShowMe = currentUser?.show_me ?? 'everyone'
  const myGender = currentUser?.gender ?? null

  // Collect excluded IDs (passed, expressed interest, already matched)
  const [
    { data: passedRows },
    { data: interestRows },
    { data: matchRows },
  ] = await Promise.all([
    supabase.from('passes').select('passed_id').eq('user_id', user.id),
    supabase.from('interests').select('recipient_id').eq('sender_id', user.id),
    supabase.from('matches').select('user_a, user_b').or(`user_a.eq.${user.id},user_b.eq.${user.id}`),
  ])

  const excludeIds = new Set<string>([
    user.id,
    ...(passedRows ?? []).map((r: { passed_id: string }) => r.passed_id),
    ...(interestRows ?? []).map((r: { recipient_id: string }) => r.recipient_id),
    ...(matchRows ?? []).flatMap((m: { user_a: string; user_b: string }) => [m.user_a, m.user_b]),
  ])

  let q = supabase.from('users').select('*').gte('age', ageMin).limit(40)
  if (ageMax < 65) q = q.lte('age', ageMax)
  if (myShowMe === 'men')   q = q.eq('gender', 'man')
  if (myShowMe === 'women') q = q.eq('gender', 'woman')

  const { data: rawProfiles } = await q

  // Filter excludes in JS (Supabase .not().in() is finicky with Sets)
  const profiles = ((rawProfiles ?? []) as UserProfile[]).filter(p => !excludeIds.has(p.id))
  const profileIds = profiles.map(p => p.id)

  if (profileIds.length === 0) {
    return <DiscoverClient initialProfiles={[]} userId={user.id} />
  }

  const today = new Date().toISOString().split('T')[0]

  // Batch-fetch all needed data in parallel
  const [
    { data: photosData },
    { data: confidenceData },
    { data: myAnswersData },
    { data: theirAnswersData },
    { data: attractionData },
  ] = await Promise.all([
    supabase.from('user_photos').select('*').in('user_id', profileIds).order('position', { ascending: true }),
    supabase.from('daily_confidence').select('user_id, score').in('user_id', profileIds).eq('date', today),
    supabase.from('user_answers').select('question_set, question_number, answer, importance').eq('user_id', user.id),
    supabase.from('user_answers').select('user_id, question_set, question_number, answer, importance').in('user_id', profileIds),
    supabase.from('attraction_ratings').select('rated_id, score').eq('rater_id', user.id).in('rated_id', profileIds),
  ])

  // Build lookup maps
  const photoMap: Record<string, UserPhoto[]> = {}
  for (const p of (photosData ?? []) as UserPhoto[]) {
    if (!photoMap[p.user_id]) photoMap[p.user_id] = []
    photoMap[p.user_id].push(p)
  }

  const confidenceMap: Record<string, number> = {}
  for (const c of (confidenceData ?? []) as { user_id: string; score: number }[]) {
    confidenceMap[c.user_id] = c.score
  }

  type ARow = { user_id: string; question_set: number; question_number: number; answer: string; importance: number }
  const theirAnswersByUser: Record<string, ARow[]> = {}
  for (const a of (theirAnswersData ?? []) as ARow[]) {
    if (!theirAnswersByUser[a.user_id]) theirAnswersByUser[a.user_id] = []
    theirAnswersByUser[a.user_id].push(a)
  }

  const attractionByUser: Record<string, number> = {}
  for (const a of (attractionData ?? []) as { rated_id: string; score: number }[]) {
    attractionByUser[a.rated_id] = a.score
  }

  const myAnswers = (myAnswersData ?? []) as ARow[]

  // Compute compatibility for each candidate
  const discoverProfiles: DiscoverProfile[] = await Promise.all(
    profiles.map(async profile => {
      const { score, sharedCount } = await computeCompatibility(
        supabase, myAnswers, theirAnswersByUser[profile.id] ?? []
      )
      return {
        ...profile,
        photos: photoMap[profile.id] ?? [],
        compatibilityScore: score,
        sharedAnswers: sharedCount,
        confidenceToday: confidenceMap[profile.id] ?? null,
      }
    })
  )

  // Sort: 85% compat + 15% attraction. Default compat = 50 (neutral) when unknown.
  const sorted = discoverProfiles.sort((a, b) => {
    const attrA = (attractionByUser[a.id] ?? 5) * 10
    const attrB = (attractionByUser[b.id] ?? 5) * 10
    const scoreA = (a.compatibilityScore ?? 50) * 0.85 + attrA * 0.15
    const scoreB = (b.compatibilityScore ?? 50) * 0.85 + attrB * 0.15
    return scoreB - scoreA
  })

  return <DiscoverClient initialProfiles={sorted} userId={user.id} />
}
