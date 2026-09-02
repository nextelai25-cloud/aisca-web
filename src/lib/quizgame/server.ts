import { supabaseAdmin } from '@/lib/supabase'
import { getQuiz } from '@/data/quizgame/acca-quiz'
import type { SessionState } from './config'

export interface SessionRow {
  id: number
  join_code: string
  quiz_id: string
  host_token: string
  state: SessionState
  current_index: number
  question_started_at: string | null
  question_ends_at: string | null
  settings: Record<string, unknown>
  ended: boolean
}

const REVEALED = new Set<SessionState>(['reveal', 'leaderboard', 'podium', 'finished'])
const SHOW_LB = new Set<SessionState>(['leaderboard', 'podium', 'finished'])

export function cleanCode(code: unknown): string {
  return String(code || '').replace(/\D/g, '')
}
export function genCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}
export function genToken(): string {
  return (
    Math.random().toString(36).slice(2, 12) +
    Math.random().toString(36).slice(2, 12) +
    Date.now().toString(36)
  )
}

export async function loadSessionByCode(code: string): Promise<SessionRow | null> {
  const clean = cleanCode(code)
  if (clean.length !== 6) return null
  const { data } = await supabaseAdmin
    .from('quiz_sessions').select('*')
    .eq('join_code', clean).eq('ended', false)
    .order('created_at', { ascending: false }).limit(1).maybeSingle()
  return (data as SessionRow) || null
}

export async function loadSessionByHost(hostToken: string): Promise<SessionRow | null> {
  if (!hostToken) return null
  const { data } = await supabaseAdmin
    .from('quiz_sessions').select('*')
    .eq('host_token', hostToken).eq('ended', false).maybeSingle()
  return (data as SessionRow) || null
}

/** The single public "state view" that both the host and phones render from. */
export async function computeView(session: SessionRow, role: 'host' | 'player', token: string | null) {
  const quiz = getQuiz(session.quiz_id)
  const total = quiz?.questions.length ?? 0
  const idx = session.current_index
  const question = quiz && idx >= 0 && idx < total ? quiz.questions[idx] : null
  const revealed = REVEALED.has(session.state)
  const now = Date.now()

  // Participants (never expose tokens)
  const { data: pData } = await supabaseAdmin
    .from('quiz_participants')
    .select('id, nickname, avatar_index, score')
    .eq('session_id', session.id).eq('kicked', false)
  const parts = (pData || []) as { id: number; nickname: string; avatar_index: number; score: number }[]
  const participantCount = parts.length

  const ranked = [...parts].sort((a, b) => Number(b.score) - Number(a.score) || a.id - b.id)
  const rankMap = new Map<number, number>()
  ranked.forEach((p, i) => rankMap.set(p.id, i + 1))

  // Answers for the current question (only when needed)
  let answeredCount = 0
  let results: { choiceIndex: number; count: number }[] | null = null
  let correctCount: number | null = null
  const needAnswers = question && (role === 'host' || revealed)
  if (needAnswers) {
    const { data: aData } = await supabaseAdmin
      .from('quiz_answers')
      .select('choice_index, is_correct')
      .eq('session_id', session.id).eq('question_index', idx)
    const ans = (aData || []) as { choice_index: number | null; is_correct: boolean }[]
    answeredCount = ans.length
    if (revealed && question) {
      const counts = new Array(question.options.length).fill(0)
      let cc = 0
      for (const r of ans) {
        if (r.choice_index != null && r.choice_index >= 0 && r.choice_index < counts.length) counts[r.choice_index]++
        if (r.is_correct) cc++
      }
      results = counts.map((count, choiceIndex) => ({ choiceIndex, count }))
      correctCount = cc
    }
  }

  // Player "you" block
  let you: Record<string, unknown> | null = null
  if (role === 'player' && token) {
    const { data: meRow } = await supabaseAdmin
      .from('quiz_participants')
      .select('id, nickname, avatar_index, score, kicked')
      .eq('token', token).eq('session_id', session.id).maybeSingle()
    if (meRow) {
      const me = meRow as { id: number; nickname: string; avatar_index: number; score: number; kicked: boolean }
      const { data: myAns } = await supabaseAdmin
        .from('quiz_answers')
        .select('question_index, choice_index, is_correct, points')
        .eq('session_id', session.id).eq('participant_id', me.id)
        .order('question_index', { ascending: true })
      const mine = (myAns || []) as { question_index: number; choice_index: number | null; is_correct: boolean; points: number }[]
      const current = mine.find((m) => m.question_index === idx)
      // streak = trailing consecutive correct answers up to current index
      let streak = 0
      for (let i = idx; i >= 0; i--) {
        const a = mine.find((m) => m.question_index === i)
        if (a && a.is_correct) streak++
        else break
      }
      you = {
        participantId: me.id,
        nickname: me.nickname,
        avatarIndex: me.avatar_index,
        score: Number(me.score),
        rank: rankMap.get(me.id) ?? null,
        kicked: me.kicked,
        answeredChoice: current ? current.choice_index : null,
        lastPoints: revealed && current ? Number(current.points) : null,
        lastCorrect: revealed && current ? current.is_correct : null,
        streak: revealed ? streak : null,
      }
    }
  }

  return {
    state: session.state,
    index: idx,
    total,
    quizTitle: quiz?.title ?? '',
    serverNow: now,
    questionStartedAt: session.question_started_at,
    questionEndsAt: session.question_ends_at,
    participantCount,
    answeredCount: role === 'host' || revealed ? answeredCount : null,
    question: question
      ? {
          title: question.title,
          description: question.description ?? null,
          image: question.image ?? null,
          options: question.options,
          timeLimit: question.timeLimit,
          points: question.points,
        }
      : null,
    correctIndex: role === 'host' || revealed ? question?.correctIndex ?? null : null,
    explanation: revealed ? question?.explanation ?? null : null,
    results,
    correctCount,
    leaderboard: SHOW_LB.has(session.state)
      ? ranked.slice(0, 10).map((p) => ({
          participantId: p.id, nickname: p.nickname, avatarIndex: p.avatar_index,
          score: Number(p.score), rank: rankMap.get(p.id) ?? 0,
        }))
      : null,
    // Host lobby shows joined avatars (public info; capped for the screen).
    participants: role === 'host' && session.state === 'lobby'
      ? parts.slice(0, 150).map((p) => ({ participantId: p.id, nickname: p.nickname, avatarIndex: p.avatar_index }))
      : null,
    you,
  }
}
