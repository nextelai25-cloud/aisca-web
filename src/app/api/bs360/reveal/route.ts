import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidClassroomKey } from '@/lib/bs360-auth'

// POST /api/bs360/reveal  { key, classroom, grid, boxIndex }
//
// This is the "can it be opened" gatekeeper. It tries to INSERT a row.
// The (classroom, grid, box_index) UNIQUE constraint in Supabase means
// if two devices in the same classroom tap the same box at the same
// moment, only ONE insert can ever succeed — Postgres itself resolves
// the race, so there's no scenario where a box gets revealed twice or
// a question flashes on two screens at once.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const classroom = Number(body.classroom)
    const grid = Number(body.grid)
    const boxIndex = Number(body.boxIndex)
    const team = typeof body.team === 'string' && body.team ? String(body.team) : null

    if (!Number.isInteger(classroom) || classroom < 1 || classroom > 8) {
      return NextResponse.json({ error: 'Invalid classroom' }, { status: 400 })
    }
    if (!isValidClassroomKey(classroom, body.key)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!Number.isInteger(grid) || grid < 1 || grid > 6) {
      return NextResponse.json({ error: 'Invalid grid' }, { status: 400 })
    }
    if (!Number.isInteger(boxIndex) || boxIndex < 0 || boxIndex > 15) {
      return NextResponse.json({ error: 'Invalid box' }, { status: 400 })
    }

    // A box can only be opened once the two teams for this grid are set,
    // and the answering team must be one of those two. This blocks
    // direct-API attempts to reveal questions early or store bogus teams.
    const { data: matchRow } = await supabaseAdmin
      .from('bs360_matches')
      .select('team_a, team_b')
      .eq('classroom', classroom)
      .eq('grid', grid)
      .maybeSingle()

    if (!matchRow) {
      return NextResponse.json({ error: 'Teams not selected for this grid yet' }, { status: 400 })
    }
    if (team && team !== matchRow.team_a && team !== matchRow.team_b) {
      return NextResponse.json({ error: 'Answering team is not part of this match' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('bs360_reveals')
      .insert([{ classroom, grid, box_index: boxIndex, team }])
      .select('revealed_at, team')
      .single()

    if (!error) {
      // We were first — this device gets to show the question.
      return NextResponse.json({ firstReveal: true, revealedAt: data.revealed_at, team: data.team })
    }

    // Unique-constraint violation = someone else already revealed this
    // exact box in this exact classroom/grid. Not an error condition —
    // just tell the caller it's already used.
    if (error.code === '23505') {
      const { data: existing } = await supabaseAdmin
        .from('bs360_reveals')
        .select('revealed_at, team')
        .eq('classroom', classroom)
        .eq('grid', grid)
        .eq('box_index', boxIndex)
        .single()

      return NextResponse.json({
        firstReveal: false,
        revealedAt: existing?.revealed_at || null,
        team: existing?.team || null,
      })
    }

    console.error('[bs360/reveal] Supabase error:', error.message)
    return NextResponse.json({ error: 'Could not reveal box' }, { status: 500 })
  } catch (err) {
    console.error('[bs360/reveal] Internal error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
