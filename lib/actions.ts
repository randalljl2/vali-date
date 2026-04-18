'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { uploadFile, deleteFile } from '@/lib/supabase/admin'
import type { HereFor, UserPhoto, Gender, ShowMe, SubscriptionTier, UserAnswer } from '@/types'

// ── Auth ─────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }
  return { success: true }
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// ── Photo management ─────────────────────────────────────────

export async function uploadOnboardingPhoto(
  formData: FormData
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('photo') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  return uploadFile(user.id, file)
}

export async function deleteOnboardingPhoto(path: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  if (!path.startsWith(`${user.id}/`)) return
  await deleteFile(path)
}

export async function uploadUserPhoto(
  formData: FormData
): Promise<{ photo: UserPhoto } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { count } = await supabase
    .from('user_photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= 10) return { error: 'Maximum of 10 photos reached' }

  const file = formData.get('photo') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  const result = await uploadFile(user.id, file)
  if ('error' in result) return result

  const { data: last } = await supabase
    .from('user_photos')
    .select('position')
    .eq('user_id', user.id)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const position = last ? last.position + 1 : 0

  const { data: photo, error: dbErr } = await supabase
    .from('user_photos')
    .insert({ user_id: user.id, url: result.url, position })
    .select()
    .single()

  if (dbErr) {
    await deleteFile(result.path)
    return { error: dbErr.message }
  }

  if (position === 0) {
    await supabase.from('users')
      .update({ photo_url: result.url, updated_at: new Date().toISOString() })
      .eq('id', user.id)
  }

  revalidatePath('/profile')
  return { photo: photo as UserPhoto }
}

export async function deleteUserPhoto(
  photoId: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: photo } = await supabase
    .from('user_photos').select('*').eq('id', photoId).eq('user_id', user.id).single()

  if (!photo) return { error: 'Photo not found' }

  const storagePath = new URL(photo.url).pathname.split('/object/public/photos/')[1]
  if (storagePath) await deleteFile(storagePath)

  await supabase.from('user_photos').delete().eq('id', photoId)

  const { data: remaining } = await supabase
    .from('user_photos').select('id').eq('user_id', user.id)
    .order('position', { ascending: true })

  for (let i = 0; i < (remaining ?? []).length; i++) {
    await supabase.from('user_photos').update({ position: i }).eq('id', remaining![i].id)
  }

  const { data: newPrimary } = await supabase
    .from('user_photos').select('url').eq('user_id', user.id).eq('position', 0).maybeSingle()

  await supabase.from('users')
    .update({ photo_url: newPrimary?.url ?? null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  revalidatePath('/profile')
  return { success: true }
}

export async function reorderUserPhotos(
  orderedIds: string[]
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Two-pass to avoid unique constraint conflicts
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from('user_photos')
      .update({ position: 100 + i }).eq('id', orderedIds[i]).eq('user_id', user.id)
  }
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase.from('user_photos')
      .update({ position: i }).eq('id', orderedIds[i]).eq('user_id', user.id)
  }

  const { data: primary } = await supabase
    .from('user_photos').select('url').eq('user_id', user.id).eq('position', 0).maybeSingle()

  await supabase.from('users')
    .update({ photo_url: primary?.url ?? null, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  revalidatePath('/profile')
  return { success: true }
}

// ── Onboarding ───────────────────────────────────────────────

export async function completeOnboarding(data: {
  name: string
  age: number
  city: string
  here_for: HereFor
  gender: Gender
  show_me: ShowMe
  height_cm: number | null
  photos: Array<{ url: string }>
  confidence_score: number
  prompt_1_question: string | null
  prompt_1_answer: string | null
  prompt_2_question: string | null
  prompt_2_answer: string | null
  set_one_answers: Array<{
    question_number: number
    answer: 'a' | 'b' | 'c'
    importance: 1 | 2 | 3
  }>
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Not authenticated' }

  const { error: profileError } = await supabase.from('users').upsert({
    id: user.id,
    name: data.name,
    age: data.age,
    city: data.city,
    here_for: data.here_for,
    gender: data.gender,
    show_me: data.show_me,
    height_cm: data.height_cm,
    photo_url: data.photos[0]?.url ?? null,
    prompt_1_question: data.prompt_1_question,
    prompt_1_answer: data.prompt_1_answer,
    prompt_2_question: data.prompt_2_question,
    prompt_2_answer: data.prompt_2_answer,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })

  if (profileError) return { error: profileError.message }

  // Photos
  await supabase.from('user_photos').delete().eq('user_id', user.id)
  if (data.photos.length > 0) {
    await supabase.from('user_photos').insert(
      data.photos.map((p, i) => ({ user_id: user.id, url: p.url, position: i }))
    )
  }

  // Daily confidence
  const today = new Date().toISOString().split('T')[0]
  await supabase.from('daily_confidence').upsert(
    { user_id: user.id, score: data.confidence_score, date: today },
    { onConflict: 'user_id,date' }
  )

  // Set 1 answers — upsert so retries are safe
  if (data.set_one_answers.length > 0) {
    await supabase.from('user_answers').upsert(
      data.set_one_answers.map(a => ({
        user_id: user.id,
        question_set: 1,
        question_number: a.question_number,
        answer: a.answer,
        importance: a.importance,
      })),
      { onConflict: 'user_id,question_set,question_number' }
    )
  }

  redirect('/discover')
}

// ── Profile updates ───────────────────────────────────────────

export async function updateUserPrompts(data: {
  prompt_1_question: string
  prompt_1_answer: string
  prompt_2_question: string
  prompt_2_answer: string
}): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('users').update({
    prompt_1_question: data.prompt_1_question,
    prompt_1_answer: data.prompt_1_answer,
    prompt_2_question: data.prompt_2_question,
    prompt_2_answer: data.prompt_2_answer,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function updateAgePreference(
  min: number,
  max: number
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('users').update({
    preferred_age_min: min,
    preferred_age_max: max,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function updateHeight(
  heightCm: number | null
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('users')
    .update({ height_cm: heightCm, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function updateGenderPreference(
  gender: Gender,
  showMe: ShowMe
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('users').update({
    gender,
    show_me: showMe,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

// ── Compatibility (server-only helper) ───────────────────────

async function computeCompatibility(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userAId: string,
  userBId: string
): Promise<{ score: number | null; sharedCount: number }> {
  const [{ data: answersA }, { data: answersB }] = await Promise.all([
    supabase.from('user_answers').select('question_set,question_number,answer,importance').eq('user_id', userAId),
    supabase.from('user_answers').select('question_set,question_number,answer,importance').eq('user_id', userBId),
  ])

  if (!answersA || !answersB) return { score: null, sharedCount: 0 }

  type Ans = { question_set: number; question_number: number; answer: string; importance: number }
  const mapB = new Map<string, Ans>(
    (answersB as Ans[]).map(a => [`${a.question_set}-${a.question_number}`, a])
  )

  let numerator = 0
  let denominator = 0
  let sharedCount = 0

  for (const a of answersA as Ans[]) {
    const key = `${a.question_set}-${a.question_number}`
    const b = mapB.get(key)
    if (!b) continue

    sharedCount++
    if (a.answer === b.answer) {
      numerator += a.importance + b.importance
      denominator += a.importance + b.importance
    } else {
      denominator += Math.max(a.importance, b.importance)
    }
  }

  if (sharedCount < 10) return { score: null, sharedCount }
  return { score: Math.round((numerator / denominator) * 100), sharedCount }
}

async function cacheCompatibility(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userAId: string,
  userBId: string,
  score: number,
  sharedCount: number
) {
  const [a, b] = [userAId, userBId].sort()
  await supabase.from('compatibility_scores').upsert({
    user_a_id: a,
    user_b_id: b,
    score,
    shared_answers: sharedCount,
    calculated_at: new Date().toISOString(),
  }, { onConflict: 'user_a_id,user_b_id' })
}

// ── Interests & Matching ──────────────────────────────────────

export async function expressInterest(
  recipientId: string
): Promise<
  | { status: 'interest_sent' }
  | { status: 'matched'; matchId: string; score: number }
  | { status: 'mutual_low_compatibility'; score: number }
  | { status: 'mutual_low_answers' }
  | { error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  if (user.id === recipientId) return { error: 'Cannot express interest in yourself' }

  // Insert interest (ignore duplicates)
  const { error: insertErr } = await supabase.from('interests')
    .insert({ sender_id: user.id, recipient_id: recipientId })

  if (insertErr && insertErr.code !== '23505') return { error: insertErr.message }

  // Check for mutual interest
  const { data: mutual } = await supabase.from('interests')
    .select('id').eq('sender_id', recipientId).eq('recipient_id', user.id).maybeSingle()

  if (!mutual) return { status: 'interest_sent' }

  // Mutual! Check if a match already exists
  const [a, b] = [user.id, recipientId].sort()
  const { data: existingMatch } = await supabase.from('matches')
    .select('id').eq('user_a', a).eq('user_b', b).maybeSingle()

  if (existingMatch) {
    revalidatePath('/matches')
    revalidatePath('/discover')
    return { status: 'matched', matchId: existingMatch.id, score: 100 }
  }

  // Calculate compatibility
  const { score, sharedCount } = await computeCompatibility(supabase, user.id, recipientId)

  if (score === null) return { status: 'mutual_low_answers' }

  await cacheCompatibility(supabase, user.id, recipientId, score, sharedCount)

  if (score >= 60) {
    const { data: newMatch, error: matchErr } = await supabase.from('matches')
      .insert({ user_a: a, user_b: b })
      .select('id').single()

    if (matchErr) return { error: matchErr.message }

    revalidatePath('/matches')
    revalidatePath('/discover')
    return { status: 'matched', matchId: newMatch.id, score }
  }

  revalidatePath('/matches')
  revalidatePath('/discover')
  return { status: 'mutual_low_compatibility', score }
}

export async function passProfile(
  targetId: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('passes')
    .upsert({ user_id: user.id, passed_id: targetId }, { onConflict: 'user_id,passed_id', ignoreDuplicates: true })

  if (error) return { error: error.message }
  return { success: true }
}

// ── Attraction rating (internal only — never exposed in UI) ───

export async function rateAttraction(
  ratedId: string,
  score: number
): Promise<{ success: boolean } | { error: string }> {
  if (score < 1 || score > 10) return { error: 'Score must be 1–10' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('attraction_ratings').upsert({
    rater_id: user.id,
    rated_id: ratedId,
    score,
  }, { onConflict: 'rater_id,rated_id' })

  if (error) return { error: error.message }
  return { success: true }
}

// ── Questions (Sets 2–4) ──────────────────────────────────────

export async function saveAnswers(
  answers: Array<{
    question_set: number
    question_number: number
    answer: 'a' | 'b' | 'c'
    importance: 1 | 2 | 3
  }>
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('user_answers').upsert(
    answers.map(a => ({ ...a, user_id: user.id })),
    { onConflict: 'user_id,question_set,question_number' }
  )

  if (error) return { error: error.message }

  // Invalidate cached compatibility scores for this user so they get recalculated
  const { error: cacheErr } = await supabase.from('compatibility_scores')
    .delete()
    .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)

  if (cacheErr) console.error('Failed to invalidate compatibility cache:', cacheErr.message)

  revalidatePath('/questions')
  revalidatePath('/discover')
  return { success: true }
}

// ── Messages ─────────────────────────────────────────────────

export async function sendMessage(matchId: string, content: string) {
  if (!content.trim()) return { error: 'Message cannot be empty' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('messages').insert({
    match_id: matchId,
    sender_id: user.id,
    content: content.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath(`/matches/${matchId}`)
  return { success: true }
}

export async function markMessagesRead(matchId: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('match_id', matchId)
    .neq('sender_id', user.id)
    .is('read_at', null)
}

// ── Subscription ──────────────────────────────────────────────

export async function simulateUpgrade(
  tier: SubscriptionTier
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase.from('users').update({
    subscription_tier: tier,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/subscribe')
  revalidatePath('/profile')
  revalidatePath('/matches')
  return { success: true }
}

// ── Daily confidence ──────────────────────────────────────────

export async function updateDailyConfidence(
  score: number
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase.from('daily_confidence').upsert(
    { user_id: user.id, score, date: today },
    { onConflict: 'user_id,date' }
  )

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

// ── Waitlist ──────────────────────────────────────────────────

export async function joinWaitlist(
  email: string
): Promise<{ success: boolean } | { error: string }> {
  if (!email.trim()) return { error: 'Email is required' }

  const supabase = await createClient()
  const { error } = await supabase.from('waitlist').upsert(
    { email: email.trim().toLowerCase() },
    { onConflict: 'email', ignoreDuplicates: true }
  )

  if (error) return { error: error.message }
  return { success: true }
}
