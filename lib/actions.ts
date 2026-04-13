'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { uploadFile, deleteFile } from '@/lib/supabase/admin'
import type { HereFor, UserPhoto, SubscriptionTier, Gender, ShowMe } from '@/types'

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

/**
 * Upload a photo for use during onboarding (no DB write yet).
 * Returns the public URL + storage path so completeOnboarding
 * can persist both the user row and user_photos rows atomically.
 */
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

/**
 * Remove a staged onboarding photo from storage before the profile is saved.
 * Only deletes files inside the calling user's own folder.
 */
export async function deleteOnboardingPhoto(path: string): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // Guard: only allow deleting from the user's own storage folder
  if (!path.startsWith(`${user.id}/`)) return

  await deleteFile(path)
}

/**
 * Upload a photo for an existing user — creates the user_photos row
 * and keeps users.photo_url in sync with position-0 photo.
 */
export async function uploadUserPhoto(
  formData: FormData
): Promise<{ photo: UserPhoto } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Enforce 10-photo cap
  const { count } = await supabase
    .from('user_photos')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if ((count ?? 0) >= 10) return { error: 'Maximum of 10 photos reached' }

  const file = formData.get('photo') as File | null
  if (!file || file.size === 0) return { error: 'No file provided' }

  const result = await uploadFile(user.id, file)
  if ('error' in result) return result

  // Next available position
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

  // Keep users.photo_url in sync with primary photo
  if (position === 0) {
    await supabase
      .from('users')
      .update({ photo_url: result.url, updated_at: new Date().toISOString() })
      .eq('id', user.id)
  }

  revalidatePath('/profile')
  return { photo: photo as UserPhoto }
}

/**
 * Delete a photo. Removes the storage file, DB row, recompacts
 * positions, and re-syncs users.photo_url.
 */
export async function deleteUserPhoto(
  photoId: string
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: photo } = await supabase
    .from('user_photos')
    .select('*')
    .eq('id', photoId)
    .eq('user_id', user.id)
    .single()

  if (!photo) return { error: 'Photo not found' }

  // Derive the storage path from the public URL
  // URL format: https://<ref>.supabase.co/storage/v1/object/public/photos/<path>
  const storagePath = new URL(photo.url).pathname
    .split('/object/public/photos/')[1]

  if (storagePath) {
    await deleteFile(storagePath)
  }

  await supabase.from('user_photos').delete().eq('id', photoId)

  // Recompact positions (0-based, no gaps)
  const { data: remaining } = await supabase
    .from('user_photos')
    .select('id')
    .eq('user_id', user.id)
    .order('position', { ascending: true })

  for (let i = 0; i < (remaining ?? []).length; i++) {
    await supabase
      .from('user_photos')
      .update({ position: i })
      .eq('id', remaining![i].id)
  }

  // Re-sync primary photo
  const { data: newPrimary } = await supabase
    .from('user_photos')
    .select('url')
    .eq('user_id', user.id)
    .eq('position', 0)
    .maybeSingle()

  await supabase
    .from('users')
    .update({
      photo_url: newPrimary?.url ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  revalidatePath('/profile')
  return { success: true }
}

/**
 * Persist a new photo order. `orderedIds` must contain ALL photo IDs
 * for the current user in the desired order.
 */
export async function reorderUserPhotos(
  orderedIds: string[]
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Two-pass update: use temp offset (100+) to avoid unique-constraint
  // conflicts while positions are in flux, then set final values.
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from('user_photos')
      .update({ position: 100 + i })
      .eq('id', orderedIds[i])
      .eq('user_id', user.id)
  }
  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from('user_photos')
      .update({ position: i })
      .eq('id', orderedIds[i])
      .eq('user_id', user.id)
  }

  // Re-sync primary photo
  const { data: primary } = await supabase
    .from('user_photos')
    .select('url')
    .eq('user_id', user.id)
    .eq('position', 0)
    .maybeSingle()

  await supabase
    .from('users')
    .update({
      photo_url: primary?.url ?? null,
      updated_at: new Date().toISOString(),
    })
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
  /** Ordered list of pre-uploaded photos (storage-only, no DB yet). */
  photos: Array<{ url: string }>
  confidence_score: number
  prompt_1_question: string | null
  prompt_1_answer: string | null
  prompt_2_question: string | null
  prompt_2_answer: string | null
}) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { error: 'Not authenticated' }

  // UPSERT — safe to retry if a previous attempt partially succeeded
  const { error: profileError } = await supabase.from('users').upsert({
    id: user.id,
    name: data.name,
    age: data.age,
    city: data.city,
    here_for: data.here_for,
    gender: data.gender,
    show_me: data.show_me,
    photo_url: data.photos[0]?.url ?? null,
    prompt_1_question: data.prompt_1_question,
    prompt_1_answer: data.prompt_1_answer,
    prompt_2_question: data.prompt_2_question,
    prompt_2_answer: data.prompt_2_answer,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' })

  if (profileError) return { error: profileError.message }

  // Replace any photos from a previous attempt, then insert the full ordered set
  await supabase.from('user_photos').delete().eq('user_id', user.id)
  if (data.photos.length > 0) {
    await supabase.from('user_photos').insert(
      data.photos.map((p, i) => ({ user_id: user.id, url: p.url, position: i }))
    )
  }

  // UPSERT daily_confidence — unique on (user_id, date)
  await supabase.from('daily_confidence').upsert(
    { user_id: user.id, score: data.confidence_score },
    { onConflict: 'user_id,date' }
  )

  // UPSERT streak — ignore if already exists so we don't reset a running streak
  await supabase.from('streaks').upsert(
    { user_id: user.id },
    { onConflict: 'user_id', ignoreDuplicates: true }
  )

  redirect('/discover')
}

export async function updateUserPrompts(data: {
  prompt_1_question: string
  prompt_1_answer: string
  prompt_2_question: string
  prompt_2_answer: string
}): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({
      prompt_1_question: data.prompt_1_question,
      prompt_1_answer: data.prompt_1_answer,
      prompt_2_question: data.prompt_2_question,
      prompt_2_answer: data.prompt_2_answer,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

// ── Age preference ───────────────────────────────────────────

export async function updateAgePreference(
  min: number,
  max: number
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({
      preferred_age_min: min,
      preferred_age_max: max,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

// ── Gender & preference ───────────────────────────────────────

export async function updateGenderPreference(
  gender: Gender,
  showMe: ShowMe
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('users')
    .update({
      gender,
      show_me: showMe,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

// ── Ratings ──────────────────────────────────────────────────

export async function submitRating(ratedId: string, score: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const since = new Date()
  since.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('ratings')
    .select('*', { count: 'exact', head: true })
    .eq('rater_id', user.id)
    .gte('created_at', since.toISOString())

  if ((count ?? 0) >= 20) return { error: 'Daily rating limit reached (20/day)' }

  const { error } = await supabase
    .from('ratings')
    .insert({ rater_id: user.id, rated_id: ratedId, score })

  if (error) {
    if (error.code === '23505') return { success: true, alreadyRated: true }
    return { error: error.message }
  }

  // Create a near match record when score = 4
  if (score === 4) {
    await supabase
      .from('near_matches')
      .upsert(
        { rater_id: user.id, rated_id: ratedId, score },
        { onConflict: 'rater_id,rated_id' }
      )
  }

  // UUID ordering must be consistent with the trigger (smaller UUID = user_a)
  const [matchA, matchB] = [user.id, ratedId].sort()
  const { data: matchRow } = await supabase
    .from('matches')
    .select('id')
    .eq('user_a', matchA)
    .eq('user_b', matchB)
    .maybeSingle()

  revalidatePath('/discover')
  return { success: true, matched: !!matchRow, matchId: matchRow?.id ?? null }
}

// ── Near Matches & Convince Me ────────────────────────────────

export async function sendConvinceMe(
  nearMatchId: string,
  message: string
): Promise<{ success: boolean } | { error: string }> {
  if (!message.trim()) return { error: 'Message cannot be empty' }
  if (message.trim().length > 500) return { error: 'Message too long (max 500 chars)' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Verify user has Plus or Premium
  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier')
    .eq('id', user.id)
    .single()

  if (!profile || profile.subscription_tier === 'free') {
    return { error: 'Upgrade to Vali Date Plus to send convince me messages' }
  }

  // Verify this near match belongs to the current user (they are the RATED person)
  const { data: nearMatch } = await supabase
    .from('near_matches')
    .select('id, rater_id, rated_id')
    .eq('id', nearMatchId)
    .eq('rated_id', user.id)
    .single()

  if (!nearMatch) return { error: 'Near match not found' }

  // For Plus users: enforce one convince me per near match
  if (profile.subscription_tier === 'plus') {
    const { count } = await supabase
      .from('convince_me_messages')
      .select('*', { count: 'exact', head: true })
      .eq('near_match_id', nearMatchId)
      .eq('sender_id', user.id)

    if ((count ?? 0) >= 1) {
      return { error: 'You already sent a convince me for this near match' }
    }
  }

  // sender = rated person (current user, B), recipient = rater (A)
  const { error } = await supabase.from('convince_me_messages').insert({
    sender_id: user.id,
    recipient_id: nearMatch.rater_id,
    near_match_id: nearMatchId,
    message: message.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath('/matches')
  return { success: true }
}

// The rater (A) accepts a convince me from the rated person (B),
// directly creating the match without requiring a score update.
export async function acceptConvinceMe(
  convinceMeId: string
): Promise<{ success: boolean; matchId: string | null } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Fetch the message — user must be the recipient (A, the original rater)
  const { data: msg } = await supabase
    .from('convince_me_messages')
    .select('id, sender_id, recipient_id, converted_to_match')
    .eq('id', convinceMeId)
    .eq('recipient_id', user.id)
    .single()

  if (!msg) return { error: 'Message not found' }
  if (msg.converted_to_match) return { error: 'Already matched' }

  // Create the match (A = user.id, B = sender)
  const [matchA, matchB] = [user.id, msg.sender_id].sort()
  await supabase.from('matches').insert({ user_a: matchA, user_b: matchB })

  const { data: matchRow } = await supabase
    .from('matches')
    .select('id')
    .eq('user_a', matchA)
    .eq('user_b', matchB)
    .maybeSingle()

  // Mark converted
  await supabase
    .from('convince_me_messages')
    .update({ converted_to_match: true })
    .eq('id', msg.id)

  revalidatePath('/matches')
  revalidatePath('/discover')
  return { success: true, matchId: matchRow?.id ?? null }
}

// ── Subscriptions ─────────────────────────────────────────────

export async function simulateUpgrade(
  tier: SubscriptionTier
): Promise<{ success: boolean } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error: userErr } = await supabase
    .from('users')
    .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (userErr) return { error: userErr.message }

  await supabase.from('subscriptions').upsert({
    user_id: user.id,
    tier,
    started_at: new Date().toISOString(),
    expires_at: tier === 'free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }, { onConflict: 'user_id' })

  revalidatePath('/subscribe')
  revalidatePath('/profile')
  revalidatePath('/discover')
  return { success: true }
}

// ── Hot Streak Boost ──────────────────────────────────────────

export async function activateHotStreakBoost(): Promise<
  { success: boolean; expiresAt: string } | { error: string }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('users')
    .select('subscription_tier, hot_streak_boost_activated_at')
    .eq('id', user.id)
    .single()

  if (!profile || profile.subscription_tier !== 'premium') {
    return { error: 'Hot streak boost is a Premium feature' }
  }

  // Check if boost is still active (within 60 min)
  if (profile.hot_streak_boost_activated_at) {
    const activatedAt = new Date(profile.hot_streak_boost_activated_at)
    const expiresAt = new Date(activatedAt.getTime() + 60 * 60 * 1000)
    if (expiresAt > new Date()) {
      return { error: 'Your boost is already active', }
    }
    // Check weekly limit (once per 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    if (activatedAt > sevenDaysAgo) {
      return { error: 'You can only use your boost once per week' }
    }
  }

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('users')
    .update({ hot_streak_boost_activated_at: now, updated_at: now })
    .eq('id', user.id)

  if (error) return { error: error.message }

  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  revalidatePath('/profile')
  return { success: true, expiresAt }
}

// ── Score Snapshot (tier movement tracking) ───────────────────

export async function updateScoreSnapshot(): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('users')
    .select('average_score, score_snapshot_at')
    .eq('id', user.id)
    .single()

  if (!profile) return

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const snapshotAt = profile.score_snapshot_at ? new Date(profile.score_snapshot_at) : null

  // Update snapshot if none exists or it's older than 7 days
  if (!snapshotAt || snapshotAt < sevenDaysAgo) {
    await supabase
      .from('users')
      .update({
        score_snapshot: profile.average_score,
        score_snapshot_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
  }
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

// ── Waitlist ──────────────────────────────────────────────────

export async function joinWaitlist(
  email: string
): Promise<{ success: boolean } | { error: string }> {
  if (!email.trim()) return { error: 'Email is required' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('waitlist')
    .upsert({ email: email.trim().toLowerCase() }, { onConflict: 'email', ignoreDuplicates: true })

  if (error) return { error: error.message }
  return { success: true }
}

// ── Daily confidence ──────────────────────────────────────────

export async function updateDailyConfidence(score: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('daily_confidence')
    .upsert({ user_id: user.id, score, date: today }, { onConflict: 'user_id,date' })

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}
