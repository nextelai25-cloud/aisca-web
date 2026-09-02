import { NextRequest, NextResponse } from 'next/server'
import { loadSessionByCode, loadSessionByHost, computeView } from '@/lib/quizgame/server'

export const dynamic = 'force-dynamic'

// GET /api/quizgame/state?role=host&token=...            (host, by hostToken)
// GET /api/quizgame/state?role=player&code=...&token=... (phone, by code + token)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const role = searchParams.get('role') === 'host' ? 'host' : 'player'
    const token = searchParams.get('token')

    if (role === 'host') {
      const session = await loadSessionByHost(token || '')
      if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
      return NextResponse.json(await computeView(session, 'host', null))
    }

    const session = await loadSessionByCode(searchParams.get('code') || '')
    if (!session) return NextResponse.json({ error: 'Session not found.' }, { status: 404 })
    return NextResponse.json(await computeView(session, 'player', token))
  } catch (err) {
    console.error('[quizgame/state] error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
