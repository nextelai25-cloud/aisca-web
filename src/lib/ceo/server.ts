// Server helpers for the CEO Challenge API routes. SERVER ONLY.
import { supabaseAdmin } from '@/lib/supabase'
import type { BizId } from './types'
import { BIZ_IDS, TOTAL_ROUNDS } from './types'

export interface RunRow {
  id: string
  player_id: string
  business: BizId
  seed: number
  choices: number[]
  status: 'playing' | 'finished'
  valuation: number | null
  updated_at: string
}

export interface PlayerRow {
  id: string
  token: string
  full_name: string
  school: string
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isBiz = (v: unknown): v is BizId => typeof v === 'string' && (BIZ_IDS as string[]).includes(v)
export const isToken = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v)
export const isChoice = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= 3
export const isChoices = (v: unknown, max = TOTAL_ROUNDS): v is number[] =>
  Array.isArray(v) && v.length <= max && v.every(isChoice)

export const newSeed = () => Math.floor(Math.random() * 2_000_000_000)

export async function playerByToken(token: string): Promise<PlayerRow | null> {
  const { data } = await supabaseAdmin
    .from('ceo_players')
    .select('id, token, full_name, school')
    .eq('token', token)
    .maybeSingle()
  return (data as PlayerRow) || null
}

export async function runForPlayer(playerId: string): Promise<RunRow | null> {
  const { data } = await supabaseAdmin
    .from('ceo_runs')
    .select('id, player_id, business, seed, choices, status, valuation, updated_at')
    .eq('player_id', playerId)
    .maybeSingle()
  return (data as RunRow) || null
}

/** 1-based rank among finished games (ties share a rank). */
export async function rankFor(valuation: number): Promise<{ rank: number; total: number }> {
  const [{ count: higher }, { count: total }] = await Promise.all([
    supabaseAdmin.from('ceo_runs').select('*', { count: 'exact', head: true }).eq('status', 'finished').gt('valuation', valuation),
    supabaseAdmin.from('ceo_runs').select('*', { count: 'exact', head: true }).eq('status', 'finished'),
  ])
  return { rank: (higher || 0) + 1, total: total || 0 }
}

/** "Isira Chirayu Perera" → "Isira P." for the public leaderboard. */
export function publicName(full: string): string {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 1) return parts[0]
  return `${parts[0]} ${parts[parts.length - 1].charAt(0).toUpperCase()}.`
}
