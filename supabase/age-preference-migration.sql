CREATE OR REPLACE FUNCTION run_age_preference_migration()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS preferred_age_min INTEGER NOT NULL DEFAULT 18,
    ADD COLUMN IF NOT EXISTS preferred_age_max INTEGER NOT NULL DEFAULT 65;
END;
$$;

SELECT run_age_preference_migration();
