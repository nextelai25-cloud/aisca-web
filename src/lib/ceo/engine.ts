// CEO Challenge simulation engine. SERVER ONLY — never import from a client component,
// or the hidden effects of every option would ship in the browser bundle.
//
// The game is fully deterministic: (business, seed, choices[]) always replays to the
// same state. The server stores only the seed and the choices, and recomputes everything.

import type { BizId, PublicState, PublicScenario, Outcome, Briefing, GameView } from './types'
import { TOTAL_ROUNDS } from './types'
import { CARDS } from './cards'
import { START, BRIEFINGS } from './businesses'
import { SCENARIOS } from './scenarios'

export interface Sim {
  biz: BizId
  seed: number
  rounds: number // total decisions in this game
  round: number // decisions made
  week: number
  cash: number
  debt: number
  assets: number
  customers: number
  startCustomers: number
  capacity: number
  market: number
  refPrice: number
  elasticity: number
  price: number
  unitCost: number
  fixed: number
  brand: number
  quality: number
  morale: number
  efficiency: number
  boost: number
  flags: string[]
  used: string[]
  profitLog: number[]
  history: PublicState['history']
  bailouts: number
}

export interface Effect {
  cash?: number // one-off LKR (negative = spend)
  cashW?: number // one-off, in weeks of current revenue (negative = spend)
  debt?: number
  assets?: number
  price?: number // multiplier
  margin?: number // +0.03 = unit cost falls by 3% of current price
  fixed?: number // add LKR per week
  fixedPct?: number // multiply weekly fixed costs
  capacity?: number // multiplier
  market?: number // multiplier, permanent
  boost?: number // temporary demand bump, fades ~15% a week
  customers?: number // immediate multiplier
  brand?: number
  quality?: number
  morale?: number
  efficiency?: number
  set?: string[]
  clear?: string[]
}

export type EffectFn = Effect | ((s: Sim) => Effect)
export type Text = string | ((s: Sim) => string)
export type Texts = string[] | ((s: Sim) => string[])

export interface Option {
  label: Text
  detail: Text
  fx: EffectFn
  story: Texts
}

export interface Scenario {
  id: string
  biz: BizId | 'any'
  rounds?: [number, number]
  weeks: number
  needs?: string[]
  not?: string[]
  when?: (s: Sim) => boolean
  weight?: number
  title: Text
  story: Texts
  options: [Option, Option, Option, Option]
}

const KEYS = ['A', 'B', 'C', 'D'] as const

// Calibrated by simulation so all five businesses compete on one leaderboard.
const INDUSTRY: Record<BizId, number> = { cafe: 1.2, restaurant: 1.0, tech: 0.95, fashion: 0.78, hotel: 0.64 }
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
const txt = (t: Text, s: Sim) => (typeof t === 'function' ? t(s) : t)
const txts = (t: Texts, s: Sim) => (typeof t === 'function' ? t(s) : t)

// FNV-1a — deterministic tie-breaker so two players with the same choices can still
// meet scenarios in a different order (seeded per run).
function hash(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0) / 4294967296
}

export function newSim(biz: BizId, seed: number, rounds = TOTAL_ROUNDS): Sim {
  const { margin, ...b } = START[biz]
  const s: Sim = {
    biz,
    seed,
    rounds,
    round: 0,
    week: 0,
    ...b,
    unitCost: b.price * (1 - margin),
    startCustomers: b.customers,
    boost: 0,
    flags: [],
    used: [],
    profitLog: [],
    history: [],
    bailouts: 0,
  }
  s.history.push(point(s))
  return s
}

// ── Economics ──────────────────────────────────────────────

// Variable cost of serving one customer, improved by operational efficiency.
function effUnitCost(s: Sim) {
  return s.unitCost * (1 - (s.efficiency - 50) / 250)
}

// Diminishing returns: each new market you open adds less than the one before.
function effMarket(s: Sim) {
  const base = START[s.biz].market
  const m = s.market / base
  return base * (m <= 1 ? m : 1 + 0.55 * Math.log(m))
}

function targetCustomers(s: Sim) {
  const qEff = s.quality * 0.7 + s.morale * 0.3
  const attract = (0.25 + (0.75 * s.brand) / 100) * (0.35 + (0.65 * qEff) / 100)
  const priceF = Math.pow(s.refPrice / s.price, s.elasticity)
  return Math.min(s.capacity, effMarket(s) * attract * priceF * (1 + s.boost))
}

export function weeklyRevenue(s: Sim) {
  return s.customers * s.price
}

export function weeklyProfit(s: Sim) {
  return s.customers * (s.price - effUnitCost(s)) - s.fixed - s.debt * 0.0027
}

function simulateWeek(s: Sim): boolean {
  s.customers += (targetCustomers(s) - s.customers) * 0.35
  const profit = weeklyProfit(s)
  s.cash += profit
  s.profitLog.push(profit)

  // Drift: attention fades, people tire, quality follows the team.
  s.boost *= 0.85
  s.brand += (45 - s.brand) * 0.012
  s.morale += (55 - s.morale) * 0.02
  if (profit < 0) s.morale -= 0.5
  if (s.customers > s.capacity * 0.92) {
    s.morale -= 0.8
    s.quality -= 0.4
  }
  s.quality += (s.morale - s.quality) * 0.01
  s.brand = clamp(s.brand, 0, 100)
  s.morale = clamp(s.morale, 0, 100)
  s.quality = clamp(s.quality, 0, 100)
  s.efficiency = clamp(s.efficiency, 0, 100)
  s.week += 1

  // Nobody gets knocked out: if cash runs dry, the bank steps in — expensively.
  if (s.cash < 0) {
    s.debt += -s.cash * 1.15
    s.cash = 0
    s.bailouts += 1
    if (!s.flags.includes('bailout')) s.flags.push('bailout')
    s.morale = clamp(s.morale - 4, 0, 100)
    return true
  }
  return false
}

export function valuation(s: Sim): number {
  const recent = s.profitLog.slice(-4)
  const avgProfit = recent.length ? recent.reduce((a, b) => a + b, 0) / recent.length : weeklyProfit(s)
  const annualProfit = avgProfit * 52
  const annualRevenue = weeklyRevenue(s) * 52
  const growth = s.customers / s.startCustomers
  const multiple = clamp(2 + s.brand / 30 + (growth - 1) * 1.5 + (s.quality - 50) / 40, 1.5, 7)
  const enterprise =
    annualProfit > 0
      ? annualProfit * multiple + annualRevenue * 0.1
      : Math.max(annualRevenue * 0.15 + annualProfit, annualRevenue * 0.05)
  // Industry multiple: investors value some industries' profits more than others.
  return Math.round(enterprise * INDUSTRY[s.biz] + s.cash + s.assets - s.debt)
}

function point(s: Sim) {
  return {
    week: s.week,
    valuation: valuation(s),
    cash: Math.round(s.cash),
    customers: Math.round(s.customers),
    profit: Math.round(weeklyProfit(s)),
  }
}

// ── Effects ────────────────────────────────────────────────

function applyEffect(s: Sim, fx: Effect) {
  if (fx.cash) s.cash += fx.cash
  if (fx.cashW) s.cash += fx.cashW * weeklyRevenue(s)
  if (fx.debt) s.debt = Math.max(0, s.debt + fx.debt)
  // Negative assets represent outside investors' share: new investment adds cash,
  // but only what you build with it raises your score.
  if (fx.assets) s.assets += fx.assets
  if (fx.price) s.price = Math.round(s.price * fx.price)
  // margin +0.03 = serving each customer costs 3% of the current price less
  if (fx.margin) s.unitCost = Math.max(s.price * 0.08, s.unitCost - fx.margin * s.price)
  if (fx.fixed) s.fixed = Math.max(0, s.fixed + fx.fixed)
  if (fx.fixedPct) s.fixed = Math.max(0, s.fixed * fx.fixedPct)
  if (fx.capacity) s.capacity = s.capacity * fx.capacity
  if (fx.market) s.market = s.market * fx.market
  if (fx.boost) s.boost = Math.max(-0.6, s.boost + fx.boost)
  if (fx.customers) s.customers = Math.min(s.capacity, s.customers * fx.customers)
  if (fx.brand) s.brand = clamp(s.brand + fx.brand, 0, 100)
  if (fx.quality) s.quality = clamp(s.quality + fx.quality, 0, 100)
  if (fx.morale) s.morale = clamp(s.morale + fx.morale, 0, 100)
  if (fx.efficiency) s.efficiency = clamp(s.efficiency + fx.efficiency, 0, 100)
  for (const f of fx.set || []) if (!s.flags.includes(f)) s.flags.push(f)
  if (fx.clear) s.flags = s.flags.filter(f => !fx.clear!.includes(f))
}

// ── Scenario selection ─────────────────────────────────────

function eligible(s: Sim, sc: Scenario, strictRounds: boolean) {
  const r = s.round + 1
  if (sc.biz !== 'any' && sc.biz !== s.biz) return false
  if (s.used.includes(sc.id)) return false
  if (sc.rounds) {
    const [lo, hi] = sc.rounds
    // Final-round scenarios are only ever shown in the last round.
    const lastOnly = lo >= TOTAL_ROUNDS
    if (lastOnly && r !== s.rounds) return false
    if (!lastOnly && strictRounds && (r < lo || r > hi)) return false
  }
  if (sc.needs && !sc.needs.every(f => s.flags.includes(f))) return false
  if (sc.not && sc.not.some(f => s.flags.includes(f))) return false
  if (sc.when && !sc.when(s)) return false
  return true
}

export function pickScenario(s: Sim): Scenario | null {
  if (s.round >= s.rounds) return null
  let pool = SCENARIOS.filter(sc => eligible(s, sc, true))
  if (!pool.length) pool = SCENARIOS.filter(sc => eligible(s, sc, false))
  if (!pool.length) return null
  const r = s.round + 1
  let best: Scenario | null = null
  let bestScore = -1
  for (const sc of pool) {
    const isFinal = sc.rounds && sc.rounds[0] >= TOTAL_ROUNDS
    const score =
      (isFinal ? 1000 : 1) *
      (sc.weight ?? 1) *
      (sc.needs?.length ? 3 : 1) *
      (sc.biz === 'any' ? 0.75 : 1) *
      (0.35 + hash(`${s.seed}:${sc.id}:${r}`))
    if (score > bestScore) {
      bestScore = score
      best = sc
    }
  }
  return best
}

// ── Public views ───────────────────────────────────────────

export function publicState(s: Sim): PublicState {
  const v = valuation(s)
  return {
    business: s.biz,
    round: s.round,
    totalRounds: s.rounds,
    week: s.week,
    cash: Math.round(s.cash),
    debt: Math.round(s.debt),
    revenue: Math.round(weeklyRevenue(s)),
    profit: Math.round(weeklyProfit(s)),
    customers: Math.round(s.customers),
    capacity: Math.round(s.capacity),
    price: Math.round(s.price),
    valuation: v,
    history: s.history,
    vibe: {
      crowd: clamp(s.customers / s.capacity, 0, 1),
      mood: clamp((s.brand * 0.5 + s.quality * 0.5) / 100, 0, 1),
      staff: clamp(s.morale / 100, 0, 1),
      // Weather: grey and rainy while losing money, sunny once value and profit climb.
      shine: clamp(0.3 + Math.log10(Math.max(v, 1) / Math.max(s.history[0]?.valuation || 1, 1)) * 0.6 + (weeklyProfit(s) > 0 ? 0.12 : -0.04), 0, 1),
    },
    done: s.round >= s.rounds,
  }
}

export function publicScenario(s: Sim, sc: Scenario): PublicScenario {
  return {
    id: sc.id,
    title: txt(sc.title, s),
    story: txts(sc.story, s),
    weeks: sc.weeks,
    options: sc.options.map((o, i) => ({ key: KEYS[i], label: txt(o.label, s), detail: txt(o.detail, s) })),
  }
}

// ── Play ───────────────────────────────────────────────────

export function decide(s: Sim, choice: number): { outcome: Outcome; scenario: Scenario; title: string } {
  const sc = pickScenario(s)
  if (!sc) throw new Error('Game over')
  if (!(choice >= 0 && choice < 4)) throw new Error('Bad choice')
  const before = publicState(s)
  const title = txt(sc.title, s)
  const opt = sc.options[choice]
  const fx = typeof opt.fx === 'function' ? opt.fx(s) : opt.fx
  const story = txts(opt.story, s) // written against the state at decision time
  const label = txt(opt.label, s)
  applyEffect(s, fx)
  s.used.push(sc.id)
  let bailout = false
  for (let w = 0; w < sc.weeks; w++) if (simulateWeek(s)) bailout = true
  s.round += 1
  s.history.push(point(s))
  return {
    scenario: sc,
    title,
    outcome: { key: KEYS[choice], label, weeks: sc.weeks, story, before, after: publicState(s), bailout },
  }
}

/** Rebuild a game from its seed and choices. */
export function replay(biz: BizId, seed: number, choices: number[], rounds = TOTAL_ROUNDS) {
  const s = newSim(biz, seed, rounds)
  const decisions: { round: number; title: string; label: string; key: string }[] = []
  let last: Outcome | null = null
  for (const c of choices) {
    if (s.round >= s.rounds) break
    const { outcome, title } = decide(s, c)
    decisions.push({ round: s.round, title, label: outcome.label, key: outcome.key })
    last = outcome
  }
  return { sim: s, decisions, last }
}

export function briefing(biz: BizId): Briefing {
  const s = newSim(biz, 0)
  const b = BRIEFINGS[biz]
  const fmt = (n: number) => `${n < 0 ? '−' : ''}LKR ${Math.abs(Math.round(n)).toLocaleString('en-LK')}`
  const card = CARDS[biz]
  return {
    card,
    story: b.story,
    problem: b.problem,
    facts: [
      { label: 'Cash in the bank', value: fmt(s.cash) },
      { label: 'Bank loan', value: fmt(s.debt) },
      { label: `${cap(card.unit)} ${card.unitPer}`, value: Math.round(s.customers).toLocaleString('en-LK') },
      { label: b.priceLabel, value: fmt(s.price) },
      { label: 'Weekly revenue', value: fmt(weeklyRevenue(s)) },
      { label: 'Weekly running costs', value: fmt(s.fixed) },
      { label: 'Weekly profit', value: fmt(weeklyProfit(s)) },
      { label: 'Company value today', value: fmt(valuation(s)) },
    ],
  }
}

const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

export function view(biz: BizId, seed: number, choices: number[], rounds = TOTAL_ROUNDS, withBriefing = false): GameView {
  const { sim, decisions } = replay(biz, seed, choices, rounds)
  const sc = pickScenario(sim)
  return {
    state: publicState(sim),
    scenario: sc ? publicScenario(sim, sc) : null,
    decisions,
    ...(withBriefing ? { briefing: briefing(biz) } : {}),
  }
}
