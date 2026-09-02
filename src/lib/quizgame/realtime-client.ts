'use client'

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// One shared anon client for browser Realtime. If the anon key isn't exposed,
// this returns null and callers fall back to polling.
let cached: SupabaseClient | null | undefined

function getClient(): SupabaseClient | null {
  if (cached !== undefined) return cached
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  cached = url && key
    ? createClient(url, key, { realtime: { params: { eventsPerSecond: 25 } }, auth: { persistSession: false } })
    : null
  return cached
}

/**
 * Subscribe to a session's broadcast channel. `onSync` fires whenever the host
 * or another device signals a change. Returns an unsubscribe function (a no-op
 * when Realtime is unavailable, in which case the caller should poll).
 */
export function subscribeQuiz(code: string, onSync: (event: string) => void): () => void {
  const c = getClient()
  if (!c) return () => {}
  const channel = c.channel(`quizgame:${code}`, { config: { broadcast: { self: false } } })
  channel.on('broadcast', { event: 'sync' }, () => { try { onSync('sync') } catch {} })
  channel.subscribe()
  return () => { try { c.removeChannel(channel) } catch {} }
}

export function realtimeAvailable(): boolean {
  return getClient() !== null
}
