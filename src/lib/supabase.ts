import { createClient } from '@supabase/supabase-js'

// Server-side client using the service role key.
// IMPORTANT: only ever import this from API routes / server code.
// The public anon client was removed: all database access goes through
// the API routes, and RLS denies direct public access.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
