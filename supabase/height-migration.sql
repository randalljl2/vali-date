-- Add optional height column to users table (stored in centimetres)
alter table public.users
  add column if not exists height_cm integer;
