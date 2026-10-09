/**
 * RANGEELA '26 shared config. Safe to import on the client and the server.
 * Change event details here and the page, emails and API all follow.
 */
export const RANGEELA = {
  name: "RANGEELA '26",
  tagline: 'A Celebration of Hues',
  dateLabel: 'Saturday, 17th October 2026',
  dateShort: '17th October',
  timeLabel: '2.00 PM onwards',
  venue: 'Nawinna Grounds, Maharagama',
  venueArea: 'Maharagama',
  price: 1200,          // standard online price (after early bird)
  // Online ticket sales close at this moment (Sri Lanka time).
  salesCloseISO: '2026-10-17T12:00:00+05:30',
  whatsappGroup: 'https://chat.whatsapp.com/HklcPlrIl3P6tKJsWDbxu8',
  helpWhatsapp: '94778132137',
  helpWhatsappLabel: '077 813 2137',
} as const

export const RANGEELA_BANK = {
  account: '328200180054659',
  name: 'TBT JAYALATH ARACHCHIGE',
  bank: "PEOPLE'S BANK",
  branch: 'KOTTAWA',
} as const

// ── Ticket pricing ──
// Early bird runs until the end of 9 October (midnight, Sri Lanka time).
// From 10 October until the event the online price is LKR 1,200.
// Tickets bought at the gate on the day are LKR 1,500.
export const PRICING = {
  earlyBird: 1000,
  standard: 1200,
  gate: 1500,
  earlyBirdEndsISO: '2026-10-10T00:00:00+05:30',
  earlyBirdEndsLabel: '9th October, midnight',
  eventStartISO: '2026-10-17T14:00:00+05:30',
} as const

export function isEarlyBird(now = Date.now()): boolean {
  return now < Date.parse(PRICING.earlyBirdEndsISO)
}

/** The online ticket price right now. */
export function currentPrice(now = Date.now()): number {
  return isEarlyBird(now) ? PRICING.earlyBird : PRICING.standard
}

export function priceTier(now = Date.now()): 'early_bird' | 'standard' {
  return isEarlyBird(now) ? 'early_bird' : 'standard'
}

/** Turns any Sri Lankan mobile format into 07XXXXXXXX, or null. Tickets go out by SMS, so this must be a mobile. */
export function toLocalMobile(raw: string): string | null {
  let d = String(raw || '').replace(/\D/g, '')
  if (d.startsWith('0094')) d = d.slice(2)
  if (d.length === 11 && d.startsWith('94')) d = '0' + d.slice(2)
  if (d.length === 9 && d.startsWith('7')) d = '0' + d
  return /^07\d{8}$/.test(d) ? d : null
}

export const AL_BATCHES = ['2025', '2026', '2027', '2028', 'Other'] as const

export function salesOpen(now = Date.now()): boolean {
  return now < Date.parse(RANGEELA.salesCloseISO)
}

/** Letters and digits only, uppercased. Used for duplicate checks. */
export function normaliseId(v: string): string {
  return v.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/** Sri Lankan NIC: old format 9 digits + V/X, new format 12 digits. */
export function looksLikeNic(v: string): boolean {
  const n = normaliseId(v)
  return /^\d{9}[VX]$/.test(n) || /^\d{12}$/.test(n)
}
