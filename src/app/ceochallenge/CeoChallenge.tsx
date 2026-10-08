'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Scene, { type SceneVibe } from './Scene'
import { CARDS } from '@/lib/ceo/cards'
import {
  BIZ_IDS, DEMO_ROUNDS, TOTAL_ROUNDS, fmtLKR,
  type BizId, type Briefing, type GameView, type LeaderRow, type Outcome, type PublicState,
} from '@/lib/ceo/types'

type Mode = 'official' | 'demo'
type ScreenName = 'landing' | 'register' | 'resume' | 'pick' | 'briefing' | 'play' | 'final' | 'loading'
interface Game {
  business: BizId
  view: GameView
  briefing?: Briefing
  seed?: number // demo only
  choices?: number[] // demo only
  rank?: { rank: number; total: number } | null
}
interface DecideResult { outcome: Outcome; view: GameView; rank?: { rank: number; total: number } | null }

const TOKEN_KEY = 'aisca-ceo-token'
const store = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } },
  set: (v: string) => { try { localStorage.setItem(TOKEN_KEY, v) } catch { /* private mode */ } },
}

class ApiError extends Error {
  constructor(message: string, public status: number, public data: any) { super(message) }
}
async function api<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, body === undefined ? undefined : {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error || 'Something went wrong. Please try again.', res.status, data)
  return data as T
}

const unitLabel = (b: BizId) => `${CARDS[b].unit.charAt(0).toUpperCase()}${CARDS[b].unit.slice(1)} ${CARDS[b].unitPer}`
const pct = (from: number, to: number) => {
  if (Math.abs(from) < 1) return null
  const p = ((to - from) / Math.abs(from)) * 100
  return `${p >= 0 ? '+' : '−'}${Math.abs(p).toFixed(Math.abs(p) < 10 ? 1 : 0)}%`
}

// ── Small building blocks ───────────────────────────────────

function useReducedMotion() {
  const [r, setR] = useState(false)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    setR(m.matches)
    const on = () => setR(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return r
}

/** Counts from the previous value to the new one, so every change is visible. */
function Num({ value, format = (n: number) => fmtLKR(n), className }: { value: number; format?: (n: number) => string; className?: string }) {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (reduced) { setShown(value); from.current = value; return }
    const start = performance.now(), a = from.current, b = value, ms = 1100
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / ms)
      const e = 1 - Math.pow(1 - k, 3)
      setShown(a + (b - a) * e)
      if (k < 1) raf = requestAnimationFrame(tick)
      else from.current = b
    }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); from.current = b }
  }, [value, reduced])
  return <span className={className}>{format(shown)}</span>
}

/** Story captions over the scene, one beat at a time. Tap to skip ahead. */
function Captions({ lines, auto = 3200 }: { lines: string[]; auto?: number }) {
  const [i, setI] = useState(0)
  const key = lines.join('|')
  useEffect(() => { setI(0) }, [key])
  useEffect(() => {
    if (i >= lines.length - 1) return
    const t = setTimeout(() => setI(x => x + 1), auto)
    return () => clearTimeout(t)
  }, [i, lines.length, auto, key])
  if (!lines.length) return null
  return (
    <>
      <button className="ceo-caption-tap" aria-label="Next line" onClick={() => setI(x => (x + 1) % lines.length)} />
      <div className="ceo-caption-zone" aria-live="polite">
        <p className="ceo-caption ceo-fade" key={`${key}-${i}`}>{lines[i]}</p>
        {lines.length > 1 && (
          <div className="ceo-caption-dots">
            {lines.map((_, n) => (
              <button key={n} aria-label={`Line ${n + 1}`} aria-current={n === i} onClick={() => setI(n)} style={{ position: 'relative', zIndex: 2 }} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function ValueChart({ history }: { history: PublicState['history'] }) {
  const w = 300, h = 120, pad = 6
  if (history.length < 2) return <p className="ceo-hint">Your company’s value will be charted here as you decide.</p>
  const vs = history.map(p => p.valuation)
  const lo = Math.min(0, ...vs), hi = Math.max(...vs)
  const x = (i: number) => pad + (i / (history.length - 1)) * (w - pad * 2)
  const y = (v: number) => h - pad - ((v - lo) / Math.max(1, hi - lo)) * (h - pad * 2)
  const line = history.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.valuation).toFixed(1)}`).join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="ceo-chart" role="img" aria-label={`Company value from ${fmtLKR(vs[0])} to ${fmtLKR(vs[vs.length - 1])}`}>
      {lo < 0 && <line x1={pad} x2={w - pad} y1={y(0)} y2={y(0)} stroke="#3A332C" strokeDasharray="4 4" />}
      <path d={`${line} L${x(history.length - 1)} ${h - pad} L${pad} ${h - pad} Z`} fill="rgba(255,91,10,.14)" />
      <path d={line} fill="none" stroke="#FF5B0A" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(history.length - 1)} cy={y(vs[vs.length - 1])} r="5" fill="#FF5B0A" stroke="#000" strokeWidth="2" />
    </svg>
  )
}

function Leaderboard({ highlight }: { highlight?: number }) {
  const [data, setData] = useState<{ rows: LeaderRow[]; players: number } | null>(null)
  useEffect(() => {
    api<{ rows: LeaderRow[]; players: number }>('/api/ceo/leaderboard').then(setData).catch(() => setData({ rows: [], players: 0 }))
  }, [])
  if (!data) return <p className="ceo-hint">Loading the leaderboard…</p>
  if (!data.rows.length) {
    return <div className="ceo-empty">No finished games yet. The first CEO to finish takes the top spot.</div>
  }
  return (
    <table className="ceo-board">
      <thead><tr><th scope="col">Rank</th><th scope="col">CEO</th><th scope="col" className="ceo-board-biz">Business</th><th scope="col">Company value</th></tr></thead>
      <tbody>
        {data.rows.map(r => (
          <tr key={r.rank} className={highlight === r.rank ? 'ceo-board-me' : undefined}>
            <td>{r.rank}</td>
            <td>{r.name}<span className="ceo-board-school">{r.school}</span></td>
            <td className="ceo-board-biz">{CARDS[r.business].name}</td>
            <td>{fmtLKR(r.valuation)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function TopBar({ onHome }: { onHome?: () => void }) {
  return (
    <header className="ceo-top">
      <button className="ceo-lockup" onClick={onHome} aria-label="CEO Challenge home">
        <span className="ceo-lockup-c360">COMMERCE <span>360°</span></span>
        <span className="ceo-lockup-by">CEO Challenge</span>
      </button>
      <a className="ceo-top-link" href="/">aisca.lk</a>
    </header>
  )
}

// ── Landing ────────────────────────────────────────────────

const HERO_VIBE: SceneVibe = { crowd: 0.22, mood: 0.32, staff: 0.32, shine: 0.25 }

function Landing({ onEnter, onDemo, hasToken }: { onEnter: () => void; onDemo: () => void; hasToken: boolean }) {
  const [hero, setHero] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setHero(h => (h + 1) % BIZ_IDS.length), 5200)
    return () => clearInterval(t)
  }, [])
  const biz = BIZ_IDS[hero]
  return (
    <main className="ceo-wrap">
      <div role="region" className="ceo-hero">
        <div>
          <h1 className="ceo-wordmark"><span>CEO</span><span className="ceo-wm-o">Challenge</span></h1>
          <p className="ceo-hero-lede">Five businesses are about to fail. Pick one, make 15 decisions as its CEO, and build the most valuable company in the competition.</p>
          <div className="ceo-hero-cta">
            <button className="ceo-btn ceo-btn-primary" onClick={onEnter}>{hasToken ? 'Continue my game' : 'Enter the competition'}</button>
            <button className="ceo-btn ceo-btn-ghost" onClick={onDemo}>Try a demo</button>
          </div>
          <p className="ceo-hero-note">The demo is {DEMO_ROUNDS} decisions with its own situations, and isn’t scored. The competition is one game of 15 decisions, about 15 minutes.</p>
        </div>
        <div className="ceo-scene" key={biz}>
          <Scene biz={biz} vibe={HERO_VIBE} profit={-60_000} sceneKey={`hero-${biz}`} />
          <div className="ceo-caption-zone"><p className="ceo-caption ceo-fade">{CARDS[biz].teaser}</p></div>
        </div>
      </div>

      <div role="region" className="ceo-section" aria-labelledby="how">
        <h2 className="ceo-h2" id="how">How it works</h2>
        <p className="ceo-sub">Every option is a real strategy that real companies have used. There are no wrong answers, only consequences.</p>
        <ol className="ceo-steps">
          <li><h3>Pick a business</h3><p>A café, a restaurant, a software company, a clothing brand or a hotel. All five are losing money.</p></li>
          <li><h3>Make the call</h3><p>Each decision has four choices. What you pick changes what happens next, so no two games are the same.</p></li>
          <li><h3>Watch it play out</h3><p>Weeks pass. Customers come or go. Cash grows or drains. Your team gets happier or more tired.</p></li>
          <li><h3>Climb the leaderboard</h3><p>After 15 decisions, your company is valued. Everyone is ranked together, whichever business they ran.</p></li>
        </ol>
      </div>

      <div role="region" className="ceo-section" aria-labelledby="biz">
        <h2 className="ceo-h2" id="biz">The five businesses</h2>
        <p className="ceo-sub">They all start at a similar size and value, so any of them can win.</p>
        <div className="ceo-biz-grid">
          {BIZ_IDS.map(b => (
            <div key={b} className="ceo-biz ceo-biz-static">
              <div className="ceo-biz-art"><Scene biz={b} vibe={HERO_VIBE} profit={0} sceneKey={`grid-${b}`} /></div>
              <div className="ceo-biz-body">
                <p className="ceo-biz-name">{CARDS[b].name}</p>
                <p className="ceo-biz-kind">{CARDS[b].kind}, {CARDS[b].place}</p>
                <p className="ceo-biz-teaser">{CARDS[b].teaser}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div role="region" className="ceo-section" aria-labelledby="lb">
        <h2 className="ceo-h2" id="lb">Leaderboard</h2>
        <p className="ceo-sub">Ranked by company value at the end of the game, across all five businesses.</p>
        <Leaderboard />
      </div>

      <div role="region" className="ceo-section" aria-labelledby="rules">
        <h2 className="ceo-h2" id="rules">Rules</h2>
        <ul className="ceo-rules">
          <li>One official game per student. Once you start, your decisions are final.</li>
          <li>You can play the demo as many times as you like. It uses different situations from the competition and is not scored.</li>
          <li>Your game saves after every decision. If you close the page, continue from the same device, or sign in again with your email and mobile number.</li>
          <li>You can’t go bankrupt. If you run out of cash, the bank steps in, at a cost.</li>
          <li>Final results are announced at COMMERCE 360°.</li>
        </ul>
      </div>
      <footer className="ceo-foot">CEO Challenge is part of COMMERCE 360°, organised by the All Island Schools Commerce Association.</footer>
    </main>
  )
}

// ── Registration ──────────────────────────────────────────

function Register({ onDone, onBack, onResume }: { onDone: (token: string) => void; onBack: () => void; onResume: () => void }) {
  const [f, setF] = useState({ fullName: '', school: '', grade: '', email: '', phone: '', consent: false })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF(s => ({ ...s, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }))
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const r = await api<{ token: string }>('/api/ceo/register', f)
      onDone(r.token)
    } catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  return (
    <main className="ceo-narrow">
      <button className="ceo-back" onClick={onBack}>Back</button>
      <h1 className="ceo-h2">Enter the competition</h1>
      <p className="ceo-sub">We use your email and mobile number only to contact winners and to let you continue your game on another device.</p>
      <form className="ceo-form" onSubmit={submit} noValidate>
        <div className="ceo-field"><label htmlFor="fn">Full name</label><input id="fn" autoComplete="name" value={f.fullName} onChange={set('fullName')} required /></div>
        <div className="ceo-field"><label htmlFor="sc">School</label><input id="sc" value={f.school} onChange={set('school')} required /></div>
        <div className="ceo-field">
          <label htmlFor="gr">Grade</label>
          <select id="gr" value={f.grade} onChange={set('grade')}>
            <option value="">Select your grade</option>
            {['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'School leaver'].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <div className="ceo-field"><label htmlFor="em">Email</label><input id="em" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={set('email')} required /></div>
        <div className="ceo-field"><label htmlFor="ph">Mobile number</label><input id="ph" type="tel" autoComplete="tel" inputMode="tel" placeholder="07X XXX XXXX" value={f.phone} onChange={set('phone')} required /></div>
        <label className="ceo-check"><input type="checkbox" checked={f.consent} onChange={set('consent')} /> I’ll play one official game, and my name, school and result can appear on the public leaderboard.</label>
        {err && <p className="ceo-error" role="alert">{err}</p>}
        <button className="ceo-btn ceo-btn-primary ceo-btn-block" disabled={busy}>{busy ? 'Registering…' : 'Register and pick a business'}</button>
        <p className="ceo-hint">Already registered? <button type="button" className="ceo-link" onClick={onResume}>Continue your game</button></p>
      </form>
    </main>
  )
}

function Resume({ onDone, onBack }: { onDone: (token: string) => void; onBack: () => void }) {
  const [email, setEmail] = useState(''), [phone, setPhone] = useState('')
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { const r = await api<{ token: string }>('/api/ceo/register', { email, phone, resumeOnly: true }); onDone(r.token) }
    catch (x) { setErr((x as Error).message) } finally { setBusy(false) }
  }
  return (
    <main className="ceo-narrow">
      <button className="ceo-back" onClick={onBack}>Back</button>
      <h1 className="ceo-h2">Continue your game</h1>
      <p className="ceo-sub">Enter the email and mobile number you registered with.</p>
      <form className="ceo-form" onSubmit={submit} noValidate>
        <div className="ceo-field"><label htmlFor="rem">Email</label><input id="rem" type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
        <div className="ceo-field"><label htmlFor="rph">Mobile number</label><input id="rph" type="tel" autoComplete="tel" value={phone} onChange={e => setPhone(e.target.value)} /></div>
        {err && <p className="ceo-error" role="alert">{err}</p>}
        <button className="ceo-btn ceo-btn-primary ceo-btn-block" disabled={busy}>{busy ? 'Checking…' : 'Continue'}</button>
      </form>
    </main>
  )
}

// ── Pick a business ───────────────────────────────────────

function Pick({ mode, onPick, onBack }: { mode: Mode; onPick: (b: BizId) => Promise<void>; onBack: () => void }) {
  const [sel, setSel] = useState<BizId | null>(null)
  const [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const go = async () => {
    if (!sel) return
    setErr(''); setBusy(true)
    try { await onPick(sel) } catch (x) { setErr((x as Error).message); setBusy(false) }
  }
  return (
    <main className="ceo-wrap" style={{ paddingBottom: 40 }}>
      <button className="ceo-back" onClick={onBack}>Back</button>
      <h1 className="ceo-h2">{mode === 'demo' ? 'Pick a business for the demo' : 'Pick your business'}</h1>
      <p className="ceo-sub">
        {mode === 'demo'
          ? `The demo gives you ${DEMO_ROUNDS} decisions with practice situations you won’t see in the competition. Nothing is saved.`
          : 'All five are losing money, and all five can be saved. You can’t change your business once you start.'}
      </p>
      <div className="ceo-biz-grid">
        {BIZ_IDS.map(b => (
          <button key={b} className="ceo-biz" aria-pressed={sel === b} onClick={() => setSel(b)}>
            <div className="ceo-biz-art"><Scene biz={b} vibe={HERO_VIBE} profit={0} sceneKey={`pick-${b}`} /></div>
            <div className="ceo-biz-body">
              <p className="ceo-biz-name">{CARDS[b].name}</p>
              <p className="ceo-biz-kind">{CARDS[b].kind}, {CARDS[b].place}</p>
              <p className="ceo-biz-teaser">{CARDS[b].teaser}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="ceo-sticky" style={{ maxWidth: 520, margin: '0 auto' }}>
        {err && <p className="ceo-error" role="alert" style={{ marginBottom: 10 }}>{err}</p>}
        <button className="ceo-btn ceo-btn-primary ceo-btn-block" disabled={!sel || busy} onClick={go}>
          {busy ? 'Opening the doors…' : sel ? `Run ${CARDS[sel].name}` : 'Pick a business'}
        </button>
      </div>
    </main>
  )
}

// ── Briefing ──────────────────────────────────────────────

function BriefingScreen({ game, onStart, mode }: { game: Game; onStart: () => void; mode: Mode }) {
  const b = game.briefing!
  const st = game.view.state
  return (
    <main className="ceo-game">
      <div className="ceo-play">
        <div className="ceo-hud">
          <div><p className="ceo-hud-name">{b.card.name}</p><p className="ceo-hud-kind">{b.card.kind}, {b.card.place}</p></div>
          <div className="ceo-hud-round">Day one<strong>Where things stand</strong></div>
        </div>
        <div className="ceo-scene">
          <Scene biz={game.business} vibe={st.vibe} profit={st.profit} sceneKey="brief" />
          <Captions lines={b.story} auto={3000} />
        </div>
        <p className="ceo-problem">{b.problem}</p>
        <div className="ceo-card" style={{ background: 'var(--ceo-panel)' }}>
          <h3>The numbers you inherit</h3>
          <dl className="ceo-facts">{b.facts.map(f => <div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>
        </div>
        <button className="ceo-btn ceo-btn-primary ceo-btn-block" onClick={onStart}>
          {mode === 'demo' ? 'Take the keys' : `Take the keys. ${TOTAL_ROUNDS} decisions start now.`}
        </button>
      </div>
    </main>
  )
}

// ── The game ──────────────────────────────────────────────

function Stats({ s, from }: { s: PublicState; from?: PublicState }) {
  return (
    <div className="ceo-stats">
      <div className="ceo-stat ceo-stat-main"><p className="ceo-stat-l">Company value</p><p className="ceo-stat-v"><Num value={s.valuation} /></p></div>
      <div className="ceo-stat"><p className="ceo-stat-l">Cash</p><p className="ceo-stat-v"><Num value={s.cash} /></p></div>
      <div className="ceo-stat"><p className="ceo-stat-l">Weekly profit</p><p className={`ceo-stat-v ${s.profit >= 0 ? 'ceo-gain' : 'ceo-loss'}`}><Num value={s.profit} /></p></div>
    </div>
  )
}

function SidePanel({ biz, s }: { biz: BizId; s: PublicState }) {
  return (
    <aside className="ceo-side" aria-label="Company dashboard">
      <div className="ceo-card"><h3>Company value</h3><ValueChart history={s.history} /></div>
      <div className="ceo-card">
        <h3>This week</h3>
        <dl className="ceo-facts">
          <div><dt>{unitLabel(biz)}</dt><dd>{s.customers.toLocaleString('en-LK')}</dd></div>
          <div><dt>Capacity</dt><dd>{s.capacity.toLocaleString('en-LK')}</dd></div>
          <div><dt>Average price</dt><dd>{fmtLKR(s.price, false)}</dd></div>
          <div><dt>Revenue</dt><dd>{fmtLKR(s.revenue)}</dd></div>
          <div><dt>Profit</dt><dd className={s.profit >= 0 ? 'ceo-gain' : 'ceo-loss'}>{fmtLKR(s.profit)}</dd></div>
          <div><dt>Bank loan</dt><dd>{fmtLKR(s.debt)}</dd></div>
        </dl>
      </div>
    </aside>
  )
}

function Play({ game, mode, onDecide, onFinished }: {
  game: Game; mode: Mode
  onDecide: (choice: number, round: number) => Promise<DecideResult>
  onFinished: (g: Game) => void
}) {
  const [view, setView] = useState(game.view)
  const [phase, setPhase] = useState<'decide' | 'saving' | 'lapse' | 'result'>('decide')
  const [sel, setSel] = useState<number | null>(null)
  const [res, setRes] = useState<DecideResult | null>(null)
  const [err, setErr] = useState('')
  const top = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const biz = game.business
  const sc = view.scenario
  const st = view.state
  // Hold the old numbers through the time-lapse, then reveal the new ones.
  const shownState = phase === 'result' && res ? res.outcome.after : st

  useEffect(() => { if (!sc && st.done) onFinished({ ...game, view }) }, [sc, st.done]) // eslint-disable-line react-hooks/exhaustive-deps

  const decide = async () => {
    if (sel === null || !sc) return
    setErr(''); setPhase('saving')
    try {
      const r = await onDecide(sel, st.round)
      setRes(r)
      setPhase('lapse')
      top.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
      setTimeout(() => setPhase('result'), reduced ? 50 : 1900)
    } catch (x) {
      const e = x as ApiError
      if (e.status === 409 && e.data?.state) { setView(e.data as GameView); setSel(null); setPhase('decide'); setErr('Your game was updated in another tab, so we reloaded it.'); return }
      setErr(e.message); setPhase('decide')
    }
  }

  const next = () => {
    if (!res) return
    if (res.view.state.done || !res.view.scenario) { onFinished({ ...game, view: res.view, rank: res.rank }); return }
    setView(res.view); setRes(null); setSel(null); setPhase('decide')
    top.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  const o = res?.outcome
  const lines = phase === 'result' && o ? o.story : phase === 'lapse' ? [] : sc?.story || []
  const card = CARDS[biz]

  return (
    <main className="ceo-game">
      <div className="ceo-play" ref={top}>
        <div className="ceo-hud">
          <div><p className="ceo-hud-name">{card.name}</p><p className="ceo-hud-kind">Week {Math.max(1, shownState.week)}</p></div>
          <div className="ceo-hud-round">Decision<strong>{Math.min(st.round + 1, st.totalRounds)} of {st.totalRounds}</strong></div>
        </div>
        <div className="ceo-progress" aria-hidden="true">
          {Array.from({ length: st.totalRounds }).map((_, i) => (
            <span key={i} data-s={i < st.round || (i === st.round && phase !== 'decide' && phase !== 'saving') ? 'done' : i === st.round ? 'now' : ''} />
          ))}
        </div>
        <Stats s={shownState} />

        <div className="ceo-scene">
          <Scene biz={biz} vibe={(phase === 'lapse' && res ? res.outcome.after : shownState).vibe} profit={(phase === 'lapse' && res ? res.outcome.after : shownState).profit} timelapse={phase === 'lapse'} sceneKey={`${st.round}-${phase === 'decide' || phase === 'saving' ? 'a' : 'b'}`} />
          {phase === 'lapse' && o && (
            <div className="ceo-weeks"><p className="ceo-fade">{o.weeks} weeks<br />later</p></div>
          )}
          {phase !== 'lapse' && <Captions lines={lines} />}
        </div>

        {(phase === 'decide' || phase === 'saving') && sc && (
          <div role="region" aria-labelledby="q" className="ceo-fade" key={sc.id}>
            <h1 className="ceo-q" id="q">{sc.title}</h1>
            <p className="ceo-q-meta">This decision covers the next {sc.weeks} weeks.</p>
            <div className="ceo-options" role="group" aria-labelledby="q" style={{ marginTop: 14 }}>
              {sc.options.map((op, i) => (
                <button key={op.key} className="ceo-opt" aria-pressed={sel === i} onClick={() => setSel(i)} disabled={phase === 'saving'}>
                  <span className="ceo-opt-k" aria-hidden="true">{op.key}</span>
                  <span><span className="ceo-opt-l">{op.label}</span><span className="ceo-opt-d">{op.detail}</span></span>
                </button>
              ))}
            </div>
            <div className="ceo-sticky">
              {err && <p className="ceo-error" role="alert" style={{ marginBottom: 10 }}>{err}</p>}
              <button className="ceo-btn ceo-btn-primary ceo-btn-block" disabled={sel === null || phase === 'saving'} onClick={decide}>
                {phase === 'saving' ? 'Making the call…' : sel === null ? 'Choose A, B, C or D' : `Make the call: ${sc.options[sel].key}`}
              </button>
            </div>
          </div>
        )}

        {phase === 'result' && o && (
          <div role="region" className="ceo-result ceo-fade" aria-live="polite">
            <p className="ceo-result-you">You chose <strong>{o.key}. {o.label}</strong></p>
            <div className="ceo-result-value">
              <span className="ceo-big"><Num value={o.after.valuation} /></span>
              {pct(o.before.valuation, o.after.valuation) && (
                <span className={`ceo-delta ${o.after.valuation >= o.before.valuation ? 'ceo-gain' : 'ceo-loss'}`}>{pct(o.before.valuation, o.after.valuation)}</span>
              )}
            </div>
            <dl className="ceo-result-rows">
              <div><dt>{unitLabel(biz)}</dt><dd>{o.before.customers.toLocaleString('en-LK')} → {o.after.customers.toLocaleString('en-LK')}</dd></div>
              <div><dt>Weekly profit</dt><dd className={o.after.profit >= 0 ? 'ceo-gain' : 'ceo-loss'}>{fmtLKR(o.before.profit)} → {fmtLKR(o.after.profit)}</dd></div>
              <div><dt>Cash</dt><dd className={o.after.cash >= o.before.cash ? 'ceo-gain' : 'ceo-loss'}>{fmtLKR(o.before.cash)} → {fmtLKR(o.after.cash)}</dd></div>
              {o.after.debt !== o.before.debt && <div><dt>Bank loan</dt><dd>{fmtLKR(o.before.debt)} → {fmtLKR(o.after.debt)}</dd></div>}
            </dl>
            {o.bailout && <p className="ceo-bank">You ran out of cash during these weeks. The bank covered the gap with an emergency loan, and you’ll pay interest on it.</p>}
            <button className="ceo-btn ceo-btn-primary ceo-btn-block" onClick={next}>
              {res!.view.state.done ? 'See your final result' : 'Next decision'}
            </button>
          </div>
        )}
      </div>
      <SidePanel biz={biz} s={shownState} />
    </main>
  )
}

// ── Final ─────────────────────────────────────────────────

function Final({ game, mode, onDemoAgain, onEnter }: { game: Game; mode: Mode; onDemoAgain: () => void; onEnter: () => void }) {
  const s = game.view.state
  const start = s.history[0]?.valuation || 1
  const growth = s.valuation / start
  const card = CARDS[game.business]
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const text = `I ran ${card.name} in the AISCA CEO Challenge and built it to ${fmtLKR(s.valuation)}. Can you beat that?`
    const url = 'https://aisca.lk/ceochallenge'
    try {
      if (navigator.share) await navigator.share({ title: 'CEO Challenge', text, url })
      else { await navigator.clipboard.writeText(`${text} ${url}`); setCopied(true) }
    } catch { /* cancelled */ }
  }
  return (
    <main className="ceo-final">
      <div className="ceo-scene"><Scene biz={game.business} vibe={s.vibe} profit={s.profit} sceneKey="final" /></div>
      <p className="ceo-final-lead">{mode === 'demo' ? `After ${DEMO_ROUNDS} decisions, your company is worth` : `After ${s.totalRounds} decisions and ${s.week} weeks, ${card.name} is worth`}</p>
      <p className="ceo-final-value"><Num value={s.valuation} /></p>
      <div className="ceo-final-meta">
        <span className="ceo-pill">{growth >= 1 ? `${growth.toFixed(1)}× what you started with` : `${Math.round(growth * 100)}% of where you started`}</span>
        {game.rank && <span className="ceo-pill">Rank {game.rank.rank} of {game.rank.total}</span>}
      </div>
      <div className="ceo-card"><h3>Company value, week by week</h3><ValueChart history={s.history} /></div>

      {mode === 'demo' ? (
        <div className="ceo-form">
          <p className="ceo-sub" style={{ margin: 0 }}>That was the demo. The real competition has {TOTAL_ROUNDS} decisions, harder situations and a national leaderboard.</p>
          <button className="ceo-btn ceo-btn-primary ceo-btn-block" onClick={onEnter}>Enter the competition</button>
          <button className="ceo-btn ceo-btn-ghost ceo-btn-block" onClick={onDemoAgain}>Play the demo again</button>
        </div>
      ) : (
        <button className="ceo-btn ceo-btn-primary ceo-btn-block" onClick={share}>{copied ? 'Copied. Paste it anywhere.' : 'Share your result'}</button>
      )}

      {game.view.decisions && game.view.decisions.length > 0 && (
        <div className="ceo-card">
          <h3>Your decisions</h3>
          <ol className="ceo-recap">
            {game.view.decisions.map(d => (
              <li key={d.round}><span className="ceo-recap-k">{d.key}</span><div><p className="ceo-recap-t">{d.round}. {d.title}</p><p className="ceo-recap-l">{d.label}</p></div></li>
            ))}
          </ol>
        </div>
      )}
      {mode === 'official' && (
        <div role="region" aria-labelledby="flb"><h2 className="ceo-h2" id="flb">Leaderboard</h2><Leaderboard highlight={game.rank?.rank} /></div>
      )}
    </main>
  )
}

// ── Root ──────────────────────────────────────────────────

export default function CeoChallenge() {
  const [screen, setScreen] = useState<ScreenName>('landing')
  const [mode, setMode] = useState<Mode>('demo')
  const [token, setToken] = useState<string | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => { setToken(store.get()) }, [])
  useEffect(() => { window.scrollTo({ top: 0 }) }, [screen])

  const home = () => { setScreen('landing'); setErr('') }

  const loadOfficial = useCallback(async (t: string) => {
    setScreen('loading'); setErr('')
    try {
      const r = await api<{ run: (GameView & { business: BizId; rank: Game['rank'] }) | null }>('/api/ceo/game', { token: t })
      setMode('official')
      if (!r.run) { setScreen('pick'); return }
      const g: Game = { business: r.run.business, view: r.run, briefing: r.run.briefing, rank: r.run.rank }
      setGame(g)
      setScreen(r.run.state.done ? 'final' : r.run.state.round === 0 ? 'briefing' : 'play')
    } catch (x) {
      const e = x as ApiError
      if (e.status === 401) { setScreen('register'); return }
      setErr(e.message); setScreen('landing')
    }
  }, [])

  const enter = () => (token ? loadOfficial(token) : (setMode('official'), setScreen('register')))
  const demo = () => { setMode('demo'); setGame(null); setScreen('pick') }

  const registered = (t: string) => { store.set(t); setToken(t); loadOfficial(t) }

  const pick = async (b: BizId) => {
    if (mode === 'demo') {
      const r = await api<GameView & { seed: number; business: BizId }>('/api/ceo/demo', { business: b, choices: [] })
      setGame({ business: b, view: r, briefing: r.briefing, seed: r.seed, choices: [] })
    } else {
      const r = await api<GameView & { business: BizId }>('/api/ceo/start', { token, business: b })
      setGame({ business: r.business, view: r, briefing: r.briefing })
    }
    setScreen('briefing')
  }

  const decide = async (choice: number, round: number): Promise<DecideResult> => {
    if (!game) throw new Error('No game')
    if (mode === 'demo') {
      const choices = [...(game.choices || []), choice]
      const r = await api<DecideResult>('/api/ceo/demo', { business: game.business, seed: game.seed, choices })
      setGame(g => (g ? { ...g, choices } : g))
      return r
    }
    return api<DecideResult>('/api/ceo/choose', { token, round, choice })
  }

  const finished = (g: Game) => { setGame(g); setScreen('final') }

  return (
    <div className="ceo-root">
      <TopBar onHome={home} />
      {err && <div className="ceo-wrap"><p className="ceo-error" role="alert">{err}</p></div>}
      {screen === 'landing' && <Landing onEnter={enter} onDemo={demo} hasToken={!!token} />}
      {screen === 'loading' && <div className="ceo-loading">Loading your company…</div>}
      {screen === 'register' && <Register onDone={registered} onBack={home} onResume={() => setScreen('resume')} />}
      {screen === 'resume' && <Resume onDone={registered} onBack={() => setScreen('register')} />}
      {screen === 'pick' && <Pick mode={mode} onPick={pick} onBack={home} />}
      {screen === 'briefing' && game?.briefing && <BriefingScreen game={game} mode={mode} onStart={() => setScreen('play')} />}
      {screen === 'briefing' && game && !game.briefing && <Play key="p" game={game} mode={mode} onDecide={decide} onFinished={finished} />}
      {screen === 'play' && game && <Play key={`${game.business}-${mode}`} game={game} mode={mode} onDecide={decide} onFinished={finished} />}
      {screen === 'final' && game && <Final game={game} mode={mode} onDemoAgain={demo} onEnter={() => { setGame(null); enter() }} />}
    </div>
  )
}

