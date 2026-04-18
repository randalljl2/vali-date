-- ============================================================
-- Vali Date — Female Bot Seed Accounts
-- Run in Supabase SQL Editor (runs as service_role, bypasses RLS)
--
-- Creates 5 female test profiles + auth users, then seeds mutual
-- ratings so matches are available for testing immediately.
-- ============================================================

-- Fixed UUIDs — stable across re-runs so ON CONFLICT works cleanly
-- Bot 1: Sophia, 28, Los Angeles
-- Bot 2: Madison, 31, New York City
-- Bot 3: Avery, 26, Chicago
-- Bot 4: Isabella, 34, Austin
-- Bot 5: Zoe, 29, Miami

DO $$
DECLARE
  bot1 uuid := 'ba7e0001-0000-0000-0000-000000000001';
  bot2 uuid := 'ba7e0001-0000-0000-0000-000000000002';
  bot3 uuid := 'ba7e0001-0000-0000-0000-000000000003';
  bot4 uuid := 'ba7e0001-0000-0000-0000-000000000004';
  bot5 uuid := 'ba7e0001-0000-0000-0000-000000000005';
  target_id uuid;
BEGIN

  -- ── 1. Auth users ──────────────────────────────────────────
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, created_at, updated_at,
    aud, role,
    raw_app_meta_data, raw_user_meta_data,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES
    (bot1, '00000000-0000-0000-0000-000000000000',
     'bot1@validate-test.com', crypt('TestBot123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated',
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     '', '', '', ''),
    (bot2, '00000000-0000-0000-0000-000000000000',
     'bot2@validate-test.com', crypt('TestBot123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated',
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     '', '', '', ''),
    (bot3, '00000000-0000-0000-0000-000000000000',
     'bot3@validate-test.com', crypt('TestBot123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated',
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     '', '', '', ''),
    (bot4, '00000000-0000-0000-0000-000000000000',
     'bot4@validate-test.com', crypt('TestBot123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated',
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     '', '', '', ''),
    (bot5, '00000000-0000-0000-0000-000000000000',
     'bot5@validate-test.com', crypt('TestBot123!', gen_salt('bf')),
     now(), now(), now(), 'authenticated', 'authenticated',
     '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb,
     '', '', '', '')
  ON CONFLICT (id) DO NOTHING;

  -- ── 2. Public profiles ─────────────────────────────────────
  INSERT INTO public.users (
    id, name, age, city, here_for, gender, show_me,
    bio, average_score, rating_count,
    prompt_1_question, prompt_1_answer,
    prompt_2_question, prompt_2_answer,
    preferred_age_min, preferred_age_max,
    subscription_tier,
    created_at, updated_at
  ) VALUES
    -- Bot 1: Sophia, LA, actually-dating, 7.8
    (bot1, 'Sophia', 28, 'Los Angeles', 'actually-dating', 'woman', 'everyone',
     'Creative director by day, amateur ceramicist by weekend. I''m a little too obsessed with farmer''s markets and I''m not apologizing for it.',
     78.00, 22,
     'The last time I felt really attractive was...',
     'Honestly? Last Tuesday in my favorite vintage Levi''s and a white tee. Sometimes the basics just work.',
     'My biggest green flag is...',
     'I ask follow-up questions. Not to be polite — because I''m genuinely curious about people.',
     22, 38, 'free',
     now() - interval '14 days', now() - interval '2 days'),

    -- Bot 2: Madison, NYC, confidence-building, 8.2
    (bot2, 'Madison', 31, 'New York City', 'confidence-building', 'woman', 'everyone',
     'Attorney who unwinds with hot yoga and terrible reality TV. I contain multitudes. My friends describe me as aggressively loyal and mildly chaotic.',
     82.00, 35,
     'My therapist would describe me as...',
     'High-functioning with a lot of feelings about her relationship with her mother. But we''re working on it.',
     'My most controversial opinion is...',
     'Brunch is not worth waiting 45 minutes for. There. I said it. Make eggs at home.',
     24, 42, 'free',
     now() - interval '21 days', now() - interval '1 day'),

    -- Bot 3: Avery, Chicago, boredom-curiosity, 7.3
    (bot3, 'Avery', 26, 'Chicago', 'boredom-curiosity', 'woman', 'everyone',
     'UX designer. Cyclist. I know every good taco spot in Pilsen. I took a solo trip to Japan last spring and it kind of rewired my brain.',
     73.00, 18,
     'Honestly, I''m here because...',
     'My friend dared me to try something that actually shows my score. Now I''m genuinely kind of hooked.',
     'The last time I felt really attractive was...',
     'Post-bike ride, helmet hair and all, when a stranger at the coffee shop asked if I''d been somewhere fun.',
     21, 35, 'free',
     now() - interval '9 days', now() - interval '3 days'),

    -- Bot 4: Isabella, Austin, post-breakup-reset, 8.5
    (bot4, 'Isabella', 34, 'Austin', 'post-breakup-reset', 'woman', 'everyone',
     'Pediatric nurse. Extremely good at staying calm during chaos. I moved to Austin two years ago and I''m still annoyed by the traffic but the live music makes up for it.',
     85.00, 40,
     'My biggest green flag is...',
     'I''ve never once sent a passive-aggressive text. If something bothers me, I just say it like a person.',
     'My therapist would describe me as...',
     'Resilient to a fault. She keeps telling me I''m allowed to need things. Still working on believing her.',
     26, 45, 'free',
     now() - interval '30 days', now() - interval '4 days'),

    -- Bot 5: Zoe, Miami, actually-dating, 6.9
    (bot5, 'Zoe', 29, 'Miami', 'actually-dating', 'woman', 'everyone',
     'Marine biologist and part-time dive instructor. If you''re not interested in hearing about octopus intelligence at dinner, this probably isn''t going to work.',
     69.00, 15,
     'My most controversial opinion is...',
     'Ocean swims are better than pools. Always. No exceptions. Chlorine is a prison.',
     'Honestly, I''m here because...',
     'I spend most of my time on boats with marine scientists. The dating pool is... limited. Pun intended.',
     23, 40, 'free',
     now() - interval '5 days', now() - interval '1 day')
  ON CONFLICT (id) DO NOTHING;

  -- ── 3. Streaks ─────────────────────────────────────────────
  INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_active, updated_at)
  VALUES
    (bot1, 5,  8,  current_date - 1, now()),
    (bot2, 12, 12, current_date - 1, now()),
    (bot3, 2,  6,  current_date - 1, now()),
    (bot4, 7,  18, current_date - 1, now()),
    (bot5, 1,  4,  current_date - 1, now())
  ON CONFLICT (user_id) DO NOTHING;

  -- ── 4. Daily confidence ─────────────────────────────────────
  INSERT INTO public.daily_confidence (user_id, score, date)
  VALUES
    (bot1, 7, current_date),
    (bot2, 9, current_date),
    (bot3, 6, current_date),
    (bot4, 8, current_date),
    (bot5, 5, current_date)
  ON CONFLICT (user_id, date) DO NOTHING;

  -- ── 5. Bot ratings → target user ───────────────────────────
  -- Look up the real user's ID by email
  SELECT id INTO target_id
  FROM auth.users
  WHERE email = 'randalljl2@yahoo.com';

  IF target_id IS NULL THEN
    RAISE NOTICE 'Target user randalljl2@yahoo.com not found — skipping ratings.';
  ELSE
    -- Insert ratings FROM each bot TO the target user
    -- (triggers update_user_average_score → recalculates their score)
    INSERT INTO public.ratings (rater_id, rated_id, score, created_at)
    VALUES
      (bot1, target_id, 8, now() - interval '3 hours'),
      (bot2, target_id, 9, now() - interval '2 hours'),
      (bot3, target_id, 6, now() - interval '90 minutes'),
      (bot4, target_id, 8, now() - interval '45 minutes'),
      (bot5, target_id, 7, now() - interval '15 minutes')
    ON CONFLICT (rater_id, rated_id) DO NOTHING;

    -- Insert ratings FROM target user TO each bot (all ≥ 5)
    -- Combined with the bot→user ratings above, the check_and_create_match
    -- trigger will fire and create 5 matches automatically.
    INSERT INTO public.ratings (rater_id, rated_id, score, created_at)
    VALUES
      (target_id, bot1, 8, now() - interval '2 hours 50 minutes'),
      (target_id, bot2, 9, now() - interval '1 hour 50 minutes'),
      (target_id, bot3, 6, now() - interval '80 minutes'),
      (target_id, bot4, 9, now() - interval '35 minutes'),
      (target_id, bot5, 7, now() - interval '10 minutes')
    ON CONFLICT (rater_id, rated_id) DO NOTHING;

    RAISE NOTICE 'Ratings inserted and matches created for user %', target_id;
  END IF;

END $$;

-- ── Verify ────────────────────────────────────────────────────
SELECT
  u.name, u.age, u.city, u.gender, u.show_me, u.here_for,
  u.average_score, u.rating_count,
  u.prompt_1_question, u.prompt_1_answer,
  u.prompt_2_question, u.prompt_2_answer
FROM public.users u
WHERE u.id IN (
  'ba7e0001-0000-0000-0000-000000000001',
  'ba7e0001-0000-0000-0000-000000000002',
  'ba7e0001-0000-0000-0000-000000000003',
  'ba7e0001-0000-0000-0000-000000000004',
  'ba7e0001-0000-0000-0000-000000000005'
)
ORDER BY u.name;
