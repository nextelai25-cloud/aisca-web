'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { subscribeQuiz } from '@/lib/quizgame/realtime-client'

export interface QuizView {
  state: string
  index: number
  total: number
  quizTitle: string
  serverNow: number
  questionStartedAt: string | null
  questionEndsAt: string | null
  participantCount: number
  answeredCount: number | null
  question: { title: string; description: string | null; image: string | null; options: string[]; timeLimit: number; points: number } | null
  correctIndex: number | null
  explanation: string | null
  results: { choiceIndex: number; count: number }[] | null
  correctCount: number | null
  fastest: { nickname: string; avatarIndex: number; responseMs: number } | null
  leaderboard: { participantId: number; nickname: string; avatarIndex: number; score: number; rank: number }[] | null
  participants: { participantId: number; nickname: string; avatarIndex: number }[] | null
  you: {
    participantId: number; nickname: string; avatarIndex: number; score: number; rank: number | null; kicked: boolean
    answeredChoice: number | null; lastPoints: number | null; lastCorrect: boolean | null; streak: number | null
  } | null
  _fetchedAt?: number
  error?: string
}

interface Params {
  role: 'host' | 'player'
  code?: string
  token?: string
  hostToken?: string
  active: boolean
  pollMs?: number
}

export function useSession(params: Params) {
  const { role, code, token, hostToken, active } = params
  const [view, setView] = useState<QuizView | null>(null)
  const [notFound, setNotFound] = useState(false)
  const busy = useRef(false)

  const fetchState = useCallback(async () => {
    if (!active || busy.current) return
    busy.current = true
    try {
      const qs = new URLSearchParams()
      qs.set('role', role)
      if (role === 'host') qs.set('token', hostToken || '')
      else { qs.set('code', code || ''); if (token) qs.set('token', token) }
      const res = await fetch(`/api/quizgame/state?${qs.toString()}`, { cache: 'no-store' })
      if (res.status === 404) { setNotFound(true); return }
      if (!res.ok) return
      const data = (await res.json()) as QuizView
      data._fetchedAt = Date.now()
      setNotFound(false)
      setView(data)
    } catch {
      // keep last view; the poll will retry
    } finally {
      busy.current = false
    }
  }, [role, code, token, hostToken, active])

  useEffect(() => {
    if (!active) return
    fetchState()
    const pollMs = params.pollMs ?? (role === 'host' ? 1200 : 2500)
    const iv = setInterval(fetchState, pollMs)
    const unsub = code ? subscribeQuiz(code, () => fetchState()) : () => {}
    return () => { clearInterval(iv); unsub() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, code, fetchState])

  return { view, notFound, refetch: fetchState }
}

// Server-authoritative remaining time (ms) using the offset captured at fetch.
export function remainingMs(view: QuizView | null): number {
  if (!view || !view.questionEndsAt || !view.serverNow || !view._fetchedAt) return 0
  const endsAt = Date.parse(view.questionEndsAt)
  const elapsedSinceFetch = Date.now() - view._fetchedAt
  return Math.max(0, endsAt - view.serverNow - elapsedSinceFetch)
}
