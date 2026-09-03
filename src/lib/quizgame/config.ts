// ── AISCA QuizGame — shared config (safe to import client & server) ──

// Host / presenter password gate for /quizgame/admin. Change as needed.
export const QUIZGAME_HOST_PASSWORD = 'aiscaquiz2026'
export const QUIZGAME_HOST_STORAGE = 'quizgame_host_key'
// Per-participant token stored on the phone for reconnection.
export const QUIZGAME_TOKEN_STORAGE = 'quizgame_token'

export type SessionState =
  | 'lobby'
  | 'countdown'
  | 'question_open'
  | 'question_closed'
  | 'reveal'
  | 'leaderboard'
  | 'podium'
  | 'finished'

// Colourful avatars assigned to participants (original set, not Mentimeter's).
export const AVATARS: { emoji: string; color: string }[] = [
  { emoji: '🦊', color: '#F97316' }, { emoji: '🐯', color: '#F59E0B' },
  { emoji: '🐼', color: '#64748B' }, { emoji: '🐧', color: '#0EA5E9' },
  { emoji: '🐙', color: '#EC4899' }, { emoji: '🦁', color: '#EAB308' },
  { emoji: '🐸', color: '#22C55E' }, { emoji: '🐵', color: '#A16207' },
  { emoji: '🦉', color: '#8B5CF6' }, { emoji: '🐺', color: '#475569' },
  { emoji: '🐨', color: '#94A3B8' }, { emoji: '🐷', color: '#F472B6' },
  { emoji: '🐢', color: '#10B981' }, { emoji: '🦄', color: '#D946EF' },
  { emoji: '🐝', color: '#FACC15' }, { emoji: '🦋', color: '#38BDF8' },
  { emoji: '🐬', color: '#06B6D4' }, { emoji: '🦕', color: '#84CC16' },
  { emoji: '🐳', color: '#3B82F6' }, { emoji: '🦖', color: '#EF4444' },
  { emoji: '🦩', color: '#FB7185' }, { emoji: '🦜', color: '#14B8A6' },
  { emoji: '🐙', color: '#7C3AED' }, { emoji: '🐹', color: '#F59E0B' },
]

export function randomAvatarIndex(): number {
  return Math.floor(Math.random() * AVATARS.length)
}

// Answer-card colours on the participant / presenter screens (by option index).
// Electric "tech" palette to match the game-show theme (blue-led, still distinct).
export const OPTION_COLORS = ['#3B82F6', '#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899']
export const OPTION_SHAPES = ['▲', '◆', '●', '■', '★', '⬢']
// Answer options are identified by letter chips (A/B/C/D…) in the new theme.
export const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

// ── Server-authoritative speed scoring ──
// Correct answers earn between maxPoints/2 and maxPoints based on speed.
export function computePoints(
  correct: boolean,
  responseMs: number,
  timeLimitSec: number,
  maxPoints: number
): number {
  if (!correct) return 0
  const total = Math.max(1, timeLimitSec * 1000)
  const remaining = Math.max(0, total - responseMs)
  const earned = maxPoints * 0.5 + maxPoints * 0.5 * (remaining / total)
  return Math.round(Math.min(maxPoints, Math.max(maxPoints * 0.5, earned)))
}

export function realtimeChannel(code: string): string {
  return `quizgame:${code}`
}
