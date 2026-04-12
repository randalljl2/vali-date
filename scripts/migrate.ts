/**
 * Migration runner — calls run_prompts_migration() via Supabase RPC.
 * Usage: npm run db:migrate
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to be set.
 * Loads .env.local automatically when run locally.
 */

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// Load .env.local (safe no-op if file absent or vars already set)
try {
  const lines = readFileSync('.env.local', 'utf-8').split('\n')
  for (const line of lines) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.+)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
} catch { /* env vars may already be injected by CI */ }

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error(
    'Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n' +
    'Check that your .env.local contains a valid SUPABASE_SERVICE_ROLE_KEY.'
  )
  process.exit(1)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function runMigration(supabase: any, name: string) {
  console.log(`Running ${name}…`)
  const { error } = await supabase.rpc(name)
  if (error) {
    console.error(`${name} failed:`, error.message)
    process.exit(1)
  }
  console.log(`✓ ${name} complete`)
}

async function main() {
  const supabase = createClient(url!, key!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  await runMigration(supabase, 'run_prompts_migration')
  await runMigration(supabase, 'run_age_preference_migration')
}

main()
