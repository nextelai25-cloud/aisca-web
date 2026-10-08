import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { publicName } from '@/lib/ceo/server'
import type { LeaderRow } from '@/lib/ceo/types'

export const dynamic = 'force-dynamic'

// Top 20 finished games across all five businesses, ranked by company value.
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('ceo_runs')
    .select('business, valuation, ceo_players(full_name, school)')
    .eq('status', 'finished')
    .order('valuation', { ascending: false })
    .limit(20)
  const { count } = await supabaseAdmin.from('ceo_players').select('*', { count: 'exact', head: true })
  if (error) {
    console.error('ceo leaderboard:', error.message)
    return NextResponse.json({ rows: [], players: 0 })
  }
  const rows: LeaderRow[] = (data || []).map((r: any, i: number) => {
    const p = Array.isArray(r.ceo_players) ? r.ceo_players[0] : r.ceo_players
    return { rank: i + 1, name: publicName(p?.full_name || 'Player'), school: p?.school || '', business: r.business, valuation: Number(r.valuation) }
  })
  return NextResponse.json({ rows, players: count || 0 })
}
