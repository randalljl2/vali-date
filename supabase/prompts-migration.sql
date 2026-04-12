-- Prompts migration
-- Adds 4 prompt columns to public.users.
-- Wrapped in a SECURITY DEFINER function so it can be invoked via
-- supabase.rpc('run_prompts_migration') from the migration script.
-- Safe to run multiple times (IF NOT EXISTS).

CREATE OR REPLACE FUNCTION run_prompts_migration()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS prompt_1_question TEXT,
    ADD COLUMN IF NOT EXISTS prompt_1_answer   TEXT,
    ADD COLUMN IF NOT EXISTS prompt_2_question TEXT,
    ADD COLUMN IF NOT EXISTS prompt_2_answer   TEXT;
END;
$$;

SELECT run_prompts_migration();
