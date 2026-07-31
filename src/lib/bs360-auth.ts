/**
 * BS360 Quiz Grid — access passwords.
 *
 * Each classroom has its OWN door code so knowing one classroom's password
 * never lets you into another. Pattern:
 *   Classroom 1 -> classroom#111
 *   Classroom 2 -> classroom#222
 *   ...
 *   Classroom 8 -> classroom#888
 *
 * The password is checked both client-side (to unlock the classroom UI) and
 * server-side on every /api/bs360/* call, so the API can't be hit directly by
 * someone who never entered that classroom's password. The public scoreboard
 * is the only page with no gate.
 */

export function classroomPassword(classroom: number): string {
  return `classroom#${String(classroom).repeat(3)}`;
}

/** localStorage key that stores the entered password for one classroom. */
export function classroomStorageKey(classroom: number): string {
  return `bs360_key_c${classroom}`;
}

export function isValidClassroomKey(classroom: unknown, value: unknown): boolean {
  const n = Number(classroom);
  if (!Number.isInteger(n) || n < 1 || n > 8) return false;
  return typeof value === 'string' && value === classroomPassword(n);
}

/** Every classroom storage key (used by "lock this device"). */
export function allClassroomStorageKeys(): string[] {
  return Array.from({ length: 8 }, (_, i) => classroomStorageKey(i + 1));
}
