import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { CLASSROOM_TEAMS, requiredMatchups } from '@/data/bs360-teams'

export const dynamic = 'force-dynamic'

// GET /api/bs360/scoreboard  (PUBLIC — no password)
//
// Aggregates every classroom's matches into FIFA-style group standings.
// Competition is always contained inside a classroom, so classrooms are
// reported independently and never mixed.
export async function GET() {
  const { data: matches, error } = await supabaseAdmin
    .from('bs360_matches')
    .select('classroom, grid, team_a, team_b, winner')
    .gt('grid', 0) // never count the demo grid (grid 0)
    .order('classroom', { ascending: true })
    .order('grid', { ascending: true })

  if (error) {
    console.error('[bs360/scoreboard] Supabase error:', error.message)
    return NextResponse.json({ error: 'Could not load scoreboard' }, { status: 500 })
  }

  const byClassroom = (Object.keys(CLASSROOM_TEAMS) as string[])
    .map(Number)
    .sort((a, b) => a - b)
    .map((classroom) => {
      const teams = CLASSROOM_TEAMS[classroom]
      const rows = (matches || []).filter((m) => m.classroom === classroom)

      const stats: Record<
        string,
        { team: string; played: number; won: number; drawn: number; lost: number; points: number }
      > = {}
      for (const t of teams) stats[t] = { team: t, played: 0, won: 0, drawn: 0, lost: 0, points: 0 }

      // A match is "decided" once it has a result: a winner OR a draw.
      const decided = rows.filter((m) => m.winner)
      for (const m of decided) {
        if (m.winner === 'DRAW') {
          // Draw — 1 point each.
          for (const t of [m.team_a, m.team_b]) {
            if (stats[t]) {
              stats[t].played += 1
              stats[t].drawn += 1
              stats[t].points += 1
            }
          }
          continue
        }
        const loser = m.winner === m.team_a ? m.team_b : m.team_a
        if (stats[m.winner!]) {
          stats[m.winner!].played += 1
          stats[m.winner!].won += 1
          stats[m.winner!].points += 2 // win = 2 points
        }
        if (stats[loser]) {
          stats[loser].played += 1
          stats[loser].lost += 1
        }
      }

      const standings = Object.values(stats).sort(
        (a, b) => b.points - a.points || b.won - a.won || a.team.localeCompare(b.team)
      )

      const requiredGames = requiredMatchups(classroom)
      const decidedCount = decided.length
      const topPoints = standings.length ? standings[0].points : 0
      const leaders = standings.filter((s) => s.points === topPoints && topPoints > 0)
      const complete = decidedCount >= requiredGames
      const champion = complete && leaders.length === 1 ? leaders[0].team : null

      return {
        classroom,
        teams,
        standings,
        matches: rows.map((m) => ({
          grid: m.grid,
          teamA: m.team_a,
          teamB: m.team_b,
          winner: m.winner ?? null,
        })),
        requiredGames,
        decidedGames: decidedCount,
        complete,
        champion,
      }
    })

  return NextResponse.json({ classrooms: byClassroom, updatedAt: new Date().toISOString() })
}
