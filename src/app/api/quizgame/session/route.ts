import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { QUIZGAME_HOST_PASSWORD } from '@/lib/quizgame/config'
import { getQuiz } from '@/data/quizgame/acca-quiz'
import { genCode, genToken } from '@/lib/quizgame/server'

// POST /api/quizgame/session  { password, quizId? }  → creates a live session
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.password !== QUIZGAME_HOST_PASSWORD) {
      return NextResponse.json({ error: 'Wrong host password.' }, { status: 401 })
    }
    const quizId = typeof body.quizId === 'string' && body.quizId ? body.quizId : 'acca-guidance'
    if (!getQuiz(quizId)) {
      return NextResponse.json({ error: 'Unknown quiz.' }, { status: 400 })
    }

    const hostToken = genToken()
    let created: { id: number; join_code: string } | null = null
    for (let attempt = 0; attempt < 8 && !created; attempt++) {
      const code = genCode()
      const { data, error } = await supabaseAdmin
        .from('quiz_sessions')
        .insert([{ join_code: code, quiz_id: quizId, host_token: hostToken, state: 'lobby', current_index: -1, settings: {} }])
        .select('id, join_code')
        .single()
      if (!error && data) { created = data as { id: number; join_code: string }; break }
      if (error && error.code !== '23505') {
        console.error('[quizgame/session] insert error:', error.message)
        return NextResponse.json({ error: 'Could not create session.' }, { status: 500 })
      }
    }
    if (!created) return NextResponse.json({ error: 'Could not allocate a join code. Try again.' }, { status: 500 })

    return NextResponse.json({ code: created.join_code, hostToken, quizId, sessionId: created.id })
  } catch (err) {
    console.error('[quizgame/session] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
