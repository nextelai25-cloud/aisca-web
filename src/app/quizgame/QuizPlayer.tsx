'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { AVATARS, OPTION_COLORS, OPTION_SHAPES, QUIZGAME_TOKEN_STORAGE } from '@/lib/quizgame/config'
import { useSession, remainingMs } from './useSession'
import { Avatar, CountdownOverlay, AnimatedNumber, makeSounds, BG, DISPLAY, EASE, SPRING_SNAPPY, type Sounds } from './game-ui'

const CODE_KEY = 'quizgame_code'

type Phase = 'enter' | 'setup' | 'play'

export default function QuizPlayer() {
  const [phase, setPhase] = useState<Phase>('enter')
  const [code, setCode] = useState('')
  const [token, setToken] = useState('')
  const [nickname, setNickname] = useState('')
  const [avatarIndex, setAvatarIndex] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [muted, setMuted] = useState(false)
  const soundsRef = useRef<Sounds | null>(null)

  // Restore session / read ?code
  useEffect(() => {
    if (typeof window === 'undefined') return
    const urlCode = new URLSearchParams(window.location.search).get('code') || ''
    const savedToken = localStorage.getItem(QUIZGAME_TOKEN_STORAGE) || ''
    const savedCode = localStorage.getItem(CODE_KEY) || ''
    if (savedToken && savedCode) { setToken(savedToken); setCode(savedCode); setPhase('play'); return }
    if (urlCode) { setCode(urlCode.replace(/\D/g, '')); setPhase('setup'); setAvatarIndex(Math.floor(Math.random() * AVATARS.length)) }
    else setAvatarIndex(Math.floor(Math.random() * AVATARS.length))
  }, [])

  useEffect(() => { soundsRef.current = makeSounds() }, [])
  useEffect(() => { soundsRef.current?.setMuted(muted) }, [muted])

  const { view, notFound } = useSession({ role: 'player', code, token, active: phase === 'play' })

  useEffect(() => {
    if (notFound && phase === 'play') {
      localStorage.removeItem(QUIZGAME_TOKEN_STORAGE); localStorage.removeItem(CODE_KEY)
      setToken(''); setPhase('enter'); setError('That quiz is no longer available.')
    }
  }, [notFound, phase])

  async function proceedFromCode() {
    const c = code.replace(/\D/g, '')
    if (c.length !== 6) { setError('Enter the 6-digit code.'); return }
    setError(''); setCode(c); setPhase('setup')
  }

  async function join() {
    if (!nickname.trim()) { setError('Enter a nickname.'); return }
    setBusy(true); setError('')
    try {
      const res = await fetch('/api/quizgame/join', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, nickname: nickname.trim(), avatarIndex }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Could not join.'); return }
      localStorage.setItem(QUIZGAME_TOKEN_STORAGE, data.token)
      localStorage.setItem(CODE_KEY, code)
      setToken(data.token); setPhase('play')
    } catch { setError('Network error. Try again.') }
    finally { setBusy(false) }
  }

  const MuteBtn = () => (
    <button onClick={() => setMuted((m) => !m)} aria-label="mute"
      style={{ position: 'fixed', top: 'calc(env(safe-area-inset-top, 0px) + 14px)', right: 14, zIndex: 40, width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 16 }}>
      {muted ? '🔇' : '🔊'}
    </button>
  )

  const shell = (children: React.ReactNode) => (
    <main style={{ minHeight: '100vh', background: BG, color: '#fff', fontFamily: "'Inter', system-ui, sans-serif", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'calc(env(safe-area-inset-top,0px) + 20px) 18px calc(env(safe-area-inset-bottom,0px) + 20px)', position: 'relative' }}>
      <MuteBtn />
      {children}
      <style>{`input::placeholder{color:rgba(255,255,255,0.4)}`}</style>
    </main>
  )

  if (phase === 'enter') {
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE.entrance }} style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <h1 style={{ fontFamily: DISPLAY, fontSize: 40, fontWeight: 800, marginBottom: 8 }}>AISCA Quiz</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 28, fontSize: 14 }}>Enter the code shown on the screen</p>
        <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="000000" autoFocus
          style={{ width: '100%', textAlign: 'center', letterSpacing: '0.4em', fontSize: 30, fontWeight: 700, padding: '16px', borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none', fontFamily: DISPLAY, fontVariantNumeric: 'tabular-nums', boxSizing: 'border-box' }} />
        {error && <p style={{ color: '#fca5a5', fontSize: 13, marginTop: 12 }}>{error}</p>}
        <motion.button whileTap={{ scale: 0.96 }} onClick={proceedFromCode} style={btnPrimary}>Enter</motion.button>
      </motion.div>
    )
  }

  if (phase === 'setup') {
    return shell(
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE.entrance }} style={{ width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18 }}>Joining {code.slice(0, 3)} {code.slice(3)}</p>
        <AnimatePresence mode="wait">
          <motion.div key={avatarIndex} initial={{ scale: 0.7, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }} transition={SPRING_SNAPPY} style={{ display: 'inline-block', marginBottom: 12 }}>
            <Avatar index={avatarIndex} size={110} />
          </motion.div>
        </AnimatePresence>
        <div>
          <motion.button whileTap={{ scale: 0.95 }} onClick={() => setAvatarIndex((i) => (i + 1) % AVATARS.length)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: 999, padding: '7px 16px', fontSize: 13, cursor: 'pointer', marginBottom: 22 }}>🔀 Shuffle avatar</motion.button>
        </div>
        <input value={nickname} onChange={(e) => setNickname(e.target.value.slice(0, 24))} placeholder="Your nickname" autoFocus
          style={{ width: '100%', textAlign: 'center', fontSize: 20, fontWeight: 600, padding: '15px', borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', outline: 'none', boxSizing: 'border-box' }} />
        {error && <p style={{ color: '#fca5a5', fontSize: 13, marginTop: 12 }}>{error}</p>}
        <motion.button whileTap={{ scale: 0.96 }} onClick={join} disabled={busy} style={{ ...btnPrimary, opacity: busy ? 0.6 : 1 }}>{busy ? 'Joining…' : "Let's go"}</motion.button>
      </motion.div>
    )
  }

  // phase === 'play'
  return shell(<PlayView view={view} code={code} token={token} sounds={soundsRef} />)
}

function PlayView({ view, token, sounds }: { view: ReturnType<typeof useSession>['view']; code: string; token: string; sounds: React.MutableRefObject<Sounds | null> }) {
  const reduce = useReducedMotion()
  const [selected, setSelected] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const lastState = useRef<string>('')
  const lastRevealIdx = useRef<number>(-1)

  // Sync local selection with server (reconnection / current question)
  useEffect(() => {
    if (!view) return
    if (view.state === 'question_open') {
      if (view.you?.answeredChoice != null && selected == null) setSelected(view.you.answeredChoice)
    }
    if (view.state === 'countdown' || view.state === 'leaderboard') setSelected(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.index, view?.state])

  // Feedback sounds on reveal
  useEffect(() => {
    if (!view) return
    if (view.state === 'reveal' && lastRevealIdx.current !== view.index) {
      lastRevealIdx.current = view.index
      if (view.you?.lastCorrect) sounds.current?.correct()
      else sounds.current?.wrong()
    }
    lastState.current = view.state
  }, [view?.state, view?.index, view, sounds])

  if (!view) return <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>Connecting…<Dots /></div>

  if (view.you?.kicked) {
    return <div style={{ textAlign: 'center' }}><div style={{ fontSize: 46 }}>👋</div><p style={{ fontSize: 18, marginTop: 10 }}>You were removed from this quiz.</p></div>
  }

  const q = view.question
  const rem = remainingMs(view)
  const locked = view.state !== 'question_open' || rem <= 0

  async function submit(i: number) {
    if (locked || submitting) return
    setSelected(i); setSubmitting(true) // instant local feedback; server confirms after
    try {
      await fetch('/api/quizgame/answer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, questionIndex: view!.index, choiceIndex: i }),
      })
    } catch {} finally { setSubmitting(false) }
  }

  // group open/closed so the question screen doesn't remount when it locks
  const group =
    view.state === 'question_open' || view.state === 'question_closed' ? 'question'
    : view.state === 'podium' || view.state === 'finished' ? 'podium'
    : view.state

  const variants = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 18, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -12, scale: 0.98 } }

  let body: React.ReactNode = null

  if (view.state === 'lobby') {
    body = (
      <div style={{ textAlign: 'center' }}>
        <Avatar index={view.you?.avatarIndex ?? 0} size={96} idle />
        <h2 style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, margin: '16px 0 6px' }}>You&apos;re in!</h2>
        <p style={{ color: 'rgba(255,255,255,0.65)' }}>{view.you?.nickname}</p>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginTop: 18, fontSize: 14 }}>Waiting for the host to start…</p>
        <Dots />
      </div>
    )
  } else if (view.state === 'countdown') {
    body = <CountdownOverlay sound={sounds.current || undefined} />
  } else if ((view.state === 'question_open' || view.state === 'question_closed') && q) {
    body = (
      <div style={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
          Question {view.index + 1} of {view.total}{view.state === 'question_open' ? ` · ${Math.ceil(rem / 1000)}s` : ''}
        </p>
        <h2 style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, lineHeight: 1.35, margin: '0 0 6px' }}>{q.title}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {q.options.map((opt, i) => {
            const chosen = selected === i
            return (
              <motion.button key={i} onClick={() => submit(i)} disabled={locked}
                whileTap={locked ? undefined : { scale: 0.97 }}
                animate={{ scale: chosen ? 1 : 1 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 18px', minHeight: 62, borderRadius: 16, cursor: locked ? 'default' : 'pointer', textAlign: 'left',
                  background: chosen ? OPTION_COLORS[i % OPTION_COLORS.length] : `${OPTION_COLORS[i % OPTION_COLORS.length]}26`,
                  border: `2px solid ${chosen ? '#fff' : OPTION_COLORS[i % OPTION_COLORS.length] + '88'}`,
                  color: '#fff', fontSize: 16, fontWeight: 600, transition: 'background 0.22s ease, border-color 0.22s ease', opacity: locked && !chosen ? 0.55 : 1, boxSizing: 'border-box' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{OPTION_SHAPES[i % OPTION_SHAPES.length]}</span>
                <span style={{ flex: 1 }}>{opt}</span>
                {/* reserved slot → no layout shift when the check appears */}
                <span style={{ width: 24, flexShrink: 0, display: 'inline-flex', justifyContent: 'center' }}>
                  <AnimatePresence>
                    {chosen && <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.15, 1], opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ duration: 0.28, ease: EASE.entrance }} style={{ fontSize: 18 }}>✓</motion.span>}
                  </AnimatePresence>
                </span>
              </motion.button>
            )
          })}
        </div>
        {/* reserved status area (fixed height) → no jump */}
        <div style={{ minHeight: 22, textAlign: 'center' }}>
          <AnimatePresence mode="wait">
            {selected != null && (
              <motion.p key={view.state} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                style={{ color: view.state === 'question_open' ? '#a7f3d0' : 'rgba(255,255,255,0.6)', fontSize: 14, margin: 0 }}>
                {view.state === 'question_open' ? '✓ Answer submitted — you can still change it' : '🔒 Answer locked in'}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  } else if (view.state === 'reveal') {
    const correct = view.you?.lastCorrect
    const answered = view.you?.answeredChoice != null
    body = (
      <div style={{ textAlign: 'center', width: '100%', maxWidth: 420 }}>
        <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: reduce ? 1 : [0.4, 1.12, 1], opacity: 1 }} transition={{ duration: 0.45, ease: EASE.entrance }}
          style={{ fontSize: 74 }}>{correct ? '✅' : answered ? '❌' : '⌛'}</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ fontFamily: DISPLAY, fontSize: 30, fontWeight: 800, margin: '8px 0' }}>
          {correct ? 'Correct!' : answered ? 'Not quite!' : 'No answer'}
        </motion.h2>
        {!correct && q && view.correctIndex != null && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 10 }}>Correct answer: <b>{q.options[view.correctIndex]}</b></motion.p>
        )}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <AnimatedNumber value={view.you?.lastPoints ?? 0} duration={800} format={(v) => `+${Math.round(v).toLocaleString()}`} style={{ display: 'block', fontFamily: DISPLAY, fontSize: 40, fontWeight: 800, color: correct ? '#4ade80' : '#fff' }} />
        </motion.div>
        {(view.you?.streak ?? 0) >= 2 && correct && (
          <motion.p initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, ...SPRING_SNAPPY }} style={{ color: '#fbbf24', fontWeight: 700, marginTop: 6 }}>🔥 {view.you?.streak} in a row!</motion.p>
        )}
        <div style={{ marginTop: 20, color: 'rgba(255,255,255,0.75)' }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Total score</div>
          <AnimatedNumber value={Math.round(view.you?.score ?? 0)} duration={700} style={{ fontFamily: DISPLAY, fontSize: 26, fontWeight: 800 }} />
        </div>
      </div>
    )
  } else if (view.state === 'leaderboard') {
    body = (
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 12 }}>Leaderboard</p>
        <Avatar index={view.you?.avatarIndex ?? 0} size={80} />
        <div style={{ fontFamily: DISPLAY, fontSize: 54, fontWeight: 800, marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>#{view.you?.rank ?? '-'}</div>
        <div style={{ color: 'rgba(255,255,255,0.7)' }}><AnimatedNumber value={Math.round(view.you?.score ?? 0)} /> points</div>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginTop: 18, fontSize: 13 }}>Look up at the main screen 👀</p>
      </div>
    )
  } else if (view.state === 'podium' || view.state === 'finished') {
    const rank = view.you?.rank
    body = (
      <div style={{ textAlign: 'center', width: '100%', maxWidth: 420 }}>
        <p style={{ color: 'rgba(255,255,255,0.55)', letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: 12, marginBottom: 8 }}>Quiz complete</p>
        <Avatar index={view.you?.avatarIndex ?? 0} size={96} />
        <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 700, marginTop: 10 }}>{view.you?.nickname}</div>
        {rank === 1 && <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={SPRING_SNAPPY} style={{ fontSize: 40, marginTop: 4 }}>🏆</motion.div>}
        <div style={{ fontFamily: DISPLAY, fontSize: 60, fontWeight: 800, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>#{rank ?? '-'}</div>
        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 18 }}><AnimatedNumber value={Math.round(view.you?.score ?? 0)} /> points</div>
        <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 22 }}>Thanks for playing! 🎉</p>
      </div>
    )
  } else {
    body = <Dots />
  }

  // countdown is a full-screen overlay; render it without the shell transition
  if (view.state === 'countdown') return <>{body}</>

  return (
    <AnimatePresence mode="wait">
      <motion.div key={group} variants={variants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.32, ease: EASE.entrance }} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        {body}
      </motion.div>
    </AnimatePresence>
  )
}

// ── small helpers ──
function Dots() {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
      {[0, 1, 2].map((i) => (
        <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
      ))}
    </div>
  )
}

const btnPrimary: React.CSSProperties = {
  width: '100%', marginTop: 22, padding: 16, borderRadius: 16, border: 'none', cursor: 'pointer',
  background: '#fff', color: '#140a2e', fontWeight: 800, fontSize: 16, fontFamily: "'Space Grotesk', sans-serif",
}
