-- ============================================================
-- Vali Date — Premium & Retention Migration
-- Run this in your Supabase SQL editor after schema.sql
-- ============================================================

-- ── Users: subscription tier + snapshot columns ──────────────

alter table public.users
  add column if not exists subscription_tier text not null default 'free'
    check (subscription_tier in ('free', 'plus', 'premium'));

-- Weekly score snapshot for tier-movement detection
alter table public.users
  add column if not exists score_snapshot    numeric(5,2);
alter table public.users
  add column if not exists score_snapshot_at timestamptz;

-- Premium hot-streak boost (60 min, once per week)
alter table public.users
  add column if not exists hot_streak_boost_activated_at timestamptz;

-- ── Subscriptions ─────────────────────────────────────────────

create table if not exists public.subscriptions (
  user_id     uuid        references public.users(id) on delete cascade primary key,
  tier        text        not null check (tier in ('free', 'plus', 'premium')),
  started_at  timestamptz not null default now(),
  expires_at  timestamptz
);

alter table public.subscriptions enable row level security;

create policy "Users view their own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Users manage their own subscription" on public.subscriptions
  for all using (auth.uid() = user_id);

-- ── Near Matches ──────────────────────────────────────────────
-- Created whenever someone rates another user exactly 4

create table if not exists public.near_matches (
  id          uuid        default gen_random_uuid() primary key,
  rater_id    uuid        not null references public.users(id) on delete cascade,
  rated_id    uuid        not null references public.users(id) on delete cascade,
  score       integer     not null,
  created_at  timestamptz not null default now(),
  unique (rater_id, rated_id)
);

create index if not exists near_matches_rated_id_idx  on public.near_matches (rated_id);
create index if not exists near_matches_rater_id_idx  on public.near_matches (rater_id);

alter table public.near_matches enable row level security;

create policy "Near matches visible to participants" on public.near_matches
  for select using (auth.uid() = rater_id or auth.uid() = rated_id);

create policy "Users insert their own near matches" on public.near_matches
  for insert with check (auth.uid() = rater_id);

-- ── Convince Me Messages ──────────────────────────────────────
-- Plus: one per near match. Premium: unlimited threads.

create table if not exists public.convince_me_messages (
  id                  uuid        default gen_random_uuid() primary key,
  sender_id           uuid        not null references public.users(id) on delete cascade,
  recipient_id        uuid        not null references public.users(id) on delete cascade,
  near_match_id       uuid        not null references public.near_matches(id) on delete cascade,
  message             text        not null,
  created_at          timestamptz not null default now(),
  converted_to_match  boolean     not null default false
);

create index if not exists convince_me_recipient_idx   on public.convince_me_messages (recipient_id);
create index if not exists convince_me_sender_idx      on public.convince_me_messages (sender_id);
create index if not exists convince_me_near_match_idx  on public.convince_me_messages (near_match_id);

alter table public.convince_me_messages enable row level security;

create policy "Convince me visible to participants" on public.convince_me_messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "Users send their own convince me" on public.convince_me_messages
  for insert with check (auth.uid() = sender_id);

create policy "Participants can update converted flag" on public.convince_me_messages
  for update using (auth.uid() = sender_id or auth.uid() = recipient_id);
