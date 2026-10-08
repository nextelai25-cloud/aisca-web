import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/validate'
import { ceoIsOpen } from '@/lib/ceo/config'
import { isBiz, isToken, newSeed, playerByToken, runForPlayer } from '@/lib/ceo/server'
import { view } from '@/lib/ceo/engine'

// Pick a business and start the one official game. A player can never start a second one.
export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'ceo-start', 30, 10 * 60 * 1000)) return NextResponse.json({ error: 'Slow down.' }, { status: 429 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  if (!isToken(body.token)) return NextResponse.json({ error: 'Not registered.' }, { status: 401 })
  if (!isBiz(body.business)) return NextResponse.json({ error: 'Pick a business.' }, { status: 400 })

  const player = await playerByToken(body.token)
  if (!player) return NextResponse.json({ error: 'Not registered.' }, { status: 401 })

  let run = await runForPlayer(player.id)
  if (!run) {
    if (!ceoIsOpen()) return NextResponse.json({ error: 'The competition is closed.' }, { status: 403 })
    const { error } = await supabaseAdmin
      .from('ceo_runs')
      .insert({ player_id: player.id, business: body.business, seed: newSeed(), choices: [] })
    // A unique constraint on player_id makes a double-click safe: the second insert fails, we reload.
    if (error && !/duplicate|unique/i.test(error.message)) {
      console.error('ceo start:', error.message)
      return NextResponse.json({ error: 'Could not start the game. Please try again.' }, { status: 500 })
    }
    run = await runForPlayer(player.id)
    if (!run) return NextResponse.json({ error: 'Could not start the game.' }, { status: 500 })
  }
  const v = view(run.business, run.seed, run.choices, undefined, true)
  return NextResponse.json({ business: run.business, ...v })
}
