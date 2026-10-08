import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/validate'
import { isToken, playerByToken, runForPlayer, rankFor } from '@/lib/ceo/server'
import { view } from '@/lib/ceo/engine'

// Load the signed-in player's official game (for resuming).
export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'ceo-game', 120, 10 * 60 * 1000)) return NextResponse.json({ error: 'Slow down.' }, { status: 429 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  if (!isToken(body.token)) return NextResponse.json({ error: 'Not registered.' }, { status: 401 })

  const player = await playerByToken(body.token)
  if (!player) return NextResponse.json({ error: 'Not registered.' }, { status: 401 })

  const run = await runForPlayer(player.id)
  const me = { name: player.full_name, school: player.school }
  if (!run) return NextResponse.json({ player: me, run: null })

  const v = view(run.business, run.seed, run.choices, undefined, run.choices.length === 0)
  const rank = run.status === 'finished' && run.valuation !== null ? await rankFor(run.valuation) : null
  return NextResponse.json({ player: me, run: { business: run.business, ...v, rank } })
}
