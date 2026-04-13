-- Add gender and show_me preference columns to users table
alter table users
  add column if not exists gender text
    check (gender in ('man', 'woman', 'non-binary', 'prefer-not-to-say')),
  add column if not exists show_me text
    check (show_me in ('men', 'women', 'everyone'))
    default 'everyone';
