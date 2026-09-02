import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { AVATARS } from '@/lib/quizgame/config'
import { loadSessionByCode, genToken } from '@/lib/quizgame/server'

// POST /api/quizgame/join  { code, nickname, avatarIndex, token? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const session = await loadSessionByCode(body.code)
    if (!session) return NextResponse.json({ error: 'Session not found. Check the code.' }, { status: 404 })
    if (session.ended) return NextResponse.json({ error: 'This quiz has ended.' }, { status: 400 })

    // Reconnect path: a valid existing token just refreshes presence.
    if (typeof body.token === 'string' && body.token) {
      const { data: existing } = await supabaseAdmin
        .from('quiz_participants')
        .select('id, nickname, avatar_index, kicked')
        .eq('token', body.token).eq('session_id', session.id).maybeSingle()
      if (existing) {
        const e = existing as { id: number; nickname: string; avatar_index: number; kicked: boolean }
        if (e.kicked) return NextResponse.json({ error: 'You have been removed from this quiz.' }, { status: 403 })
        await supabaseAdmin.from('quiz_participants').update({ last_seen: new Date().toISOString() }).eq('id', e.id)
        return NextResponse.json({ token: body.token, participantId: e.id, nickname: e.nickname, avatarIndex: e.avatar_index, reconnected: true })
      }
    }

    const nickname = String(body.nickname ?? '').trim().slice(0, 24)
    if (!nickname) return NextResponse.json({ error: 'Please enter a nickname.' }, { status: 400 })
    let avatarIndex = Number(body.avatarIndex)
    if (!Number.isInteger(avatarIndex) || avatarIndex < 0 || avatarIndex >= AVATARS.length) {
      avatarIndex = Math.floor(Math.random() * AVATARS.length)
    }

    const token = genToken()
    const { data, error } = await supabaseAdmin
      .from('quiz_participants')
      .insert([{ session_id: session.id, token, nickname, avatar_index: avatarIndex }])
      .select('id')
      .single()
    if (error || !data) {
      console.error('[quizgame/join] insert error:', error?.message)
      return NextResponse.json({ error: 'Could not join. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ token, participantId: (data as { id: number }).id, nickname, avatarIndex })
  } catch (err) {
    console.error('[quizgame/join] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
