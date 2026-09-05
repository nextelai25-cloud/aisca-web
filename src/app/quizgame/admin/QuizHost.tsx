'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OPTION_COLORS, QUIZGAME_HOST_STORAGE } from '@/lib/quizgame/config'
import { useSession, remainingMs, type QuizView } from '../useSession'
import {
  Avatar, Confetti, CountdownOverlay, TimerBar, ResultBars, Leaderboard, Podium,
  makeSounds, BG, DISPLAY, EASE, screenVariants, AnimatedNumber,
  GridBG, Badge, LetterChip, ACCENT_2, ACCENT_GRAD, PANEL, BORDER, clip, type Sounds,
} from '../game-ui'

interface HostSession { hostToken: string; code: string }

export default function QuizHost() {
  const [sess, setSess] = useState<HostSession | null>(null)
  const [password, setPassword] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [muted, setMuted] = useState(false)
  const [showQR, setShowQR] = useState(true)
  const [hideControls, setHideControls] = useState(false)
  const [idle, setIdle] = useState(false)
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

  useEffect(() => {
    if (!sess) return
    let t: ReturnType<typeof setTimeout>
    const wake = () => { setIdle(false); clearTimeout(t); t = setTimeout(() => setIdle(true), 3800) }
    window.addEventListener('mousemove', wake)
    window.addEventListener('keydown', wake)
    window.addEventListener('touchstart', wake)
    wake()
    return () => { clearTimeout(t); window.removeEventListener('mousemove', wake); window.removeEventListener('keydown', wake); window.removeEventListener('touchstart', wake) }
  }, [sess])

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

  const lockRef = useRef(false)
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

  const openedRef = useRef(-1)
  useEffect(() => {
    if (view?.state === 'countdown') openedRef.current = view.index
  }, [view?.state, view?.index])

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
  const doPrimary = useCallback(() => {
    if (lockRef.current) return
    const p = primary(view); if (!p) return
    lockRef.current = true
    setTimeout(() => { lockRef.current = false }, 420)
    act(p.action)
  }, [view, act])

  const toggleFullscreen = () => {
    const el = document.documentElement as HTMLElement & { requestFullscreen?: () => void }
    if (!document.fullscreenElement) el.requestFullscreen?.()
    else document.exitFullscreen?.()
  }

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
      <main style={{ minHeight: '100vh', background: BG, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative' }}>
        <GridBG />
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE.entrance }} style={{ width: '100%', maxWidth: 400, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <Badge accent style={{ marginBottom: 18 }}>AISCA QuizGame</Badge>
          <h1 style={{ fontFamily: DISPLAY, fontSize: 40, fontWeight: 800, marginBottom: 6 }}>Host Console</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 26, fontSize: 14 }}>Start a live ACCA quiz session</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Host password" autoFocus
            onKeyDown={(e) => e.key === 'Enter' && createSession()}
            style={{ width: '100%', padding: 15, clipPath: clip(10), background: PANEL, border: 'none', outline: `1px solid ${BORDER}`, color: '#fff', fontSize: 16, textAlign: 'center', boxSizing: 'border-box' }} />
          {error && <p style={{ color: '#fca5a5', fontSize: 13, marginTop: 12 }}>{error}</p>}
          <motion.button whileTap={{ scale: 0.96 }} onClick={createSession} disabled={creating}
            style={{ width: '100%', marginTop: 20, padding: 16, clipPath: clip(12), border: 'none', background: ACCENT_GRAD, color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer', opacity: creating ? 0.6 : 1, fontFamily: DISPLAY }}>
            {creating ? 'Starting…' : 'Create Session'}
          </motion.button>
        </motion.div>
      </main>
    )
  }

  const p = primary(view)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://aisca.lk'
  const joinUrl = `${origin}/quizgame?code=${sess.code}`
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=380x380&margin=8&data=${encodeURIComponent(joinUrl)}`

  const st = view?.state
  const screenKey =
    !view ? 'load'
    : st === 'lobby' ? 'lobby'
    : (st === 'question_open' || st === 'question_closed' || st === 'reveal') ? 'question'
    : st === 'leaderboard' ? 'leaderboard'
    : (st === 'podium' || st === 'finished') ? 'podium'
    : 'other'

  const controlsShown = !hideControls && (!idle || st === 'lobby')

  return (
    <main style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', cursor: controlsShown ? 'auto' : 'none' }}>
      <GridBG />
      {/* ambient blue/cyan glows — persistent */}
      <motion.div animate={{ x: [0, 40, 0], y: [0, 20, 0] }} transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', top: '-15%', left: '-10%', width: 720, height: 720, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.32), transparent 62%)', filter: 'blur(46px)', pointerEvents: 'none', zIndex: 0 }} />
      <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }} style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 660, height: 660, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,211,238,0.2), transparent 62%)', filter: 'blur(46px)', pointerEvents: 'none', zIndex: 0 }} />

      {view?.state === 'podium' && <Confetti />}
      <AnimatePresence>
        {view?.state === 'countdown' && <CountdownOverlay key="cd" sound={sounds.current || undefined} onDone={() => { if (view && openedRef.current === view.index) act('open') }} />}
      </AnimatePresence>

      {/* top bar */}
      <motion.div animate={{ opacity: controlsShown ? 1 : 0, y: controlsShown ? 0 : -8 }} transition={{ duration: 0.25, ease: EASE.soft }}
        style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', pointerEvents: controlsShown ? 'auto' : 'none' }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 800, letterSpacing: '0.03em', fontSize: 20 }}>AISCA <span style={{ color: ACCENT_2 }}>QuizGame</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {view && view.index >= 0 && view.state !== 'podium' && view.state !== 'finished' && <Badge>Question {view.index + 1} / {view.total}</Badge>}
          <Badge accent>👥 <AnimatedNumber value={view?.participantCount ?? 0} duration={300} /></Badge>
        </div>
      </motion.div>

      {/* main */}
      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 40px' }}>
        <AnimatePresence mode="wait">
          <motion.div key={screenKey} variants={screenVariants} initial="initial" animate="animate" exit="exit"
            transition={{ duration: 0.4, ease: EASE.entrance }} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {!view ? (
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Loading…</p>
            ) : view.state === 'lobby' ? (
              <Lobby view={view} code={sess.code} joinUrl={joinUrl} qr={qr} showQR={showQR} />
            ) : (view.state === 'question_open' || view.state === 'question_closed' || view.state === 'reveal') ? (
              <QuestionStage view={view} reveal={view.state === 'reveal'} />
            ) : view.state === 'leaderboard' ? (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <motion.h2 initial={{ y: -24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.45, ease: EASE.entrance }} style={{ fontFamily: DISPLAY, fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 800, marginBottom: 32, textShadow: '0 8px 40px rgba(59,130,246,0.5)' }}>🏆 Leaderboard</motion.h2>
                <Leaderboard rows={view.leaderboard || []} max={8} />
              </div>
            ) : (view.state === 'podium' || view.state === 'finished') ? (
              <div style={{ width: '100%', textAlign: 'center' }}>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: 16, marginBottom: 6 }}>Final Results</motion.p>
                {(view.leaderboard?.[0]) && (
                  <motion.h2 initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.6, type: 'spring', stiffness: 220, damping: 16 }}
                    style={{ fontFamily: DISPLAY, fontSize: 'clamp(2rem, 5vw, 3.6rem)', fontWeight: 800, color: '#facc15', marginBottom: 30, textShadow: '0 8px 50px rgba(250,204,21,0.5)' }}>
                    🎉 {view.leaderboard[0].nickname} wins!
                  </motion.h2>
                )}
                <Podium rows={view.leaderboard || []} />
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* controls */}
      {controlsShown ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.25, ease: EASE.soft }}
          style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '18px 24px 26px', flexWrap: 'wrap' }}>
          {view && view.index >= 0 && <CtrlBtn onClick={() => act('prev')}>← Prev</CtrlBtn>}
          {view?.state === 'lobby' && <CtrlBtn onClick={() => setShowQR((s) => !s)}>{showQR ? 'Hide QR' : 'Show QR'}</CtrlBtn>}
          <CtrlBtn onClick={() => setHideControls(true)}>Hide bar</CtrlBtn>
          <CtrlBtn onClick={() => setMuted((m) => !m)}>{muted ? '🔇' : '🔊'}</CtrlBtn>
          <CtrlBtn onClick={toggleFullscreen}>⛶ Fullscreen</CtrlBtn>
          {p && (
            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.94 }} onClick={doPrimary} style={{ ...ctrlBtn, clipPath: clip(10), background: ACCENT_GRAD, color: '#fff', fontWeight: 800, padding: '14px 34px', fontSize: 16 }}>{p.label}</motion.button>
          )}
          {(view?.state === 'podium' || view?.state === 'finished') && (
            <>
              <CtrlBtn onClick={() => act('restart')}>↻ Restart</CtrlBtn>
              <CtrlBtn onClick={() => act('finish')} danger>End</CtrlBtn>
            </>
          )}
          {view && view.state !== 'podium' && view.state !== 'finished' && view.state !== 'lobby' && (
            <CtrlBtn onClick={() => { if (confirm('End the quiz for everyone?')) act('finish') }} danger>End</CtrlBtn>
          )}
        </motion.div>
      ) : (
        <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 3, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          {hideControls ? 'Press H for controls · Space to continue' : 'Move the mouse for controls'}
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
        <p style={{ color: ACCENT_2, letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: 18, marginBottom: 10, fontWeight: 700 }}>Join the quiz at</p>
        <p style={{ color: '#fff', fontSize: 'clamp(22px, 2.6vw, 34px)', marginBottom: 18, fontWeight: 700 }}>{joinUrl.replace(/^https?:\/\//, '').replace(/\?.*$/, '')}</p>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'clamp(15px, 1.6vw, 20px)', marginBottom: 8, fontWeight: 600 }}>then enter this code:</p>
        <div className="qg-code" style={{ fontFamily: DISPLAY, fontSize: 'clamp(64px, 13vw, 160px)', fontWeight: 800, letterSpacing: '0.06em', lineHeight: 1, marginBottom: 30, background: ACCENT_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 12px 60px rgba(59,130,246,0.55))' }}>
          {code.slice(0, 3)} {code.slice(3)}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 8 }}>
          <AnimatedNumber value={view.participantCount} duration={350} style={{ fontFamily: DISPLAY, fontSize: 48, fontWeight: 800, color: ACCENT_2 }} />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 26 }}>players joined</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 32, maxWidth: 860, marginLeft: 'auto', marginRight: 'auto' }}>
          <AnimatePresence>
            {(view.participants || []).map((pl) => (
              <motion.div key={pl.participantId} initial={{ scale: 0, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 460, damping: 24 }}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 16px 7px 7px', clipPath: clip(8), background: PANEL, outline: `1px solid ${BORDER}` }}>
                <Avatar index={pl.avatarIndex} size={38} idle />
                <span style={{ fontSize: 16, fontWeight: 600, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.nickname}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      {showQR && (
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE.entrance }} style={{ clipPath: clip(18), background: ACCENT_GRAD, padding: 4, filter: 'drop-shadow(0 24px 70px rgba(59,130,246,0.45))' }}>
          <div style={{ clipPath: clip(16), background: '#fff', padding: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} alt="Join QR" width={330} height={330} style={{ display: 'block', width: 330, height: 330 }} />
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── Question stage (open/closed/reveal — cards morph into bars) ──
function QuestionStage({ view, reveal }: { view: QuizView; reveal: boolean }) {
  const q = view.question
  if (!q) return null
  const cp = clip(14)
  return (
    <div style={{ width: '100%', maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: 26 }}>
      <AnimatePresence>
        {view.state === 'question_closed' && !reveal && (
          <motion.div key="tu" initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: [0.85, 1.05, 1], opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: EASE.entrance }} style={{ textAlign: 'center', fontFamily: DISPLAY, fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 800, color: '#f43f5e', textShadow: '0 0 40px rgba(244,63,94,0.5)' }}>TIME&apos;S UP!</motion.div>
        )}
      </AnimatePresence>

      {/* question banner (angular name-tag) */}
      <motion.div key={q.title} initial={{ y: 20, opacity: 0, filter: 'blur(4px)' }} animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }} transition={{ duration: 0.4, ease: EASE.entrance }}
        style={{ alignSelf: 'center', maxWidth: 1080, width: '100%', clipPath: cp, background: BORDER, padding: 2, filter: 'drop-shadow(0 0 30px rgba(59,130,246,0.28))' }}>
        <div style={{ clipPath: cp, background: 'linear-gradient(180deg, #0c1a30, #0a1424)', display: 'flex', alignItems: 'center', gap: 18, padding: '22px 34px' }}>
          <div style={{ width: 6, alignSelf: 'stretch', background: ACCENT_GRAD, flexShrink: 0 }} />
          <h2 style={{ margin: 0, textAlign: 'left', fontFamily: DISPLAY, fontSize: 'clamp(1.6rem, 3.6vw, 3.1rem)', fontWeight: 800, lineHeight: 1.18 }}>{q.title}</h2>
        </div>
      </motion.div>

      {q.image && (
        <div style={{ textAlign: 'center' }}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={q.image} alt="" style={{ maxHeight: 300, maxWidth: '100%', clipPath: cp }} /></div>
      )}

      {reveal ? (
        <ResultBars view={view} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 16, maxWidth: 1100, margin: '0 auto', width: '100%' }}>
          {q.options.map((opt, i) => (
            <motion.div key={i} layoutId={`opt-${i}`} layout="position"
              initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.07, duration: 0.36, ease: EASE.entrance }}
              style={{ clipPath: cp, padding: 2, background: `linear-gradient(135deg, ${OPTION_COLORS[i % OPTION_COLORS.length]}88, ${BORDER})` }}>
              <div style={{ clipPath: cp, background: PANEL, display: 'flex', alignItems: 'center', gap: 16, padding: '18px 26px 18px 14px', minHeight: 92, boxSizing: 'border-box' }}>
                <LetterChip i={i} size={54} />
                <span style={{ color: '#fff', fontSize: 26, fontWeight: 600 }}>{opt}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {view.state === 'question_open' && <TimerBar view={view} />}

      <AnimatePresence>
        {reveal && view.fastest && (
          <motion.div key="fast" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.6, duration: 0.4, ease: EASE.entrance }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, alignSelf: 'center', padding: '10px 22px', clipPath: clip(10), background: 'rgba(250,204,21,0.14)', outline: '1px solid rgba(250,204,21,0.4)' }}>
            <span style={{ fontSize: 24 }}>⚡</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 16 }}>Fastest correct</span>
            <Avatar index={view.fastest.avatarIndex} size={36} />
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>{view.fastest.nickname}</span>
            <span style={{ color: '#facc15', fontWeight: 800, fontFamily: DISPLAY, fontSize: 20 }}>{(view.fastest.responseMs / 1000).toFixed(2)}s</span>
          </motion.div>
        )}
      </AnimatePresence>

      {reveal && view.explanation && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', maxWidth: 900, margin: '0 auto', fontSize: 18, lineHeight: 1.6 }}>💡 {view.explanation}</motion.p>
      )}

      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', fontSize: 20, fontWeight: 600 }}>
        {reveal
          ? <><AnimatedNumber value={view.correctCount ?? 0} duration={500} /> / {view.answeredCount ?? 0} answered correctly</>
          : <><AnimatedNumber value={view.answeredCount ?? 0} duration={300} /> / {view.participantCount} answered</>}
      </div>
    </div>
  )
}

const ctrlBtn: React.CSSProperties = {
  padding: '11px 18px', clipPath: 'polygon(7px 0,100% 0,100% calc(100% - 7px),calc(100% - 7px) 100%,0 100%,0 7px)', background: 'rgba(255,255,255,0.08)', border: 'none',
  color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600,
}
function CtrlBtn({ children, onClick, danger }: { children: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.94 }} onClick={onClick} style={{ ...ctrlBtn, color: danger ? '#fca5a5' : '#fff' }}>{children}</motion.button>
  )
}
