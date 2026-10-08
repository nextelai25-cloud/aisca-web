import type { BizId } from '../types'
import type { Option, Scenario, Sim, Text, EffectFn } from '../engine'

/** Option helper: label, one-line trade-off, hidden effects, then the story beats shown afterwards. */
export const o = (label: Text, detail: Text, fx: EffectFn, ...story: string[]): Option => ({ label, detail, fx, story })

export const sc = (s: Scenario): Scenario => s

const NOUNS: Record<BizId, { team: string; place: string; guests: string; product: string; manager: string }> = {
  cafe: { team: 'baristas', place: 'café', guests: 'customers', product: 'coffee', manager: 'shift manager' },
  restaurant: { team: 'kitchen team', place: 'restaurant', guests: 'diners', product: 'food', manager: 'floor manager' },
  tech: { team: 'engineers', place: 'office', guests: 'clients', product: 'software', manager: 'delivery manager' },
  fashion: { team: 'store team', place: 'stores', guests: 'shoppers', product: 'collection', manager: 'store manager' },
  hotel: { team: 'hotel staff', place: 'hotel', guests: 'guests', product: 'rooms', manager: 'front office manager' },
}

export const n = (s: Sim) => NOUNS[s.biz]

/** LKR label for option details, e.g. k(600_000) → "LKR 600K". */
export const k = (v: number) =>
  v >= 1_000_000 ? `LKR ${(v / 1_000_000).toFixed(v % 1_000_000 ? 1 : 0)}M` : `LKR ${Math.round(v / 1000)}K`

/** Weekly revenue, rounded for display. */
export const rev = (s: Sim) => s.customers * s.price
