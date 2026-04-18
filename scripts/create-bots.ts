/**
 * Create female bot test accounts via the Supabase Admin Auth API.
 *
 * Deletes any existing bot auth entries by email (cleans up the broken
 * direct-insert rows), then recreates them with admin.createUser() so
 * they can actually log in, then upserts their public.users profiles.
 *
 * Usage:
 *   npx tsx scripts/create-bots.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// ── Load .env.local ───────────────────────────────────────────
try {
  const lines = readFileSync('.env.local', 'utf-8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
} catch { /* env vars may already be set */ }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n' +
    'Check that your .env.local contains SUPABASE_SERVICE_ROLE_KEY.'
  )
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ── Bot definitions ───────────────────────────────────────────
const BOTS = [
  {
    email: 'bot1@validate-test.com',
    name: 'Sophia', age: 28, city: 'Los Angeles',
    here_for: 'actually-dating',
    bio: "Creative director by day, amateur ceramicist by weekend. I'm a little too obsessed with farmer's markets and I'm not apologizing for it.",
    average_score: 78.00, rating_count: 22,
    prompt_1_question: 'The last time I felt really attractive was...',
    prompt_1_answer: "Honestly? Last Tuesday in my favorite vintage Levi's and a white tee. Sometimes the basics just work.",
    prompt_2_question: 'My biggest green flag is...',
    prompt_2_answer: "I ask follow-up questions. Not to be polite — because I'm genuinely curious about people.",
    preferred_age_min: 22, preferred_age_max: 38,
    confidence_score: 7,
  },
  {
    email: 'bot2@validate-test.com',
    name: 'Madison', age: 31, city: 'New York City',
    here_for: 'confidence-building',
    bio: "Attorney who unwinds with hot yoga and terrible reality TV. I contain multitudes. My friends describe me as aggressively loyal and mildly chaotic.",
    average_score: 82.00, rating_count: 35,
    prompt_1_question: 'My therapist would describe me as...',
    prompt_1_answer: "High-functioning with a lot of feelings about her relationship with her mother. But we're working on it.",
    prompt_2_question: 'My most controversial opinion is...',
    prompt_2_answer: "Brunch is not worth waiting 45 minutes for. There. I said it. Make eggs at home.",
    preferred_age_min: 24, preferred_age_max: 42,
    confidence_score: 9,
  },
  {
    email: 'bot3@validate-test.com',
    name: 'Avery', age: 26, city: 'Chicago',
    here_for: 'boredom-curiosity',
    bio: "UX designer. Cyclist. I know every good taco spot in Pilsen. I took a solo trip to Japan last spring and it kind of rewired my brain.",
    average_score: 73.00, rating_count: 18,
    prompt_1_question: "Honestly, I'm here because...",
    prompt_1_answer: "My friend dared me to try something that actually shows my score. Now I'm genuinely kind of hooked.",
    prompt_2_question: 'The last time I felt really attractive was...',
    prompt_2_answer: "Post-bike ride, helmet hair and all, when a stranger at the coffee shop asked if I'd been somewhere fun.",
    preferred_age_min: 21, preferred_age_max: 35,
    confidence_score: 6,
  },
  {
    email: 'bot4@validate-test.com',
    name: 'Isabella', age: 34, city: 'Austin',
    here_for: 'post-breakup-reset',
    bio: "Pediatric nurse. Extremely good at staying calm during chaos. I moved to Austin two years ago and I'm still annoyed by the traffic but the live music makes up for it.",
    average_score: 85.00, rating_count: 40,
    prompt_1_question: 'My biggest green flag is...',
    prompt_1_answer: "I've never once sent a passive-aggressive text. If something bothers me, I just say it like a person.",
    prompt_2_question: 'My therapist would describe me as...',
    prompt_2_answer: "Resilient to a fault. She keeps telling me I'm allowed to need things. Still working on believing her.",
    preferred_age_min: 26, preferred_age_max: 45,
    confidence_score: 8,
  },
  {
    email: 'bot5@validate-test.com',
    name: 'Zoe', age: 29, city: 'Miami',
    here_for: 'actually-dating',
    bio: "Marine biologist and part-time dive instructor. If you're not interested in hearing about octopus intelligence at dinner, this probably isn't going to work.",
    average_score: 69.00, rating_count: 15,
    prompt_1_question: 'My most controversial opinion is...',
    prompt_1_answer: "Ocean swims are better than pools. Always. No exceptions. Chlorine is a prison.",
    prompt_2_question: "Honestly, I'm here because...",
    prompt_2_answer: "I spend most of my time on boats with marine scientists. The dating pool is... limited. Pun intended.",
    preferred_age_min: 23, preferred_age_max: 40,
    confidence_score: 5,
  },
]

const TARGET_EMAIL = 'randalljl2@yahoo.com'

// ── Rating pairs: bot → target user and target → bot ─────────
// All scores ≥ 5 so the check_and_create_match trigger fires both ways
const BOT_RATINGS  = [8, 9, 6, 8, 7] // bot → target
const USER_RATINGS = [8, 9, 6, 9, 7] // target → bot

async function main() {
  // ── Step 1: Delete existing broken bot auth entries ──────────
  console.log('\n── Step 1: Cleaning up existing bot auth entries ────────')
  for (const bot of BOTS) {
    const { data: existing } = await supabase.auth.admin.listUsers()
    const found = existing?.users.find((u) => u.email === bot.email)
    if (found) {
      const { error } = await supabase.auth.admin.deleteUser(found.id)
      if (error) {
        console.error(`  ✗ Failed to delete ${bot.email}:`, error.message)
      } else {
        console.log(`  ✓ Deleted existing auth entry for ${bot.email}`)
      }
    } else {
      console.log(`  — No existing auth entry for ${bot.email}`)
    }
  }

  // ── Step 2: Create bot auth users properly ───────────────────
  console.log('\n── Step 2: Creating bot auth users ──────────────────────')
  const botIds: string[] = []

  for (const bot of BOTS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: bot.email,
      password: 'TestBot123!',
      email_confirm: true, // mark email as confirmed so they can log in
    })

    if (error || !data.user) {
      console.error(`  ✗ Failed to create auth user for ${bot.email}:`, error?.message)
      process.exit(1)
    }

    botIds.push(data.user.id)
    console.log(`  ✓ Created ${bot.email} → ${data.user.id}`)
  }

  // ── Step 3: Upsert public.users profiles ─────────────────────
  console.log('\n── Step 3: Upserting public.users profiles ──────────────')
  for (let i = 0; i < BOTS.length; i++) {
    const bot = BOTS[i]
    const id  = botIds[i]

    const { error } = await supabase.from('users').upsert({
      id,
      name:   bot.name,
      age:    bot.age,
      city:   bot.city,
      here_for: bot.here_for,
      gender: 'woman',
      show_me: 'everyone',
      bio:    bot.bio,
      average_score: bot.average_score,
      rating_count:  bot.rating_count,
      prompt_1_question: bot.prompt_1_question,
      prompt_1_answer:   bot.prompt_1_answer,
      prompt_2_question: bot.prompt_2_question,
      prompt_2_answer:   bot.prompt_2_answer,
      preferred_age_min: bot.preferred_age_min,
      preferred_age_max: bot.preferred_age_max,
      subscription_tier: 'free',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id' })

    if (error) {
      console.error(`  ✗ Failed to upsert profile for ${bot.name}:`, error.message)
      process.exit(1)
    }
    console.log(`  ✓ Profile upserted for ${bot.name} (${bot.city})`)
  }

  // ── Step 4: Streaks & daily confidence ───────────────────────
  console.log('\n── Step 4: Seeding streaks & confidence ─────────────────')
  const streakDays = [5, 12, 2, 7, 1]
  const today = new Date().toISOString().split('T')[0]

  for (let i = 0; i < BOTS.length; i++) {
    const id = botIds[i]

    await supabase.from('streaks').upsert({
      user_id: id,
      current_streak: streakDays[i],
      longest_streak: Math.max(streakDays[i], streakDays[i] + 2),
      last_active: today,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    await supabase.from('daily_confidence').upsert({
      user_id: id,
      score: BOTS[i].confidence_score,
      date: today,
    }, { onConflict: 'user_id,date' })
  }
  console.log('  ✓ Streaks and confidence seeded')

  // ── Step 5: Seed ratings → create matches ────────────────────
  console.log('\n── Step 5: Seeding ratings & creating matches ───────────')

  // Look up target user
  const { data: allUsers } = await supabase.auth.admin.listUsers()
  const targetUser = allUsers?.users.find((u) => u.email === TARGET_EMAIL)

  if (!targetUser) {
    console.warn(`  ⚠ Target user ${TARGET_EMAIL} not found — skipping ratings.`)
    console.warn('    Log in as this user first to complete onboarding, then re-run step 5 manually.')
  } else {
    const targetId = targetUser.id
    console.log(`  Target user: ${targetId}`)

    for (let i = 0; i < BOTS.length; i++) {
      const botId = botIds[i]

      // Bot → target user
      const { error: e1 } = await supabase.from('ratings').upsert({
        rater_id: botId,
        rated_id: targetId,
        score: BOT_RATINGS[i],
      }, { onConflict: 'rater_id,rated_id' })
      if (e1) console.error(`  ✗ Bot→target rating failed for ${BOTS[i].name}:`, e1.message)

      // Target user → bot  (triggers check_and_create_match)
      const { error: e2 } = await supabase.from('ratings').upsert({
        rater_id: targetId,
        rated_id: botId,
        score: USER_RATINGS[i],
      }, { onConflict: 'rater_id,rated_id' })
      if (e2) console.error(`  ✗ Target→bot rating failed for ${BOTS[i].name}:`, e2.message)

      if (!e1 && !e2) {
        console.log(`  ✓ Mutual ratings seeded with ${BOTS[i].name} (${BOT_RATINGS[i]}↔${USER_RATINGS[i]}) → match created`)
      }
    }
  }

  console.log('\n✅ Done. Bot accounts are ready.\n')
  console.log('  Emails:   bot1@validate-test.com — bot5@validate-test.com')
  console.log('  Password: TestBot123!\n')
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
