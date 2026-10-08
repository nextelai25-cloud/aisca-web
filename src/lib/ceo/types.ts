// Shared CEO Challenge types (safe to import from client components).
// The simulation itself lives in engine.ts and only runs on the server.

export type BizId = 'cafe' | 'restaurant' | 'tech' | 'fashion' | 'hotel'

export const BIZ_IDS: BizId[] = ['cafe', 'restaurant', 'tech', 'fashion', 'hotel']

export const TOTAL_ROUNDS = 15
export const DEMO_ROUNDS = 8

export interface BizCard {
  id: BizId
  name: string
  kind: string // "Coffee shop"
  place: string // "Colombo 07"
  teaser: string // one line on the landing grid
  unit: string // "customers" | "diners" | "clients" ...
  unitPer: string // "a week"
  accent: string // scene accent colour
}

/** Numbers a player is allowed to see. Hidden stats are reduced to a coarse "vibe" for the scene. */
export interface PublicState {
  business: BizId
  round: number // decisions already made
  totalRounds: number
  week: number
  cash: number
  debt: number
  revenue: number // weekly
  profit: number // weekly
  customers: number // weekly
  capacity: number
  price: number
  valuation: number
  history: { week: number; valuation: number; cash: number; customers: number; profit: number }[]
  vibe: { crowd: number; mood: number; staff: number; shine: number } // 0..1 each, for the scene only
  done: boolean
}

export interface PublicOption {
  key: 'A' | 'B' | 'C' | 'D'
  label: string
  detail: string
}

export interface PublicScenario {
  id: string
  title: string
  story: string[]
  weeks: number
  options: PublicOption[]
}

export interface Outcome {
  key: 'A' | 'B' | 'C' | 'D'
  label: string
  weeks: number
  story: string[]
  before: PublicState
  after: PublicState
  bailout: boolean // the bank stepped in during this period
}

export interface Briefing {
  card: BizCard
  story: string[]
  facts: { label: string; value: string }[]
  problem: string
}

export interface GameView {
  state: PublicState
  scenario: PublicScenario | null // null when finished
  briefing?: Briefing
  decisions?: { round: number; title: string; label: string; key: string }[]
}

export interface LeaderRow {
  rank: number
  name: string
  school: string
  business: BizId
  valuation: number
}

export const fmtLKR = (n: number, compact = true): string => {
  const sign = n < 0 ? '−' : ''
  const v = Math.abs(n)
  if (compact) {
    if (v >= 1_000_000_000) return `${sign}LKR ${(v / 1_000_000_000).toFixed(2)}B`
    if (v >= 1_000_000) return `${sign}LKR ${(v / 1_000_000).toFixed(v >= 100_000_000 ? 0 : v >= 10_000_000 ? 1 : 2)}M`
    if (v >= 10_000) return `${sign}LKR ${Math.round(v / 1000)}K`
  }
  return `${sign}LKR ${Math.round(v).toLocaleString('en-LK')}`
}
