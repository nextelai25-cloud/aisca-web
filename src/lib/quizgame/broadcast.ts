// Server-side: push a "something changed, refetch now" signal to everyone in a
// session over Supabase Realtime broadcast. Clients then pull the authoritative
// state from the API (so answer keys are never leaked through the broadcast).
export async function broadcastSync(
  code: string,
  event: string = 'sync',
  payload: Record<string, unknown> = {}
): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return
  try {
    await fetch(`${url}/realtime/v1/api/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: key, Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        messages: [{ topic: `quizgame:${code}`, event, payload, private: false }],
      }),
    })
  } catch {
    // Non-fatal: clients also poll as a fallback.
  }
}
