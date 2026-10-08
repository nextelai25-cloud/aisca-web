import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/validate'
import { isBiz, isChoices, newSeed } from '@/lib/ceo/server'
import { replay, view } from '@/lib/ceo/engine'
import { DEMO_ROUNDS } from '@/lib/ceo/types'

// Demo games are stateless: the browser keeps (business, seed, choices) and the server replays them.
// Nothing is saved and demo results never reach the leaderboard.
export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'ceo-demo', 300, 10 * 60 * 1000)) return NextResponse.json({ error: 'Slow down.' }, { status: 429 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  if (!isBiz(body.business)) return NextResponse.json({ error: 'Pick a business.' }, { status: 400 })
  if (!isChoices(body.choices, DEMO_ROUNDS)) return NextResponse.json({ error: 'Invalid choices.' }, { status: 400 })
  const seed = Number.isInteger(body.seed) ? (body.seed as number) : newSeed()
  const choices = body.choices as number[]

  if (!choices.length) {
    return NextResponse.json({ seed, business: body.business, ...view(body.business, seed, [], DEMO_ROUNDS, true) })
  }
  const { last } = replay(body.business, seed, choices, DEMO_ROUNDS)
  return NextResponse.json({ seed, outcome: last, view: view(body.business, seed, choices, DEMO_ROUNDS) })
}
