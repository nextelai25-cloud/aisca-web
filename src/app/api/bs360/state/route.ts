import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidBs360Key } from '@/lib/bs360-auth'

// GET /api/bs360/state?classroom=1&grid=1&key=...
// Returns which of the 16 boxes have already been revealed for this
// specific classroom + grid. Polled every few seconds by the board
// page so every device watching the same classroom/grid stays in sync.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key')
  if (!isValidBs360Key(key)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const classroom = Number(searchParams.get('classroom'))
  const grid = Number(searchParams.get('grid'))

  if (!Number.isInteger(classroom) || classroom < 1 || classroom > 8) {
    return NextResponse.json({ error: 'Invalid classroom' }, { status: 400 })
  }
  if (!Number.isInteger(grid) || grid < 1 || grid > 6) {
    return NextResponse.json({ error: 'Invalid grid' }, { status: 400 })
  }

  const [{ data, error }, matchRes] = await Promise.all([
    supabaseAdmin
      .from('bs360_reveals')
      .select('box_index, revealed_at, team')
      .eq('classroom', classroom)
      .eq('grid', grid),
    supabaseAdmin
      .from('bs360_matches')
      .select('team_a, team_b, winner')
      .eq('classroom', classroom)
      .eq('grid', grid)
      .maybeSingle(),
  ])

  if (error) {
    console.error('[bs360/state] Supabase error:', error.message)
    return NextResponse.json({ error: 'Could not load grid state' }, { status: 500 })
  }

  const match = matchRes.data
    ? { teamA: matchRes.data.team_a, teamB: matchRes.data.team_b, winner: matchRes.data.winner }
    : null

  return NextResponse.json({
    reveals: (data || []).map((r) => ({
      boxIndex: r.box_index,
      revealedAt: r.revealed_at,
      team: r.team ?? null,
    })),
    match,
  })
}
