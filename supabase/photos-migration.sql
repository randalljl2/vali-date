-- ============================================================
-- Vali Date — Photos migration
-- Run this in your Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- ── Storage bucket + RLS ─────────────────────────────────────
-- Create the 'photos' bucket (public, 10 MB limit, images only).
-- safe to re-run — insert ... on conflict do nothing
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  10485760,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Public read: anyone can view photos (bucket is public)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Photos public read'
  ) then
    create policy "Photos public read" on storage.objects
      for select using (bucket_id = 'photos');
  end if;
end $$;

-- Authenticated users can upload into their own folder (userId/*)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users upload own photos'
  ) then
    create policy "Users upload own photos" on storage.objects
      for insert with check (
        bucket_id = 'photos'
        and auth.role() = 'authenticated'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;

-- Authenticated users can delete their own photos
do $$ begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users delete own photos'
  ) then
    create policy "Users delete own photos" on storage.objects
      for delete using (
        bucket_id = 'photos'
        and auth.role() = 'authenticated'
        and auth.uid()::text = (storage.foldername(name))[1]
      );
  end if;
end $$;

-- Multi-photo table (up to 10 per user; position 0 = primary)
create table if not exists public.user_photos (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        not null references public.users(id) on delete cascade,
  url         text        not null,
  position    integer     not null default 0,
  created_at  timestamptz not null default now()
);

-- Positions should be unique per user (no gaps after reorder/delete)
create unique index if not exists user_photos_user_position_idx
  on public.user_photos (user_id, position);

create index if not exists user_photos_user_idx
  on public.user_photos (user_id);

alter table public.user_photos enable row level security;

-- Anyone can see photos (public profiles)
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_photos' and policyname = 'Photos are publicly viewable'
  ) then
    create policy "Photos are publicly viewable" on public.user_photos
      for select using (true);
  end if;
end $$;

-- Only the owner can insert/update/delete their own photos
do $$ begin
  if not exists (
    select 1 from pg_policies
    where tablename = 'user_photos' and policyname = 'Users manage their own photos'
  ) then
    create policy "Users manage their own photos" on public.user_photos
      for all using (auth.uid() = user_id);
  end if;
end $$;

-- Backfill: if users already have photo_url set, insert a row in user_photos
insert into public.user_photos (user_id, url, position)
select id, photo_url, 0
from public.users
where photo_url is not null
  and id not in (select user_id from public.user_photos)
on conflict do nothing;
