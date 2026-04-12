-- ============================================================
-- Vali Date — Supabase Schema
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension (usually already enabled)
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- User profiles (linked to auth.users)
create table public.users (
  id          uuid references auth.users(id) on delete cascade primary key,
  name        text        not null,
  age         integer     not null check (age >= 18 and age <= 99),
  city        text        not null,
  here_for    text        not null check (here_for in (
                'post-breakup-reset',
                'boredom-curiosity',
                'actually-dating',
                'confidence-building'
              )),
  photo_url   text,
  -- Score is 0–100 (average of 1–10 ratings × 10)
  average_score   numeric(5,2) not null default 0,
  rating_count    integer      not null default 0,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

-- Ratings
create table public.ratings (
  id          uuid        default gen_random_uuid() primary key,
  rater_id    uuid        not null references public.users(id) on delete cascade,
  rated_id    uuid        not null references public.users(id) on delete cascade,
  score       integer     not null check (score >= 1 and score <= 10),
  created_at  timestamptz not null default now(),
  unique (rater_id, rated_id)
);

create index on public.ratings (rated_id);
create index on public.ratings (rater_id, created_at);

-- Matches (created automatically when mutual 5+ ratings exist)
create table public.matches (
  id          uuid        default gen_random_uuid() primary key,
  user_a      uuid        not null references public.users(id) on delete cascade,
  user_b      uuid        not null references public.users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (user_a, user_b)
);

create index on public.matches (user_a);
create index on public.matches (user_b);

-- Messages (locked to matched users)
create table public.messages (
  id          uuid        default gen_random_uuid() primary key,
  match_id    uuid        not null references public.matches(id) on delete cascade,
  sender_id   uuid        not null references public.users(id) on delete cascade,
  content     text        not null,
  created_at  timestamptz not null default now()
);

create index on public.messages (match_id, created_at);

-- Streaks
create table public.streaks (
  user_id         uuid    references public.users(id) on delete cascade primary key,
  current_streak  integer not null default 1,
  longest_streak  integer not null default 1,
  last_active     date    not null default current_date,
  updated_at      timestamptz not null default now()
);

-- Daily confidence check-ins
create table public.daily_confidence (
  id          uuid    default gen_random_uuid() primary key,
  user_id     uuid    not null references public.users(id) on delete cascade,
  score       integer not null check (score >= 1 and score <= 10),
  date        date    not null default current_date,
  unique (user_id, date)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.users            enable row level security;
alter table public.ratings          enable row level security;
alter table public.matches          enable row level security;
alter table public.messages         enable row level security;
alter table public.streaks          enable row level security;
alter table public.daily_confidence enable row level security;

-- users: anyone can read, only owner can write
create policy "Public profiles are readable" on public.users
  for select using (true);

create policy "Users insert their own profile" on public.users
  for insert with check (auth.uid() = id);

create policy "Users update their own profile" on public.users
  for update using (auth.uid() = id);

-- ratings: only involved parties can read
create policy "Ratings visible to participants" on public.ratings
  for select using (auth.uid() = rater_id or auth.uid() = rated_id);

create policy "Users submit their own ratings" on public.ratings
  for insert with check (auth.uid() = rater_id);

-- matches: only matched users can read
create policy "Matches visible to participants" on public.matches
  for select using (auth.uid() = user_a or auth.uid() = user_b);

create policy "Match creation by participants" on public.matches
  for insert with check (auth.uid() = user_a or auth.uid() = user_b);

-- messages: only matched users
create policy "Messages visible to match participants" on public.messages
  for select using (
    exists (
      select 1 from public.matches
      where id = match_id
        and (user_a = auth.uid() or user_b = auth.uid())
    )
  );

create policy "Users send messages in their matches" on public.messages
  for insert with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.matches
      where id = match_id
        and (user_a = auth.uid() or user_b = auth.uid())
    )
  );

-- streaks: public read, self write
create policy "Streaks are public" on public.streaks
  for select using (true);

create policy "Users manage their own streak" on public.streaks
  for all using (auth.uid() = user_id);

-- daily_confidence: self only
create policy "Users manage their own confidence" on public.daily_confidence
  for all using (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Recalculate average score whenever a rating is inserted
create or replace function update_user_average_score()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.users
  set
    average_score = (
      select round((avg(score) * 10)::numeric, 2)
      from public.ratings
      where rated_id = new.rated_id
    ),
    rating_count = (
      select count(*)
      from public.ratings
      where rated_id = new.rated_id
    ),
    updated_at = now()
  where id = new.rated_id;
  return new;
end;
$$;

create trigger trg_update_score
  after insert on public.ratings
  for each row execute procedure update_user_average_score();

-- Auto-create a match when mutual 5+ ratings exist
create or replace function check_and_create_match()
returns trigger
language plpgsql
security definer
as $$
declare
  v_match_a uuid;
  v_match_b uuid;
begin
  if new.score < 5 then
    return new;
  end if;

  -- Check for a reverse rating of 5+
  if exists (
    select 1 from public.ratings
    where rater_id = new.rated_id
      and rated_id = new.rater_id
      and score >= 5
  ) then
    -- Ensure consistent ordering so the unique constraint works
    if new.rater_id < new.rated_id then
      v_match_a := new.rater_id;
      v_match_b := new.rated_id;
    else
      v_match_a := new.rated_id;
      v_match_b := new.rater_id;
    end if;

    insert into public.matches (user_a, user_b)
    values (v_match_a, v_match_b)
    on conflict (user_a, user_b) do nothing;
  end if;

  return new;
end;
$$;

create trigger trg_check_match
  after insert on public.ratings
  for each row execute procedure check_and_create_match();

-- Streak upsert called from middleware on every authenticated page load
create or replace function update_streak(p_user_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_last_active date;
  v_current    integer;
  v_longest    integer;
begin
  select last_active, current_streak, longest_streak
  into v_last_active, v_current, v_longest
  from public.streaks
  where user_id = p_user_id;

  if not found then
    insert into public.streaks (user_id, current_streak, longest_streak, last_active)
    values (p_user_id, 1, 1, current_date);
    return;
  end if;

  -- Already updated today
  if v_last_active = current_date then
    return;
  end if;

  -- Consecutive day
  if v_last_active = current_date - 1 then
    v_current := v_current + 1;
  else
    -- Missed a day — reset
    v_current := 1;
  end if;

  v_longest := greatest(v_longest, v_current);

  update public.streaks
  set current_streak  = v_current,
      longest_streak  = v_longest,
      last_active     = current_date,
      updated_at      = now()
  where user_id = p_user_id;
end;
$$;

-- ============================================================
-- STORAGE
-- ============================================================
-- Run manually in the Supabase dashboard or via API:
--
-- insert into storage.buckets (id, name, public)
-- values ('avatars', 'avatars', true)
-- on conflict do nothing;
--
-- create policy "Avatar images are publicly accessible" on storage.objects
--   for select using (bucket_id = 'avatars');
--
-- create policy "Users upload their own avatar" on storage.objects
--   for insert with check (
--     bucket_id = 'avatars'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );
--
-- create policy "Users update their own avatar" on storage.objects
--   for update using (
--     bucket_id = 'avatars'
--     and auth.uid()::text = (storage.foldername(name))[1]
--   );
