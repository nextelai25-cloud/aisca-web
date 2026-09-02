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
  const [hideControls, setHideControls] = useState(false)
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
      else if (e.key.toLowerCase() === 'h') setHideControls((h) => !h)
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
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=380x380&margin=8&data=${encodeURIComponent(joinUrl)}`

  return (
    <main style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* ambient glows */}
      <motion.div animate={{ x: [0, 40, 0], y: [0, 20, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '-15%', left: '-10%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.28), transparent 62%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
      <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.22), transparent 62%)', filter: 'blur(40px)', pointerEvents: 'none' }} />

      {view?.state === 'podium' && <Confetti />}
      {view?.state === 'countdown' && <CountdownOverlay sound={sounds.current || undefined} onDone={() => { if (view && openedRef.current === view.index) act('open') }} />}

      {/* top bar */}
      {!hideControls && (
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px' }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 800, letterSpacing: '0.02em', fontSize: 20 }}>AISCA <span style={{ color: '#a78bfa' }}>QuizGame</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22, fontSize: 16, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
            {view && view.index >= 0 && view.state !== 'podium' && view.state !== 'finished' && <span>Question {view.index + 1} / {view.total}</span>}
            <span>👥 {view?.participantCount ?? 0}</span>
          </div>
        </div>
      )}

      {/* main */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 40px' }}>
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
            <motion.h2 initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, marginBottom: 32, textShadow: '0 8px 40px rgba(139,92,246,0.5)' }}>🏆 Leaderboard</motion.h2>
            <Leaderboard rows={view.leaderboard || []} max={8} />
          </div>
        ) : view.state === 'podium' || view.state === 'finished' ? (
          <div style={{ width: '100%', textAlign: 'center' }}>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: 16, marginBottom: 6 }}>Final Results</motion.p>
            {(view.leaderboard?.[0]) && (
              <motion.h2 initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.1, type: 'spring', stiffness: 200, damping: 14 }}
                style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 800, color: '#facc15', marginBottom: 30, textShadow: '0 8px 50px rgba(250,204,21,0.5)' }}>
                🎉 {view.leaderboard[0].nickname} wins!
              </motion.h2>
            )}
            <Podium rows={view.leaderboard || []} />
          </div>
        ) : null}
      </div>

      {/* controls */}
      {hideControls && (
        <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 3, fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>Press H for controls · Space to continue</div>
      )}
      {!hideControls && (
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '18px 24px 26px', flexWrap: 'wrap' }}>
        {view && view.index >= 0 && <button onClick={() => act('prev')} style={ctrlBtn}>← Prev</button>}
        {view?.state === 'lobby' && <button onClick={() => setShowQR((s) => !s)} style={ctrlBtn}>{showQR ? 'Hide QR' : 'Show QR'}</button>}
        <button onClick={() => setHideControls(true)} style={ctrlBtn}>Hide bar</button>
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
      )}
      <style>{`@media (max-width:640px){ .qg-code{font-size:56px !important} }`}</style>
    </main>
  )
}

// ── Lobby ──
function Lobby({ view, code, joinUrl, qr, showQR }: { view: QuizView; code: string; joinUrl: string; qr: string; showQR: boolean }) {
  return (
    <div style={{ width: '100%', maxWidth: 1240, display: 'grid', gridTemplateColumns: showQR ? '1fr auto' : '1fr', gap: 56, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 18, marginBottom: 10 }}>Join the quiz at</p>
        <p style={{ color: '#fff', fontSize: 'clamp(20px, 2.4vw, 30px)', marginBottom: 24, fontWeight: 600 }}>{joinUrl.replace(/^https?:\/\//, '')}</p>
        <div className="qg-code" style={{ fontFamily: DISPLAY, fontSize: 'clamp(64px, 13vw, 160px)', fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1, marginBottom: 30, textShadow: '0 12px 70px rgba(139,92,246,0.55)' }}>
          {code.slice(0, 3)} {code.slice(3)}
        </div>
        <AnimatePresence mode="popLayout">
          <motion.div key={view.participantCount} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} style={{ display: 'inline-block' }}>
            <span style={{ fontFamily: DISPLAY, fontSize: 48, fontWeight: 800, color: '#a78bfa' }}>{view.participantCount}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 26 }}> players joined</span>
          </motion.div>
        </AnimatePresence>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 32, maxWidth: 860, marginLeft: 'auto', marginRight: 'auto' }}>
          <AnimatePresence>
            {(view.participants || []).map((pl) => (
              <motion.div key={pl.participantId} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 16px 7px 7px', borderRadius: 999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Avatar index={pl.avatarIndex} size={38} />
                <span style={{ fontSize: 16, fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.nickname}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {showQR && (
        <div style={{ background: '#fff', padding: 22, borderRadius: 26, boxShadow: '0 24px 90px -24px rgba(0,0,0,0.7)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="Join QR" width={340} height={340} style={{ display: 'block', width: 340, height: 340 }} />
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
    <div style={{ width: '100%', maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: 26 }}>
      {view.state === 'question_closed' && !reveal && (
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', fontFamily: DISPLAY, fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 800, color: '#f43f5e', textShadow: '0 0 40px rgba(244,63,94,0.5)' }}>TIME&apos;S UP!</motion.div>
      )}
      <motion.h2 key={q.title} initial={{ y: 28, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.35 }}
        style={{ textAlign: 'center', fontFamily: DISPLAY, fontSize: 'clamp(2rem, 4.6vw, 4.2rem)', fontWeight: 800, lineHeight: 1.15 }}>{q.title}</motion.h2>
      {q.image && (
        <div style={{ textAlign: 'center' }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={q.image} alt="" style={{ maxHeight: 320, maxWidth: '100%', borderRadius: 16 }} /></div>
      )}

      {reveal ? (
        <ResultBars view={view} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          {q.options.map((opt, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 22 }}
              style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '26px 28px', minHeight: 88, borderRadius: 18, background: `${OPTION_COLORS[i % OPTION_COLORS.length]}22`, border: `2px solid ${OPTION_COLORS[i % OPTION_COLORS.length]}77`, fontSize: 26, fontWeight: 600 }}>
              <span style={{ color: OPTION_COLORS[i % OPTION_COLORS.length], fontSize: 30 }}>{OPTION_SHAPES[i % OPTION_SHAPES.length]}</span>{opt}
            </motion.div>
          ))}
        </div>
      )}

      {view.state === 'question_open' && <TimerBar view={view} />}

      {reveal && view.fastest && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, alignSelf: 'center', padding: '12px 24px', borderRadius: 999, background: 'rgba(250,204,21,0.14)', border: '1px solid rgba(250,204,21,0.4)' }}>
          <span style={{ fontSize: 24 }}>⚡</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>Fastest correct</span>
          <Avatar index={view.fastest.avatarIndex} size={36} />
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>{view.fastest.nickname}</span>
          <span style={{ color: '#facc15', fontWeight: 800, fontFamily: DISPLAY, fontSize: 20 }}>{(view.fastest.responseMs / 1000).toFixed(2)}s</span>
        </motion.div>
      )}

      {reveal && view.explanation && (
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', maxWidth: 900, margin: '0 auto', fontSize: 18, lineHeight: 1.6 }}>💡 {view.explanation}</p>
      )}

      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 20, fontWeight: 600 }}>
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
