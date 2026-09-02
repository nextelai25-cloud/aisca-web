import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getQuiz } from '@/data/quizgame/acca-quiz'
import { loadSessionByHost, computeView } from '@/lib/quizgame/server'
import { broadcastSync } from '@/lib/quizgame/broadcast'
import type { SessionState } from '@/lib/quizgame/config'

// POST /api/quizgame/host  { hostToken, action, participantId? }
// Drives the server-authoritative state machine. Phones only render state.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const session = await loadSessionByHost(body.hostToken || '')
    if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 })

    const quiz = getQuiz(session.quiz_id)
    const total = quiz?.questions.length ?? 0
    const action = String(body.action || '')
    const update: Record<string, unknown> = {}

    switch (action) {
      case 'next': {
        const nextIndex = session.current_index + 1
        if (nextIndex < total) {
          update.current_index = nextIndex
          update.state = 'countdown' as SessionState
          update.question_started_at = null
          update.question_ends_at = null
        } else {
          update.state = 'podium' as SessionState
        }
        break
      }
      case 'prev': {
        update.current_index = Math.max(0, session.current_index - 1)
        update.state = 'countdown' as SessionState
        update.question_started_at = null
        update.question_ends_at = null
        break
      }
      case 'open': {
        const qq = quiz?.questions[session.current_index]
        if (!qq) return NextResponse.json({ error: 'No question to open.' }, { status: 400 })
        const now = Date.now()
        update.state = 'question_open' as SessionState
        update.question_started_at = new Date(now).toISOString()
        update.question_ends_at = new Date(now + qq.timeLimit * 1000).toISOString()
        break
      }
      case 'close': update.state = 'question_closed' as SessionState; break
      case 'reveal': update.state = 'reveal' as SessionState; break
      case 'show_leaderboard': update.state = 'leaderboard' as SessionState; break
      case 'podium': update.state = 'podium' as SessionState; break
      case 'finish': update.state = 'finished' as SessionState; update.ended = true; break
      case 'restart':
        update.current_index = -1
        update.state = 'lobby' as SessionState
        update.question_started_at = null
        update.question_ends_at = null
        await supabaseAdmin.from('quiz_answers').delete().eq('session_id', session.id)
        await supabaseAdmin.from('quiz_participants').update({ score: 0, streak: 0 }).eq('session_id', session.id)
        break
      case 'kick': {
        const pid = Number(body.participantId)
        if (Number.isInteger(pid)) {
          await supabaseAdmin.from('quiz_participants').update({ kicked: true }).eq('id', pid).eq('session_id', session.id)
        }
        break
      }
      default:
        return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
    }

    if (Object.keys(update).length) {
      const { error } = await supabaseAdmin.from('quiz_sessions').update(update).eq('id', session.id)
      if (error) {
        console.error('[quizgame/host] update error:', error.message)
        return NextResponse.json({ error: 'Could not update session.' }, { status: 500 })
      }
    }

    // Keep cumulative scores in sync (idempotent, single round-trip).
    const resultingIndex = (update.current_index as number | undefined) ?? session.current_index
    if (resultingIndex >= 0) {
      await supabaseAdmin.rpc('recompute_quiz_scores', { p_session: session.id, p_upto: resultingIndex })
    }

    // Push an instant state change to every phone in the room.
    await broadcastSync(session.join_code, 'sync', { action })

    const fresh = await loadSessionByHost(body.hostToken)
    return NextResponse.json(fresh ? await computeView(fresh, 'host', null) : { ok: true })
  } catch (err) {
    console.error('[quizgame/host] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
