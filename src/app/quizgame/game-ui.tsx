'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AVATARS, OPTION_COLORS, OPTION_SHAPES } from '@/lib/quizgame/config'
import { remainingMs, type QuizView } from './useSession'

export const BG = 'radial-gradient(1200px 800px at 50% -10%, #2b1a54 0%, #140a2e 45%, #0a0620 100%)'
export const DISPLAY = "'Space Grotesk', system-ui, sans-serif"

// ── Avatar ───────────────────────────────────────────────
export function Avatar({ index, size = 44 }: { index: number; size?: number }) {
  const a = AVATARS[((index % AVATARS.length) + AVATARS.length) % AVATARS.length] || AVATARS[0]
  return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: a.color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.55, flexShrink: 0, boxShadow: '0 6px 16px rgba(0,0,0,0.35)', lineHeight: 1 }}>
      {a.emoji}
    </span>
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

// ── Confetti (canvas) ────────────────────────────────────
export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
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
  }, [])
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 70, width: '100vw', height: '100vh' }} />
}

// ── 3-2-1-GO overlay ─────────────────────────────────────
export function CountdownOverlay({ onDone, sound }: { onDone?: () => void; sound?: Sounds }) {
  const [n, setN] = useState(3)
  useEffect(() => {
    sound?.tick()
    let cur = 3; setN(3)
    const id = setInterval(() => {
      cur -= 1
      if (cur > 0) { setN(cur); sound?.tick() }
      else if (cur === 0) { setN(0); sound?.go() }
      else { clearInterval(id); onDone?.() }
    }, 800)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,6,32,0.72)', backdropFilter: 'blur(6px)' }}>
      <AnimatePresence mode="wait">
        <motion.div key={n} initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1.12, opacity: 1 }} exit={{ scale: 1.5, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ fontFamily: DISPLAY, fontSize: 'clamp(5rem, 24vw, 16rem)', fontWeight: 800, color: '#fff', textShadow: '0 10px 60px rgba(139,92,246,0.6)' }}>
          {n === 0 ? 'GO!' : n}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

// ── Timer bar (server-authoritative) ─────────────────────
export function TimerBar({ view }: { view: QuizView }) {
  const [, force] = useState(0)
  useEffect(() => { const iv = setInterval(() => force((x) => x + 1), 120); return () => clearInterval(iv) }, [])
  const total = (view.question?.timeLimit ?? 20) * 1000
  const rem = remainingMs(view)
  const secs = Math.ceil(rem / 1000)
  const pct = Math.max(0, Math.min(1, rem / total))
  const urgent = secs <= 5 && secs > 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      <motion.div animate={urgent ? { scale: [1, 1.18, 1] } : { scale: 1 }} transition={{ duration: 0.25, repeat: urgent ? Infinity : 0 }}
        style={{ fontFamily: DISPLAY, fontSize: 56, fontWeight: 800, color: urgent ? '#f43f5e' : '#fff', minWidth: 90, textAlign: 'center', textShadow: urgent ? '0 0 30px rgba(244,63,94,0.6)' : 'none' }}>
        {secs}
      </motion.div>
      <div style={{ flex: 1, height: 22, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, borderRadius: 999, background: urgent ? '#f43f5e' : 'linear-gradient(90deg,#8b5cf6,#3b82f6)', transition: 'width 0.15s linear' }} />
      </div>
    </div>
  )
}

// ── Result bars ──────────────────────────────────────────
export function ResultBars({ view }: { view: QuizView }) {
  const q = view.question; const results = view.results
  if (!q || !results) return null
  const totalAns = results.reduce((s, r) => s + r.count, 0) || 1
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      {q.options.map((opt, i) => {
        const count = results.find((r) => r.choiceIndex === i)?.count ?? 0
        const pct = Math.round((count / totalAns) * 100)
        const correct = i === view.correctIndex
        return (
          <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: correct ? 1 : 0.75, x: 0 }} transition={{ delay: i * 0.06 }}
            style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: `2px solid ${correct ? '#22c55e' : 'rgba(255,255,255,0.08)'}`, boxShadow: correct ? '0 0 40px -8px rgba(34,197,94,0.55)' : 'none' }}>
            <motion.div initial={{ width: '0%' }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: 'absolute', inset: 0, background: correct ? 'rgba(34,197,94,0.34)' : `${OPTION_COLORS[i % OPTION_COLORS.length]}44` }} />
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 14, color: '#fff', fontSize: 24, fontWeight: 600 }}>
                <span style={{ color: OPTION_COLORS[i % OPTION_COLORS.length], fontSize: 26 }}>{OPTION_SHAPES[i % OPTION_SHAPES.length]}</span>
                {opt} {correct && <span style={{ color: '#4ade80', fontSize: 28 }}>✓</span>}
              </span>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 30 }}>{pct}%</span>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Leaderboard (FLIP reorder) ───────────────────────────
export function Leaderboard({ rows, highlightId, max = 5 }: { rows: { participantId: number; nickname: string; avatarIndex: number; score: number; rank: number }[]; highlightId?: number; max?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 780, margin: '0 auto' }}>
      {rows.slice(0, max).map((r) => {
        const me = r.participantId === highlightId
        const top = r.rank <= 3
        return (
          <motion.div key={r.participantId} layout transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '18px 26px', borderRadius: 18, background: me ? 'rgba(139,92,246,0.22)' : top ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.05)', border: `2px solid ${me ? '#8b5cf6' : r.rank === 1 ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.08)'}` }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, color: r.rank === 1 ? '#facc15' : r.rank === 2 ? '#cbd5e1' : r.rank === 3 ? '#d97706' : '#fff', minWidth: 44 }}>{r.rank}</span>
            <Avatar index={r.avatarIndex} size={52} />
            <span style={{ flex: 1, color: '#fff', fontSize: 24, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nickname}</span>
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: '#fff' }}>{Math.round(r.score).toLocaleString()}</span>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Podium (top 3) ───────────────────────────────────────
export function Podium({ rows }: { rows: { participantId: number; nickname: string; avatarIndex: number; score: number; rank: number }[] }) {
  const top = rows.slice(0, 3)
  const first = top[0]; const second = top[1]; const third = top[2]
  const Block = ({ r, place, h, delay }: { r?: typeof first; place: number; h: number; delay: number }) => {
    if (!r) return <div style={{ width: 200 }} />
    const color = place === 1 ? '#facc15' : place === 2 ? '#cbd5e1' : '#d97706'
    return (
      <motion.div initial={{ y: 160, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 200 }}>
        {place === 1 && <div style={{ fontSize: 40, marginBottom: 2 }}>👑</div>}
        <Avatar index={r.avatarIndex} size={place === 1 ? 104 : 80} />
        <div style={{ color: '#fff', fontWeight: 700, marginTop: 10, textAlign: 'center', fontSize: 20, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.nickname}</div>
        <div style={{ color, fontWeight: 800, fontFamily: DISPLAY, fontSize: 24 }}>{Math.round(r.score).toLocaleString()}</div>
        <div style={{ marginTop: 14, width: '100%', height: h, borderRadius: '16px 16px 0 0', background: `linear-gradient(180deg, ${color}, ${color}55)`, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 18, fontFamily: DISPLAY, fontWeight: 800, fontSize: 56, color: '#0a0620' }}>{place}</div>
      </motion.div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 18 }}>
      <Block r={second} place={2} h={200} delay={0.3} />
      <Block r={first} place={1} h={290} delay={0.9} />
      <Block r={third} place={3} h={150} delay={0.1} />
    </div>
  )
}
