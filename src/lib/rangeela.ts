/**
 * RANGEELA '26 shared config. Safe to import on the client and the server.
 * Change event details here and the page, emails and API all follow.
 */
export const RANGEELA = {
  name: "RANGEELA '26",
  tagline: 'A Celebration of Hues',
  dateLabel: 'Saturday, 17th October 2026',
  dateShort: '17th October',
  timeLabel: '3.00 PM onwards',
  venue: 'Hyde Park Grounds',
  venueArea: 'Colombo',
  price: 1200,
  // Online ticket sales close at this moment (Sri Lanka time).
  salesCloseISO: '2026-10-17T12:00:00+05:30',
  whatsappGroup: 'https://chat.whatsapp.com/HklcPlrIl3P6tKJsWDbxu8',
  helpWhatsapp: '94778132137',
  helpWhatsappLabel: '077 813 2137',
} as const

export const RANGEELA_BANK = {
  account: '1069 6100 6902',
  name: 'ALL ISLAND SCHOOLS COMMERCE ASSOCIATION',
  bank: 'SAMPATH BANK',
  branch: 'HOMAGAMA',
} as const

export const AL_BATCHES = ['2026', '2027', '2028', '2029', 'Already finished A/Ls', 'Not a student'] as const

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
