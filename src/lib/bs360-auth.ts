/**
 * Shared gate password for the BS360 Quiz Grid (/bs360quizgrid).
 *
 * This is intentionally a single shared event password (not a per-user
 * login) — same pattern as a physical "door code" for a live event.
 * It is checked both client-side (to unlock the UI) and server-side
 * (so the /api/bs360/* routes can't be hit directly by someone who
 * never entered the password).
 */
export const BS360_PASSWORD = 'bs360aiscaweb';

export const BS360_STORAGE_KEY = 'bs360_quizgrid_key';

export function isValidBs360Key(value: unknown): boolean {
  return typeof value === 'string' && value === BS360_PASSWORD;
}
