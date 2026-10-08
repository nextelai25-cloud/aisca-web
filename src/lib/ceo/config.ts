// CEO Challenge competition settings.

/** Set to false to close registrations and official games (demo and leaderboard stay up). */
export const CEO_OPEN = true

/** Optional closing time (ISO string, Sri Lanka time). After this, no new official games start. */
export const CEO_CLOSES_AT: string | null = null

export function ceoIsOpen(now = new Date()): boolean {
  if (!CEO_OPEN) return false
  if (CEO_CLOSES_AT && now > new Date(CEO_CLOSES_AT)) return false
  return true
}
