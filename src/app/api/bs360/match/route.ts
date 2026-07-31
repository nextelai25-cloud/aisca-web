import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isValidBs360Key } from '@/lib/bs360-auth'
import { teamsForClassroom } from '@/data/bs360-teams'

// A "match" = the two teams competing on one grid inside one classroom,
// plus (later) the winner. Everything is server-side so every device in the
// classroom sees the same two teams and the same winner.

function validateClassroomGrid(classroom: number, grid: number) {
  if (!Number.isInteger(classroom) || classroom < 1 || classroom > 8) return 'Invalid classroom'
  if (!Number.isInteger(grid) || grid < 1 || grid > 6) return 'Invalid grid'
  return null
}

// GET /api/bs360/match?classroom=1&grid=1&key=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  if (!isValidBs360Key(searchParams.get('key'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const classroom = Number(searchParams.get('classroom'))
  const grid = Number(searchParams.get('grid'))
  const invalid = validateClassroomGrid(classroom, grid)
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('bs360_matches')
    .select('team_a, team_b, winner')
    .eq('classroom', classroom)
    .eq('grid', grid)
    .maybeSingle()

  if (error) {
    console.error('[bs360/match GET] Supabase error:', error.message)
    return NextResponse.json({ error: 'Could not load match' }, { status: 500 })
  }

  return NextResponse.json({
    match: data ? { teamA: data.team_a, teamB: data.team_b, winner: data.winner } : null,
  })
}

// POST /api/bs360/match
//   set teams : { key, classroom, grid, teamA, teamB }
//   set winner: { key, classroom, grid, winner }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!isValidBs360Key(body.key)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const classroom = Number(body.classroom)
    const grid = Number(body.grid)
    const invalid = validateClassroomGrid(classroom, grid)
    if (invalid) return NextResponse.json({ error: invalid }, { status: 400 })

    const teams = teamsForClassroom(classroom)

    // ── Set winner ──────────────────────────────────────────────
    if (typeof body.winner === 'string') {
      const winner = body.winner as string
      if (!teams.includes(winner)) {
        return NextResponse.json({ error: 'Winner is not a team in this classroom' }, { status: 400 })
      }
      // Winner must be one of the two teams actually assigned to this grid.
      const { data: existing } = await supabaseAdmin
        .from('bs360_matches')
        .select('team_a, team_b')
        .eq('classroom', classroom)
        .eq('grid', grid)
        .maybeSingle()

      if (!existing) {
        return NextResponse.json({ error: 'Teams not selected for this grid yet' }, { status: 400 })
      }
      if (winner !== existing.team_a && winner !== existing.team_b) {
        return NextResponse.json({ error: 'Winner must be one of the two competing teams' }, { status: 400 })
      }

      const { error: updErr } = await supabaseAdmin
        .from('bs360_matches')
        .update({ winner })
        .eq('classroom', classroom)
        .eq('grid', grid)

      if (updErr) {
        console.error('[bs360/match winner] Supabase error:', updErr.message)
        return NextResponse.json({ error: 'Could not set winner' }, { status: 500 })
      }
      return NextResponse.json({ ok: true, winner })
    }

    // ── Set teams ───────────────────────────────────────────────
    const teamA = String(body.teamA || '')
    const teamB = String(body.teamB || '')

    if (!teams.includes(teamA) || !teams.includes(teamB)) {
      return NextResponse.json({ error: 'Both teams must belong to this classroom' }, { status: 400 })
    }
    if (teamA === teamB) {
      return NextResponse.json({ error: 'Pick two different teams' }, { status: 400 })
    }

    const { error: insErr } = await supabaseAdmin
      .from('bs360_matches')
      .insert([{ classroom, grid, team_a: teamA, team_b: teamB }])

    // Already set (unique violation) — return the teams that were locked first.
    if (insErr && insErr.code === '23505') {
      const { data: existing } = await supabaseAdmin
        .from('bs360_matches')
        .select('team_a, team_b, winner')
        .eq('classroom', classroom)
        .eq('grid', grid)
        .maybeSingle()

      return NextResponse.json({
        ok: true,
        alreadySet: true,
        match: existing
          ? { teamA: existing.team_a, teamB: existing.team_b, winner: existing.winner }
          : null,
      })
    }

    if (insErr) {
      console.error('[bs360/match teams] Supabase error:', insErr.message)
      return NextResponse.json({ error: 'Could not save teams' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, match: { teamA, teamB, winner: null } })
  } catch (err) {
    console.error('[bs360/match] Internal error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
