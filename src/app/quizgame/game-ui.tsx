'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { AVATARS, OPTION_COLORS, OPTION_SHAPES } from '@/lib/quizgame/config'
import { remainingMs, type QuizView } from './useSession'

export const BG = 'radial-gradient(1200px 800px at 50% -10%, #2b1a54 0%, #140a2e 45%, #0a0620 100%)'
export const DISPLAY = "'Space Grotesk', system-ui, sans-serif"

/* ── Motion design system ──────────────────────────────────
   One consistent motion language used everywhere. */
export const DUR = { micro: 0.15, normal: 0.28, major: 0.5, dramatic: 0.85 }
export const EASE = {
  entrance: [0.22, 1, 0.36, 1] as [number, number, number, number], // fast start, soft landing
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  soft: [0.16, 1, 0.3, 1] as [number, number, number, number],
}
export const SPRING = { type: 'spring' as const, stiffness: 360, damping: 30, mass: 0.9 }
export const SPRING_SOFT = { type: 'spring' as const, stiffness: 300, damping: 32, mass: 1 }
export const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 440, damping: 28, mass: 0.8 }

// Screen enter/exit used by the presentation shell (no hard cuts).
export const screenVariants = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.985 },
}

/* ── Animated number (count-up, tabular width so it never jumps) ── */
export function AnimatedNumber({
  value, duration = 700, format, style, className,
}: { value: number; duration?: number; format?: (n: number) => string; style?: React.CSSProperties; className?: string }) {
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(value)
  const fromRef = useRef(value)
  const rafRef = useRef(0)
  useEffect(() => {
    const from = fromRef.current
    const to = value
    if (reduce || from === to) { setDisplay(to); fromRef.current = to; return }
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(step)
      else fromRef.current = to
    }
    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
  }, [value, duration, reduce])
  const text = format ? format(display) : Math.round(display).toLocaleString()
  return <span className={className} style={{ fontVariantNumeric: 'tabular-nums', ...style }}>{text}</span>
}

// ── Avatar ───────────────────────────────────────────────
export function Avatar({ index, size = 44, idle = false }: { index: number; size?: number; idle?: boolean }) {
  const reduce = useReducedMotion()
  const a = AVATARS[((index % AVATARS.length) + AVATARS.length) % AVATARS.length] || AVATARS[0]
  const inner = (
    <span style={{ width: size, height: size, borderRadius: '50%', background: a.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.55, flexShrink: 0, boxShadow: '0 6px 16px rgba(0,0,0,0.35)', lineHeight: 1 }}>
      {a.emoji}
    </span>
  )
  if (!idle || reduce) return inner
  // very subtle, de-synced idle float
  const dur = 3.4 + (index % 5) * 0.4
  const delay = (index % 7) * 0.3
  return (
    <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }} style={{ display: 'inline-flex' }}>
      {inner}
    </motion.span>
  )
}

// ── Sounds (Web Audio, no assets) ────────────────────────
export interface Sounds {
  join: () => void; tick: () => void; go: () => void; correct: () => void
  wrong: () => void; points: () => void; reveal: () => void; winner: () => void
  setMuted: (m: boolean) => void
}
export function makeSounds(): Sounds {
  let ctx: AudioContext | null = null
  let muted = false
  const ensure = () => {
    if (!ctx) { try { const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext; ctx = new AC() } catch {} }
    return ctx
  }
  const beep = (freq: number, dur: number, type: OscillatorType = 'sine', vol = 0.14) => {
    if (muted) return
    const c = ensure(); if (!c) return
    const o = c.createOscillator(); const g = c.createGain()
    o.type = type; o.frequency.value = freq; o.connect(g); g.connect(c.destination)
    const t = c.currentTime; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.start(t); o.stop(t + dur)
  }
  return {
    join: () => beep(660, 0.12, 'triangle'),
    tick: () => beep(880, 0.05, 'square', 0.07),
    go: () => { beep(523, 0.12); setTimeout(() => beep(784, 0.18), 100) },
    correct: () => { beep(659, 0.12); setTimeout(() => beep(988, 0.2), 110) },
    wrong: () => beep(170, 0.25, 'sawtooth', 0.1),
    points: () => beep(1046, 0.08, 'triangle', 0.09),
    reveal: () => beep(440, 0.14),
    winner: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.22), i * 120)) },
    setMuted: (m: boolean) => { muted = m },
  }
}

// ── Confetti (canvas — runs off the React tree) ──────────
export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduce = useReducedMotion()
  useEffect(() => {
    if (reduce) return
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext('2d'); if (!ctx) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => { canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr }
    resize()
    const colors = ['#f43f5e', '#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899', '#eab308']
    const parts = Array.from({ length: 170 }, () => ({
      x: Math.random() * canvas.width, y: -Math.random() * canvas.height * 0.4,
      r: (6 + Math.random() * 9) * dpr, c: colors[Math.floor(Math.random() * colors.length)],
      vy: (2 + Math.random() * 4) * dpr, vx: (-1.2 + Math.random() * 2.4) * dpr,
      rot: Math.random() * Math.PI, vr: -0.2 + Math.random() * 0.4, rect: Math.random() < 0.5,
    }))
    const start = Date.now(); const dur = 4600; let raf = 0
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const t = Date.now() - start
      const fade = Math.max(0, 1 - Math.max(0, (t - 3000) / 1600))
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr
        if (p.y > canvas.height + 20) { p.y = -20; p.x = Math.random() * canvas.width }
        ctx.save(); ctx.globalAlpha = fade; ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.c
        if (p.rect) ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6)
        else { ctx.beginPath(); ctx.arc(0, 0, p.r / 2, 0, Math.PI * 2); ctx.fill() }
        ctx.restore()
      }
      if (t < dur) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('resize', resize)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [reduce])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 70, width: '100vw', height: '100vh' }} />
}

// ── 3-2-1-GO overlay (one persistent container, number animates inside) ──
export function CountdownOverlay({ onDone, sound }: { onDone?: () => void; sound?: Sounds }) {
  const [n, setN] = useState(3)
  const reduce = useReducedMotion()
  useEffect(() => {
    sound?.tick()
    let cur = 3; setN(3)
    const id = setInterval(() => {
      cur -= 1
      if (cur > 0) { setN(cur); sound?.tick() }
      else if (cur === 0) { setN(0); sound?.go() }
      else { clearInterval(id); onDone?.() }
    }, 750)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const isGo = n === 0
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,6,32,0.74)', backdropFilter: 'blur(6px)' }}>
      {/* persistent stage; only the number inside changes so there is never an empty frame */}
      <div style={{ position: 'relative', width: '60vw', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence>
          <motion.div key={n}
            initial={{ scale: reduce ? 1 : (isGo ? 0.5 : 0.65), opacity: 0 }}
            animate={{ scale: reduce ? 1 : (isGo ? [0.5, 1.15, 1] : [0.65, 1.08, 1]), opacity: 1 }}
            exit={{ scale: reduce ? 1 : 1.4, opacity: 0 }}
            transition={{ duration: isGo ? 0.6 : 0.5, ease: EASE.entrance }}
            style={{ position: 'absolute', fontFamily: DISPLAY, fontSize: isGo ? 'clamp(4rem, 20vw, 14rem)' : 'clamp(5rem, 24vw, 16rem)', fontWeight: 800, color: '#fff', textShadow: isGo ? '0 10px 80px rgba(139,92,246,0.85)' : '0 10px 60px rgba(139,92,246,0.6)' }}>
            {isGo ? 'GO!' : n}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ── Timer bar (server-authoritative, RAF-smooth 60fps) ──
export function TimerBar({ view }: { view: QuizView }) {
  const total = (view.question?.timeLimit ?? 20) * 1000
  const [rem, setRem] = useState(() => remainingMs(view))
  useEffect(() => {
    let raf = 0
    const loop = () => { setRem(remainingMs(view)); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [view])
  const secs = Math.max(0, Math.ceil(rem / 1000))
  const frac = Math.max(0, Math.min(1, rem / total))
  const urgent = secs <= 5 && secs > 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      {/* number re-mounts once per second → gentle pop, stronger in the final 5s */}
      <div style={{ minWidth: 96, textAlign: 'center', position: 'relative', height: 68 }}>
        <AnimatePresence mode="popLayout">
          <motion.div key={secs}
            initial={{ scale: urgent ? 1.25 : 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE.entrance }}
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 56, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: urgent ? '#f43f5e' : '#fff', textShadow: urgent ? '0 0 30px rgba(244,63,94,0.6)' : 'none' }}>
            {secs}
          </motion.div>
        </AnimatePresence>
      </div>
      <div style={{ flex: 1, height: 22, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        {/* scaleX transform (GPU) rather than animating width */}
        <div style={{ height: '100%', width: '100%', transformOrigin: 'left center', transform: `scaleX(${frac})`, borderRadius: 999, background: urgent ? '#f43f5e' : 'linear-gradient(90deg,#8b5cf6,#3b82f6)', willChange: 'transform' }} />
      </div>
    </div>
  )
}

// ── Result bars (morph from the answer cards; neutral → reveal) ──
export function ResultBars({ view }: { view: QuizView }) {
  const q = view.question; const results = view.results
  const [lit, setLit] = useState(false)
  useEffect(() => { const t = setTimeout(() => setLit(true), 260); return () => clearTimeout(t) }, [])
  if (!q || !results) return null
  const totalAns = results.reduce((s, r) => s + r.count, 0) || 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      {q.options.map((opt, i) => {
        const count = results.find((r) => r.choiceIndex === i)?.count ?? 0
        const frac = count / totalAns
        const pct = Math.round(frac * 100)
        const correct = i === view.correctIndex
        const dim = lit && !correct
        return (
          <motion.div key={i} layoutId={`opt-${i}`} layout="position"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: dim ? 0.6 : 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: EASE.entrance }}
            style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', minHeight: 72, background: 'rgba(255,255,255,0.06)', border: `2px solid ${lit && correct ? '#22c55e' : 'rgba(255,255,255,0.08)'}`, boxShadow: lit && correct ? '0 0 40px -8px rgba(34,197,94,0.55)' : 'none' }}>
            <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: frac }} transition={{ delay: 0.18 + i * 0.05, duration: 0.75, ease: EASE.entrance }}
              style={{ position: 'absolute', inset: 0, transformOrigin: 'left center', willChange: 'transform', background: correct ? 'rgba(34,197,94,0.34)' : `${OPTION_COLORS[i % OPTION_COLORS.length]}44` }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px', minHeight: 72, boxSizing: 'border-box' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#fff', fontSize: 24, fontWeight: 600 }}>
                <span style={{ color: OPTION_COLORS[i % OPTION_COLORS.length], fontSize: 26 }}>{OPTION_SHAPES[i % OPTION_SHAPES.length]}</span>
                {opt}
                <AnimatePresence>
                  {lit && correct && (
                    <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.15, 1], opacity: 1 }} transition={{ duration: 0.4, ease: EASE.entrance }} style={{ color: '#4ade80', fontSize: 28 }}>✓</motion.span>
                  )}
                </AnimatePresence>
              </span>
              <AnimatedNumber value={lit ? pct : 0} duration={800} format={(v) => `${Math.round(v)}%`} style={{ color: '#fff', fontWeight: 800, fontSize: 30 }} />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Leaderboard (FLIP reorder + animated scores) ─────────
export function Leaderboard({ rows, highlightId, max = 5 }: { rows: { participantId: number; nickname: string; avatarIndex: number; score: number; rank: number }[]; highlightId?: number; max?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 780, margin: '0 auto' }}>
      <AnimatePresence initial={false}>
        {rows.slice(0, max).map((r, i) => {
          const me = r.participantId === highlightId
          const top = r.rank <= 3
          return (
            <motion.div key={r.participantId} layout
              transition={{ layout: SPRING_SOFT, default: { duration: 0.35, delay: i * 0.045, ease: EASE.entrance } }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 26px', borderRadius: 18, background: me ? 'rgba(139,92,246,0.22)' : top ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)', border: `2px solid ${me ? '#8b5cf6' : r.rank === 1 ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.08)'}` }}>
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, fontVariantNumeric: 'tabular-nums', color: r.rank === 1 ? '#facc15' : r.rank === 2 ? '#cbd5e1' : r.rank === 3 ? '#d97706' : '#fff', minWidth: 44 }}>{r.rank}</span>
              <Avatar index={r.avatarIndex} size={52} />
              <span style={{ flex: 1, color: '#fff', fontSize: 24, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nickname}</span>
              <AnimatedNumber value={Math.round(r.score)} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: '#fff' }} />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// ── Podium (top 3, sequenced rise) ───────────────────────
export function Podium({ rows }: { rows: { participantId: number; nickname: string; avatarIndex: number; score: number; rank: number }[] }) {
  const top = rows.slice(0, 3)
  const first = top[0]; const second = top[1]; const third = top[2]
  const Block = ({ r, place, h, delay }: { r?: typeof first; place: number; h: number; delay: number }) => {
    if (!r) return <div style={{ width: 200 }} />
    const color = place === 1 ? '#facc15' : place === 2 ? '#cbd5e1' : '#d97706'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200 }}>
        {/* avatar + name rise with the bar so the object stays continuous */}
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: delay + 0.15, duration: 0.5, ease: EASE.entrance }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {place === 1 && <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: delay + 0.45, ...SPRING_SNAPPY }} style={{ fontSize: 40, marginBottom: 2 }}>👑</motion.div>}
          <Avatar index={r.avatarIndex} size={place === 1 ? 104 : 80} />
          <div style={{ color: '#fff', fontWeight: 700, marginTop: 10, textAlign: 'center', fontSize: 20, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nickname}</div>
          <AnimatedNumber value={Math.round(r.score)} style={{ color, fontWeight: 800, fontFamily: DISPLAY, fontSize: 24 }} />
        </motion.div>
        <motion.div initial={{ height: 0 }} animate={{ height: h }} transition={{ delay, duration: 0.7, ease: EASE.entrance }}
          style={{ marginTop: 14, width: '100%', borderRadius: '16px 16px 0 0', background: `linear-gradient(180deg, ${color}, ${color}55)`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 18, fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: '#0a0620', overflow: 'hidden' }}>{place}</motion.div>
      </div>
    )
  }
  // reveal order: 3rd → 2nd → 1st (suspense)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 18 }}>
      <Block r={second} place={2} h={200} delay={0.55} />
      <Block r={first} place={1} h={290} delay={1.0} />
      <Block r={third} place={3} h={150} delay={0.15} />
    </div>
  )
}
