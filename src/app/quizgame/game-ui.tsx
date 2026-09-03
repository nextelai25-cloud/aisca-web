'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { AVATARS, OPTION_COLORS, OPTION_LETTERS } from '@/lib/quizgame/config'
import { remainingMs, type QuizView } from './useSession'

/* ── Theme (game-show / tech style) ────────────────────────
   Near-black background, electric-blue accent, angular chamfered shapes. */
export const BG =
  'radial-gradient(1000px 640px at 50% -8%, rgba(37,99,235,0.38), transparent 58%), radial-gradient(700px 500px at 100% 100%, rgba(56,189,248,0.16), transparent 60%), linear-gradient(180deg, #060b18 0%, #04070f 100%)'
export const DISPLAY = "'Space Grotesk', system-ui, sans-serif"

export const ACCENT = '#3b82f6'
export const ACCENT_2 = '#22d3ee'
export const ACCENT_GRAD = 'linear-gradient(135deg, #3b82f6 0%, #22d3ee 100%)'
export const PANEL = '#0a1424'
export const PANEL_HI = '#0e1c33'
export const BORDER = 'rgba(96,165,250,0.42)'

// Angular chamfer clip-paths (cut top-left + bottom-right corners).
export const clip = (s = 14) => `polygon(${s}px 0, 100% 0, 100% calc(100% - ${s}px), calc(100% - ${s}px) 100%, 0 100%, 0 ${s}px)`
export const CLIP = clip(14)
export const CLIP_SM = clip(9)
// Right-pointing "name-tag" banner (flat left, chevron right).
export const BANNER_CLIP = 'polygon(0 0, calc(100% - 26px) 0, 100% 50%, calc(100% - 26px) 100%, 0 100%)'

/* ── Motion design system ── */
export const DUR = { micro: 0.15, normal: 0.28, major: 0.5, dramatic: 0.85 }
export const EASE = {
  entrance: [0.22, 1, 0.36, 1] as [number, number, number, number],
  exit: [0.4, 0, 1, 1] as [number, number, number, number],
  soft: [0.16, 1, 0.3, 1] as [number, number, number, number],
}
export const SPRING = { type: 'spring' as const, stiffness: 360, damping: 30, mass: 0.9 }
export const SPRING_SOFT = { type: 'spring' as const, stiffness: 300, damping: 32, mass: 1 }
export const SPRING_SNAPPY = { type: 'spring' as const, stiffness: 440, damping: 28, mass: 0.8 }

export const screenVariants = {
  initial: { opacity: 0, y: 18, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -12, scale: 0.985 },
}

/* ── Faint tech grid overlay (fixed, non-interactive) ── */
export function GridBG() {
  return (
    <div aria-hidden style={{
      position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
      backgroundImage: 'linear-gradient(rgba(96,165,250,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.055) 1px, transparent 1px)',
      backgroundSize: '46px 46px',
      maskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)',
      WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, transparent 100%)',
    }} />
  )
}

/* ── Angular panel with a crisp accent border (two-layer clip) ── */
export function Angular({
  children, size = 14, border = BORDER, bg = PANEL, glow, style, className,
}: { children: React.ReactNode; size?: number; border?: string; bg?: string; glow?: string; style?: React.CSSProperties; className?: string }) {
  const cp = clip(size)
  return (
    <div className={className} style={{ clipPath: cp, background: border, padding: 2, filter: glow ? `drop-shadow(0 0 22px ${glow})` : undefined, ...style }}>
      <div style={{ clipPath: cp, background: bg, width: '100%', height: '100%', boxSizing: 'border-box' }}>{children}</div>
    </div>
  )
}

/* ── Small angular label pill (top-bar badges) ── */
export function Badge({ children, accent, style }: { children: React.ReactNode; accent?: boolean; style?: React.CSSProperties }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 16px', clipPath: CLIP_SM,
      background: accent ? ACCENT_GRAD : 'rgba(255,255,255,0.06)', border: 'none',
      color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', ...style,
    }}>{children}</span>
  )
}

/* ── Answer letter chip (A/B/C/D…) ── */
export function LetterChip({ i, size = 46 }: { i: number; size?: number }) {
  const c = OPTION_COLORS[i % OPTION_COLORS.length]
  return (
    <span style={{
      width: size, height: size, flexShrink: 0, clipPath: CLIP_SM,
      background: `linear-gradient(135deg, ${c}, ${c}bb)`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: DISPLAY, fontWeight: 800, fontSize: size * 0.46, color: '#fff', boxShadow: `0 0 18px -4px ${c}`,
    }}>{OPTION_LETTERS[i % OPTION_LETTERS.length]}</span>
  )
}

/* ── Avatar ── */
export function Avatar({ index, size = 44, idle = false }: { index: number; size?: number; idle?: boolean }) {
  const reduce = useReducedMotion()
  const a = AVATARS[((index % AVATARS.length) + AVATARS.length) % AVATARS.length] || AVATARS[0]
  const inner = (
    <span style={{ width: size, height: size, borderRadius: '50%', background: a.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.55, flexShrink: 0, boxShadow: '0 6px 16px rgba(0,0,0,0.45)', lineHeight: 1 }}>
      {a.emoji}
    </span>
  )
  if (!idle || reduce) return inner
  const dur = 3.4 + (index % 5) * 0.4
  const delay = (index % 7) * 0.3
  return (
    <motion.span animate={{ y: [0, -3, 0] }} transition={{ duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }} style={{ display: 'inline-flex' }}>
      {inner}
    </motion.span>
  )
}

/* ── Sounds (Web Audio, no assets) ── */
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

/* ── Confetti (canvas) ── */
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
    const colors = ['#3b82f6', '#22d3ee', '#8b5cf6', '#22c55e', '#f59e0b', '#ec4899', '#eab308']
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

/* ── 3-2-1-GO overlay (persistent stage, electric-blue numbers) ── */
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
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(4,7,15,0.82)', backdropFilter: 'blur(6px)' }}>
      <div style={{ position: 'relative', width: '60vw', height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AnimatePresence>
          <motion.div key={n}
            initial={{ scale: reduce ? 1 : (isGo ? 0.5 : 0.65), opacity: 0 }}
            animate={{ scale: reduce ? 1 : (isGo ? [0.5, 1.15, 1] : [0.65, 1.08, 1]), opacity: 1 }}
            exit={{ scale: reduce ? 1 : 1.4, opacity: 0 }}
            transition={{ duration: isGo ? 0.6 : 0.5, ease: EASE.entrance }}
            style={{
              position: 'absolute', fontFamily: DISPLAY, fontSize: isGo ? 'clamp(4rem, 20vw, 14rem)' : 'clamp(5rem, 24vw, 16rem)', fontWeight: 800,
              background: ACCENT_GRAD, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              filter: 'drop-shadow(0 10px 60px rgba(59,130,246,0.7))',
            }}>
            {isGo ? 'GO!' : n}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/* ── Timer bar (server-authoritative, RAF-smooth) ── */
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
      <div style={{ minWidth: 96, textAlign: 'center', position: 'relative', height: 68 }}>
        <AnimatePresence mode="popLayout">
          <motion.div key={secs}
            initial={{ scale: urgent ? 1.25 : 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE.entrance }}
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: DISPLAY, fontSize: 56, fontWeight: 800, fontVariantNumeric: 'tabular-nums', color: urgent ? '#f43f5e' : '#fff', textShadow: urgent ? '0 0 30px rgba(244,63,94,0.6)' : '0 0 24px rgba(59,130,246,0.5)' }}>
            {secs}
          </motion.div>
        </AnimatePresence>
      </div>
      <div style={{ flex: 1, height: 20, clipPath: clip(8), background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '100%', transformOrigin: 'left center', transform: `scaleX(${frac})`, background: urgent ? '#f43f5e' : ACCENT_GRAD, willChange: 'transform' }} />
      </div>
    </div>
  )
}

/* ── Result bars (morph from answer cards; angular; neutral → reveal) ── */
export function ResultBars({ view }: { view: QuizView }) {
  const q = view.question; const results = view.results
  const [lit, setLit] = useState(false)
  useEffect(() => { const t = setTimeout(() => setLit(true), 260); return () => clearTimeout(t) }, [])
  if (!q || !results) return null
  const totalAns = results.reduce((s, r) => s + r.count, 0) || 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      {q.options.map((opt, i) => {
        const count = results.find((r) => r.choiceIndex === i)?.count ?? 0
        const frac = count / totalAns
        const pct = Math.round(frac * 100)
        const correct = i === view.correctIndex
        const dim = lit && !correct
        const c = OPTION_COLORS[i % OPTION_COLORS.length]
        const cp = clip(14)
        return (
          <motion.div key={i} layoutId={`opt-${i}`} layout="position"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: dim ? 0.55 : 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35, ease: EASE.entrance }}
            style={{ clipPath: cp, padding: 2, background: lit && correct ? '#22c55e' : BORDER, filter: lit && correct ? 'drop-shadow(0 0 26px rgba(34,197,94,0.5))' : undefined }}>
            <div style={{ position: 'relative', clipPath: cp, background: PANEL, minHeight: 70, overflow: 'hidden' }}>
              <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: frac }} transition={{ delay: 0.18 + i * 0.05, duration: 0.75, ease: EASE.entrance }}
                style={{ position: 'absolute', inset: 0, transformOrigin: 'left center', willChange: 'transform', background: correct ? 'rgba(34,197,94,0.32)' : `${c}33` }} />
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px 14px 14px', minHeight: 70, boxSizing: 'border-box' }}>
                <LetterChip i={i} size={44} />
                <span style={{ flex: 1, color: '#fff', fontSize: 23, fontWeight: 600 }}>{opt}</span>
                <AnimatePresence>
                  {lit && correct && <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.15, 1], opacity: 1 }} transition={{ duration: 0.4, ease: EASE.entrance }} style={{ color: '#4ade80', fontSize: 28 }}>✓</motion.span>}
                </AnimatePresence>
                <AnimatedNumber value={lit ? pct : 0} duration={800} format={(v) => `${Math.round(v)}%`} style={{ color: '#fff', fontWeight: 800, fontSize: 30, minWidth: 78, textAlign: 'right' }} />
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ── Animated number (count-up, tabular width) ── */
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

/* ── Leaderboard (FLIP reorder + animated scores, angular rows) ── */
export function Leaderboard({ rows, highlightId, max = 5 }: { rows: { participantId: number; nickname: string; avatarIndex: number; score: number; rank: number }[]; highlightId?: number; max?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <AnimatePresence initial={false}>
        {rows.slice(0, max).map((r, i) => {
          const me = r.participantId === highlightId
          const stripe = r.rank === 1 ? '#facc15' : r.rank === 2 ? '#cbd5e1' : r.rank === 3 ? '#d97706' : ACCENT
          return (
            <motion.div key={r.participantId} layout
              transition={{ layout: SPRING_SOFT, default: { duration: 0.35, delay: i * 0.045, ease: EASE.entrance } }}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              style={{ clipPath: CLIP, padding: me ? 2 : 0, background: me ? ACCENT_GRAD : 'transparent' }}>
              <div style={{ clipPath: CLIP, display: 'flex', alignItems: 'center', gap: 16, padding: '15px 24px 15px 0', background: me ? PANEL_HI : PANEL, position: 'relative', overflow: 'hidden' }}>
                <div style={{ width: 6, alignSelf: 'stretch', background: stripe, flexShrink: 0 }} />
                <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, fontVariantNumeric: 'tabular-nums', color: stripe, minWidth: 40, textAlign: 'center' }}>{r.rank}</span>
                <Avatar index={r.avatarIndex} size={50} />
                <span style={{ flex: 1, color: '#fff', fontSize: 23, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nickname}</span>
                <AnimatedNumber value={Math.round(r.score)} style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 27, color: '#fff' }} />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

/* ── Podium (top 3, sequenced rise, angular blocks) ── */
export function Podium({ rows }: { rows: { participantId: number; nickname: string; avatarIndex: number; score: number; rank: number }[] }) {
  const top = rows.slice(0, 3)
  const first = top[0]; const second = top[1]; const third = top[2]
  const Block = ({ r, place, h, delay }: { r?: typeof first; place: number; h: number; delay: number }) => {
    if (!r) return <div style={{ width: 200 }} />
    const color = place === 1 ? '#facc15' : place === 2 ? '#cbd5e1' : '#d97706'
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200 }}>
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: delay + 0.15, duration: 0.5, ease: EASE.entrance }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {place === 1 && <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ delay: delay + 0.45, ...SPRING_SNAPPY }} style={{ fontSize: 40, marginBottom: 2 }}>👑</motion.div>}
          <Avatar index={r.avatarIndex} size={place === 1 ? 104 : 80} />
          <div style={{ color: '#fff', fontWeight: 700, marginTop: 10, textAlign: 'center', fontSize: 20, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nickname}</div>
          <AnimatedNumber value={Math.round(r.score)} style={{ color, fontWeight: 800, fontFamily: DISPLAY, fontSize: 24 }} />
        </motion.div>
        <motion.div initial={{ height: 0 }} animate={{ height: h }} transition={{ delay, duration: 0.7, ease: EASE.entrance }}
          style={{ marginTop: 14, width: '100%', clipPath: 'polygon(14px 0, calc(100% - 14px) 0, 100% 100%, 0 100%)', background: `linear-gradient(180deg, ${color}, ${color}55)`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 18, fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: '#04070f', overflow: 'hidden' }}>{place}</motion.div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 18 }}>
      <Block r={second} place={2} h={200} delay={0.55} />
      <Block r={first} place={1} h={290} delay={1.0} />
      <Block r={third} place={3} h={150} delay={0.15} />
    </div>
  )
}
