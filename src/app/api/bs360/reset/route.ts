import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidClassroomKey } from '@/lib/bs360-auth'

// POST /api/bs360/reset  { key, classroom, grid }
//
// Clears every revealed box for one classroom's copy of one grid.
// This exists so you can test-play a grid over and over before the
// real event without recreating the Supabase table by hand.
// It only ever touches ONE classroom + ONE grid at a time — it can
// never wipe another classroom's progress.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const classroom = Number(body.classroom)
    const grid = Number(body.grid)

    if (!Number.isInteger(classroom) || classroom < 1 || classroom > 8) {
      return NextResponse.json({ error: 'Invalid classroom' }, { status: 400 })
    }
    if (!isValidClassroomKey(classroom, body.key)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!Number.isInteger(grid) || grid < 1 || grid > 6) {
      return NextResponse.json({ error: 'Invalid grid' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('bs360_reveals')
      .delete()
      .eq('classroom', classroom)
      .eq('grid', grid)

    if (error) {
      console.error('[bs360/reset] Supabase error:', error.message)
      return NextResponse.json({ error: 'Could not reset grid' }, { status: 500 })
    }

    // Also clear the match (teams + winner) for this grid so it can be
    // re-played from scratch during testing.
    const { error: matchErr } = await supabaseAdmin
      .from('bs360_matches')
      .delete()
      .eq('classroom', classroom)
      .eq('grid', grid)

    if (matchErr) {
      console.error('[bs360/reset match] Supabase error:', matchErr.message)
      return NextResponse.json({ error: 'Could not reset match' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[bs360/reset] Internal error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
