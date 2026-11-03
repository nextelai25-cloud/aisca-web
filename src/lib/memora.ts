/**
 * MEMORA '26 shared config. Safe to import on the client and the server.
 * Change event details here and the page, emails and API all follow.
 * Keep in step with aisca-admin/lib/memora-server.ts and lib/memora-email.ts.
 */
export { normaliseId, looksLikeNic, toLocalMobile } from './rangeela'

export const MEMORA = {
  name: "MEMORA '26",
  tagline: 'A Day to Remember',
  dateLabel: 'Sunday, 15th November 2026',
  dateShort: '15th November',
  dayName: 'Sunday',
  timeLabel: '4.00 PM onwards',
  venue: 'Rock House, Piliyandala',
  price: 3500,
  // Online ticket sales close at this moment (Sri Lanka time).
  salesCloseISO: '2026-11-15T12:00:00+05:30',
  eventStartISO: '2026-11-15T16:00:00+05:30',
  // Leave empty until there is a group link; the page hides the button.
  whatsappGroup: '',
  helpContacts: [
    { name: 'Ravinu', whatsapp: '94740558725', label: '074 055 8725' },
    { name: 'Dahamsa', whatsapp: '94769753858', label: '076 975 3858' },
  ],
  helpWhatsapp: '94740558725',
  helpWhatsappLabel: 'Ravinu (074 055 8725) or Dahamsa (076 975 3858)',
} as const

export const MEMORA_BANK = {
  account: '1019 5518 9611',
  name: 'A S THEWMIKA',
  bank: 'SAMPATH BANK PLC',
  branch: 'PILIYANDALA',
} as const

export const MEMORA_AL_BATCHES = ['2025', '2026', '2027', '2028', 'Other'] as const

export function memoraSalesOpen(now = Date.now()): boolean {
  return now < Date.parse(MEMORA.salesCloseISO)
}

export const lkr = (n: number) => `LKR ${n.toLocaleString('en-US')}`
