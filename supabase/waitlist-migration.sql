-- Waitlist table for landing page email capture
create table if not exists waitlist (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  created_at  timestamptz not null default now(),
  constraint waitlist_email_unique unique (email)
);

-- Only allow inserts from anon/authenticated — no reads or deletes via client
alter table waitlist enable row level security;

create policy "Anyone can join waitlist"
  on waitlist for insert
  with check (true);
