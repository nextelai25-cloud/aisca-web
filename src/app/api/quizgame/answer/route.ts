import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getQuiz } from '@/data/quizgame/acca-quiz'
import { computePoints } from '@/lib/quizgame/config'
import type { SessionRow } from '@/lib/quizgame/server'

// POST /api/quizgame/answer  { token, questionIndex, choiceIndex }
// Server-authoritative: scoring uses the SERVER clock, and correctness is NEVER
// returned here (only revealed later via /state). Answers may change until the
// question closes.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token = String(body.token || '')
    const questionIndex = Number(body.questionIndex)
    const choiceIndex = Number(body.choiceIndex)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: pRow } = await supabaseAdmin
      .from('quiz_participants').select('id, session_id, kicked').eq('token', token).maybeSingle()
    if (!pRow) return NextResponse.json({ error: 'Not in this quiz.' }, { status: 404 })
    const p = pRow as { id: number; session_id: number; kicked: boolean }
    if (p.kicked) return NextResponse.json({ error: 'Removed from quiz.' }, { status: 403 })

    const { data: sRow } = await supabaseAdmin.from('quiz_sessions').select('*').eq('id', p.session_id).maybeSingle()
    if (!sRow) return NextResponse.json({ error: 'Session gone.' }, { status: 404 })
    const s = sRow as SessionRow

    if (s.state !== 'question_open' || s.current_index !== questionIndex) {
      return NextResponse.json({ error: 'Question is not open.' }, { status: 409 })
    }
    const now = Date.now()
    const endsAt = s.question_ends_at ? Date.parse(s.question_ends_at) : now
    if (now > endsAt + 750) return NextResponse.json({ error: "Time's up." }, { status: 409 })

    const qq = getQuiz(s.quiz_id)?.questions[questionIndex]
    if (!qq) return NextResponse.json({ error: 'Question not found.' }, { status: 400 })
    if (!Number.isInteger(choiceIndex) || choiceIndex < 0 || choiceIndex >= qq.options.length) {
      return NextResponse.json({ error: 'Invalid answer.' }, { status: 400 })
    }

    const startedAt = s.question_started_at ? Date.parse(s.question_started_at) : now
    const responseMs = Math.max(0, now - startedAt)
    const isCorrect = choiceIndex === qq.correctIndex
    const points = computePoints(isCorrect, responseMs, qq.timeLimit, qq.points)

    const { error } = await supabaseAdmin.from('quiz_answers').upsert(
      [{
        session_id: s.id, participant_id: p.id, question_index: questionIndex,
        choice_index: choiceIndex, is_correct: isCorrect, points, response_ms: responseMs,
        answered_at: new Date(now).toISOString(),
      }],
      { onConflict: 'session_id,participant_id,question_index' }
    )
    if (error) {
      console.error('[quizgame/answer] upsert error:', error.message)
      return NextResponse.json({ error: 'Could not record answer.' }, { status: 500 })
    }

    // Acknowledge only — do not leak correctness.
    return NextResponse.json({ ok: true, submitted: choiceIndex })
  } catch (err) {
    console.error('[quizgame/answer] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
