import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/validate'
import { isChoice, isToken, playerByToken, rankFor, runForPlayer } from '@/lib/ceo/server'
import { replay, view } from '@/lib/ceo/engine'
import { TOTAL_ROUNDS } from '@/lib/ceo/types'

// Make one decision in the official game. The server replays the whole game from
// the stored seed + choices, so nothing the browser sends can change the numbers.
export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'ceo-choose', 200, 10 * 60 * 1000)) return NextResponse.json({ error: 'Slow down.' }, { status: 429 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  if (!isToken(body.token)) return NextResponse.json({ error: 'Not registered.' }, { status: 401 })
  if (!isChoice(body.choice) || !Number.isInteger(body.round)) return NextResponse.json({ error: 'Invalid choice.' }, { status: 400 })

  const player = await playerByToken(body.token)
  if (!player) return NextResponse.json({ error: 'Not registered.' }, { status: 401 })
  const run = await runForPlayer(player.id)
  if (!run) return NextResponse.json({ error: 'No game started.' }, { status: 404 })
  if (run.status === 'finished') return NextResponse.json({ error: 'This game is already finished.' }, { status: 409 })

  // The client says which round it is answering; a stale tab or double-click gets a refresh instead.
  if (body.round !== run.choices.length) {
    return NextResponse.json({ error: 'stale', ...view(run.business, run.seed, run.choices) }, { status: 409 })
  }

  const choices = [...run.choices, body.choice as number]
  const { sim, last } = replay(run.business, run.seed, choices)
  const finished = choices.length >= TOTAL_ROUNDS
  const valuation = Math.round(sim.history[sim.history.length - 1].valuation)

  const { data: saved, error } = await supabaseAdmin
    .from('ceo_runs')
    .update({
      choices,
      updated_at: new Date().toISOString(),
      ...(finished ? { status: 'finished', valuation, finished_at: new Date().toISOString() } : { valuation }),
    })
    .eq('id', run.id)
    .eq('updated_at', run.updated_at) // optimistic lock
    .select('id')
  if (error || !saved?.length) {
    const fresh = await runForPlayer(player.id)
    if (fresh) return NextResponse.json({ error: 'stale', ...view(fresh.business, fresh.seed, fresh.choices) }, { status: 409 })
    return NextResponse.json({ error: 'Could not save your decision.' }, { status: 500 })
  }

  const next = view(run.business, run.seed, choices)
  const rank = finished ? await rankFor(valuation) : null
  return NextResponse.json({ outcome: last, view: next, rank })
}
