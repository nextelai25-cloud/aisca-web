'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OPTION_COLORS, OPTION_SHAPES, QUIZGAME_HOST_STORAGE } from '@/lib/quizgame/config'
import { useSession, remainingMs, type QuizView } from '../useSession'
import { Avatar, Confetti, CountdownOverlay, TimerBar, ResultBars, Leaderboard, Podium, makeSounds, BG, DISPLAY, type Sounds } from '../game-ui'

interface HostSession { hostToken: string; code: string }

export default function QuizHost() {
  const [sess, setSess] = useState<HostSession | null>(null)
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [muted, setMuted] = useState(false)
  const [showQR, setShowQR] = useState(true)
  const sounds = useRef<Sounds | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(QUIZGAME_HOST_STORAGE)
      if (raw) setSess(JSON.parse(raw))
    } catch {}
    sounds.current = makeSounds()
  }, [])
  useEffect(() => { sounds.current?.setMuted(muted) }, [muted])

  const { view, notFound, refetch } = useSession({ role: 'host', code: sess?.code, hostToken: sess?.hostToken, active: !!sess })

  useEffect(() => {
    if (notFound && sess) { localStorage.removeItem(QUIZGAME_HOST_STORAGE); setSess(null); setError('That session ended.') }
  }, [notFound, sess])

  async function createSession() {
    setCreating(true); setError('')
    try {
      const res = await fetch('/api/quizgame/session', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, quizId: 'acca-guidance' }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Could not start.'); return }
      const s = { hostToken: data.hostToken, code: data.code }
      localStorage.setItem(QUIZGAME_HOST_STORAGE, JSON.stringify(s))
      setSess(s)
    } catch { setError('Network error.') }
    finally { setCreating(false) }
  }

  const act = useCallback(async (action: string, extra: Record<string, unknown> = {}) => {
    if (!sess) return
    try {
      await fetch('/api/quizgame/host', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostToken: sess.hostToken, action, ...extra }),
      })
    } catch {}
    refetch()
  }, [sess, refetch])

  // Countdown → open (host-driven, once per question)
  const openedRef = useRef(-1)
  useEffect(() => {
    if (view?.state === 'countdown') openedRef.current = view.index
  }, [view?.state, view?.index])

  // Auto-lock answers when the timer runs out
  const closedRef = useRef(-1)
  useEffect(() => {
    if (!view || view.state !== 'question_open') return
    const iv = setInterval(() => {
      if (remainingMs(view) <= 0 && closedRef.current !== view.index) {
        closedRef.current = view.index
        act('close')
      }
    }, 200)
    return () => clearInterval(iv)
  }, [view, act])

  const primary = (v: QuizView | null): { action: string; label: string } | null => {
    if (!v) return null
    switch (v.state) {
      case 'lobby': return { action: 'next', label: '▶ Start Quiz' }
      case 'question_open':
      case 'question_closed': return { action: 'reveal', label: 'Reveal Answer' }
      case 'reveal': return { action: 'show_leaderboard', label: 'Show Leaderboard' }
      case 'leaderboard': return { action: 'next', label: v.index + 1 >= v.total ? '🏆 Final Results' : 'Next Question →' }
      default: return null
    }
  }
  const doPrimary = useCallback(() => { const p = primary(view); if (p) act(p.action) }, [view, act])

  const toggleFullscreen = () => {
    const el = document.documentElement as HTMLElement & { requestFullscreen?: () => void }
    if (!document.fullscreenElement) el.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

  // Keyboard shortcuts
  useEffect(() => {
    if (!sess) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); doPrimary() }
      else if (e.key === 'ArrowLeft') act('prev')
      else if (e.key.toLowerCase() === 'f') toggleFullscreen()
      else if (e.key.toLowerCase() === 'm') setMuted((m) => !m)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [sess, doPrimary, act])

  // sounds on transitions
  const prevState = useRef('')
  useEffect(() => {
    if (!view) return
    if (view.state !== prevState.current) {
      if (view.state === 'reveal') sounds.current?.reveal()
      if (view.state === 'podium') sounds.current?.winner()
      prevState.current = view.state
    }
  }, [view?.state, view])

  // ── Gate / create screen ──
  if (!sess) {
    return (
      <main style={{ minHeight: '100vh', background: BG, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 40, fontWeight: 800, marginBottom: 6 }}>QuizGame Host</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 26, fontSize: 14 }}>Start a live ACCA quiz session</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Host password" autoFocus
            onKeyDown={(e) => e.key === 'Enter' && createSession()}
            style={{ width: '100%', padding: 15, borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none', fontSize: 16, textAlign: 'center', boxSizing: 'border-box' }} />
          {error && <p style={{ color: '#fca5a5', fontSize: 13, marginTop: 12 }}>{error}</p>}
          <button onClick={createSession} disabled={creating}
            style={{ width: '100%', marginTop: 20, padding: 16, borderRadius: 14, border: 'none', background: '#fff', color: '#140a2e', fontWeight: 800, fontSize: 16, cursor: 'pointer', opacity: creating ? 0.6 : 1, fontFamily: DISPLAY }}>
            {creating ? 'Starting…' : 'Create Session'}
          </button>
        </div>
      </main>
    )
  }

  const p = primary(view)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aisca.lk'
  const joinUrl = `${origin}/quizgame?code=${sess.code}`
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=6&data=${encodeURIComponent(joinUrl)}`

  return (
    <main style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {view?.state === 'podium' && <Confetti />}
      {view?.state === 'countdown' && <CountdownOverlay sound={sounds.current || undefined} onDone={() => { if (view && openedRef.current === view.index) act('open') }} />}

      {/* top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px' }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, letterSpacing: '0.02em' }}>AISCA <span style={{ color: '#8b5cf6' }}>QuizGame</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
          {view && view.index >= 0 && view.state !== 'podium' && view.state !== 'finished' && <span>Question {view.index + 1} / {view.total}</span>}
          <span>👥 {view?.participantCount ?? 0}</span>
        </div>
      </div>

      {/* main */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        {!view ? (
          <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading…</p>
        ) : view.state === 'lobby' ? (
          <Lobby view={view} code={sess.code} joinUrl={joinUrl} qr={qr} showQR={showQR} />
        ) : view.state === 'question_open' || view.state === 'question_closed' ? (
          <QuestionStage view={view} reveal={false} />
        ) : view.state === 'reveal' ? (
          <QuestionStage view={view} reveal />
        ) : view.state === 'leaderboard' ? (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <motion.h2 initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ fontFamily: DISPLAY, fontSize: 44, fontWeight: 800, marginBottom: 24 }}>Leaderboard</motion.h2>
            <Leaderboard rows={view.leaderboard || []} max={5} />
          </div>
        ) : view.state === 'podium' || view.state === 'finished' ? (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <motion.h2 initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ fontFamily: DISPLAY, fontSize: 40, fontWeight: 800, marginBottom: 8 }}>Final Results</motion.h2>
            {(view.leaderboard?.[0]) && <p style={{ color: '#facc15', fontWeight: 700, marginBottom: 28 }}>🏆 Winner: {view.leaderboard[0].nickname}</p>}
            <Podium rows={view.leaderboard || []} />
          </div>
        ) : null}
      </div>

      {/* controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '18px 24px 26px', flexWrap: 'wrap' }}>
        {view && view.index >= 0 && <button onClick={() => act('prev')} style={ctrlBtn}>← Prev</button>}
        {view?.state === 'lobby' && <button onClick={() => setShowQR((s) => !s)} style={ctrlBtn}>{showQR ? 'Hide QR' : 'Show QR'}</button>}
        <button onClick={() => setMuted((m) => !m)} style={ctrlBtn}>{muted ? '🔇' : '🔊'}</button>
        <button onClick={toggleFullscreen} style={ctrlBtn}>⛶ Fullscreen</button>
        {p && (
          <button onClick={doPrimary} style={{ ...ctrlBtn, background: '#fff', color: '#140a2e', fontWeight: 800, padding: '14px 34px', fontSize: 16 }}>{p.label}</button>
        )}
        {(view?.state === 'podium' || view?.state === 'finished') && (
          <>
            <button onClick={() => act('restart')} style={ctrlBtn}>↻ Restart</button>
            <button onClick={() => act('finish')} style={{ ...ctrlBtn, color: '#fca5a5' }}>End</button>
          </>
        )}
        {view && view.state !== 'podium' && view.state !== 'finished' && view.state !== 'lobby' && (
          <button onClick={() => { if (confirm('End the quiz for everyone?')) act('finish') }} style={{ ...ctrlBtn, color: '#fca5a5' }}>End</button>
        )}
      </div>
      <style>{`@media (max-width:640px){ .qg-code{font-size:56px !important} }`}</style>
    </main>
  )
}

// ── Lobby ──
function Lobby({ view, code, joinUrl, qr, showQR }: { view: QuizView; code: string; joinUrl: string; qr: string; showQR: boolean }) {
  return (
    <div style={{ width: '100%', maxWidth: 1100, display: 'grid', gridTemplateColumns: showQR ? '1fr auto' : '1fr', gap: 40, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 13, marginBottom: 6 }}>Join the quiz at</p>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 18 }}>{joinUrl.replace(/^https?:\/\//, '')}</p>
        <div className="qg-code" style={{ fontFamily: DISPLAY, fontSize: 'clamp(56px, 12vw, 120px)', fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1, marginBottom: 24 }}>
          {code.slice(0, 3)} {code.slice(3)}
        </div>
        <AnimatePresence mode="popLayout">
          <motion.div key={view.participantCount} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} style={{ display: 'inline-block' }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, color: '#8b5cf6' }}>{view.participantCount}</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 18 }}> players joined</span>
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 26, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
          <AnimatePresence>
            {(view.participants || []).map((pl) => (
              <motion.div key={pl.participantId} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px 6px 6px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <Avatar index={pl.avatarIndex} size={30} />
                <span style={{ fontSize: 13, fontWeight: 600, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.nickname}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {showQR && (
        <div style={{ background: '#fff', padding: 16, borderRadius: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Join QR" width={260} height={260} style={{ display: 'block', width: 260, height: 260 }} />
        </div>
      )}
    </div>
  )
}

// ── Question stage (shared for open/closed/reveal) ──
function QuestionStage({ view, reveal }: { view: QuizView; reveal: boolean }) {
  const q = view.question
  if (!q) return null
  return (
    <div style={{ width: '100%', maxWidth: 1000, display: 'flex', flexDirection: 'column', gap: 22 }}>
      {view.state === 'question_closed' && !reveal && (
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, color: '#f43f5e' }}>TIME&apos;S UP!</motion.div>
      )}
      <motion.h2 key={q.title} initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}
        style={{ textAlign: 'center', fontFamily: DISPLAY, fontSize: 'clamp(1.6rem, 3.6vw, 3rem)', fontWeight: 800, lineHeight: 1.2 }}>{q.title}</motion.h2>
      {q.image && (
        <div style={{ textAlign: 'center' }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={q.image} alt="" style={{ maxHeight: 260, maxWidth: '100%', borderRadius: 14 }} /></div>
      )}

      {reveal ? (
        <ResultBars view={view} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14, maxWidth: 900, margin: '0 auto', width: '100%' }}>
          {q.options.map((opt, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 22 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 22px', borderRadius: 16, background: `${OPTION_COLORS[i % OPTION_COLORS.length]}22`, border: `2px solid ${OPTION_COLORS[i % OPTION_COLORS.length]}77`, fontSize: 19, fontWeight: 600 }}>
              <span style={{ color: OPTION_COLORS[i % OPTION_COLORS.length], fontSize: 24 }}>{OPTION_SHAPES[i % OPTION_SHAPES.length]}</span>{opt}
            </motion.div>
          ))}
        </div>
      )}

      {view.state === 'question_open' && <TimerBar view={view} />}

      {reveal && view.explanation && (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', maxWidth: 800, margin: '0 auto', fontSize: 15, lineHeight: 1.6 }}>💡 {view.explanation}</p>
      )}

      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.55)', fontSize: 15 }}>
        {reveal
          ? `${view.correctCount ?? 0} / ${view.answeredCount ?? 0} answered correctly`
          : `${view.answeredCount ?? 0} / ${view.participantCount} answered`}
      </div>
    </div>
  )
}

const ctrlBtn: React.CSSProperties = {
  padding: '11px 18px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
  color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
}
