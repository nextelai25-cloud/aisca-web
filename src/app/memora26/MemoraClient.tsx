'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import {
  CalendarDays, Clock, MapPin, Ticket, Upload, FileText, X, CheckCircle2, Copy, Check,
  Music, Flame, UtensilsCrossed, Camera, AlertTriangle, ArrowLeft, ChevronRight, Sparkles, MessageCircle,
} from 'lucide-react'
import {
  MEMORA, MEMORA_BANK, MEMORA_AL_BATCHES, memoraSalesOpen, looksLikeNic, toLocalMobile, lkr,
} from '@/lib/memora'

// ── Night palette taken from the MEMORA '26 artwork ──
const C = {
  night: '#050817',
  navy: '#0B1230',
  gold: '#F2C14E',
  goldDeep: '#C8902E',
  amber: '#FF9F43',
  blue: '#5AA9E6',
  ink: '#F4F1E8',
  body: '#C5CAE0',
  muted: '#8C94B8',
  green: '#34D399',
}
const GOLD = `linear-gradient(100deg, #FFE3A1 0%, ${C.gold} 35%, ${C.goldDeep} 70%, #FFD98A 100%)`
const DISPLAY = "'Cinzel', 'Cormorant Garamond', Georgia, serif"
const SERIF = "'Cormorant Garamond', Georgia, serif"
const BODY = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
const ease = [0.22, 1, 0.36, 1] as const
const NIC_MSG = 'Please enter a valid NIC number (12 digits, or 9 digits followed by V or X).'

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.8, ease },
}

const NIGHT = [
  { icon: Sparkles, title: 'Games and activities', text: 'Team games and activities that turn a room of student leaders into one crew.' },
  { icon: Flame, title: 'Campfire, music and entertainment', text: 'As the sun sets, the music starts. Warm light, good songs and the people who made this year.' },
  { icon: UtensilsCrossed, title: 'Dinner together', text: 'Slow down, share a table and enjoy dinner with friends from schools across the island.' },
  { icon: Camera, title: 'Memories that stay', text: 'Every corner made for photos. Come for the night, leave with memories that never fade.' },
]

const STEPS = [
  { title: `Transfer ${lkr(MEMORA.price)}`, text: 'Deposit or transfer the ticket price to the account shown below.' },
  { title: 'Fill the form', text: 'Enter your details and upload a photo or screenshot of your receipt.' },
  { title: 'We verify', text: 'Our team checks every receipt by hand and emails you once your request is in.' },
  { title: 'Ticket by email and SMS', text: 'Once approved, your personal QR ticket comes to your email and phone. Show it at the entrance.' },
]

const GOOD_TO_KNOW = [
  `Tickets are ${lkr(MEMORA.price)} per person. Ticket sales close on ${MEMORA.salesCloseLabel}, and seats are limited, so get yours early.`,
  'After you buy, join the MEMORA \'26 WhatsApp group. All updates and reminders are shared there.',
  'One ticket admits one person. Each person fills the form separately.',
  'Your QR code works only once. After it is scanned at the entrance it cannot be used again, so please do not share it.',
  'Bring your NIC. The name and NIC number on your ticket may be checked at the entrance.',
  'Tickets are non refundable and non transferable.',
  `The night begins at ${MEMORA.timeLabel.replace(' onwards', '')} at ${MEMORA.venue}. Plan your ride home in advance.`,
]

type Uploaded = { url: string; filename: string }
const empty = { full_name: '', email: '', whatsapp: '', school: '', al_batch: '', nic: '' }

/* ── Floating lanterns ──
 * Positions come from a fixed seed so the server and browser draw the same
 * sky (no hydration mismatch). Pure CSS animation, paused for reduced motion. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
type L = { x: number; size: number; dur: number; delay: number; sway: number; blur: number; op: number }
function makeLanterns(n: number, seed: number, near = false): L[] {
  const r = seeded(seed)
  return Array.from({ length: n }, (_, i) => {
    const depth = r()
    // Near lanterns stay at the edges so they never cross the MEMORA logo.
    const x = near ? (i % 2 ? 84 + r() * 13 : r() * 13) : r() * 96
    return {
      x: Math.round(x * 10) / 10,
      size: Math.round((near ? 26 + depth * 30 : 9 + depth * 20) * 10) / 10,
      dur: Math.round((near ? 26 + r() * 16 : 34 + r() * 30) * 10) / 10,
      delay: -Math.round(r() * 60 * 10) / 10,
      sway: Math.round((10 + r() * 30) * 10) / 10,
      blur: near ? (depth < 0.35 ? 1.2 : 0) : Math.round((1 - depth) * 2.4 * 10) / 10,
      op: Math.round((near ? 0.75 + depth * 0.25 : 0.35 + depth * 0.5) * 100) / 100,
    }
  })
}
const SKY = makeLanterns(22, 15112026)
const HERO = makeLanterns(6, 2026, true)

function Lantern({ l }: { l: L }) {
  return (
    <span
      className="mm-lantern"
      style={{
        left: `${l.x}%`, width: l.size, height: l.size * 1.22, opacity: l.op,
        animationDuration: `${l.dur}s`, animationDelay: `${l.delay}s`,
        filter: l.blur ? `blur(${l.blur}px)` : undefined,
        ['--sway' as string]: `${l.sway}px`,
      } as React.CSSProperties}
    >
      <span className="mm-lantern-sway" style={{ animationDuration: `${6 + (l.sway % 5)}s` }}>
        <svg viewBox="0 0 40 49" aria-hidden>
          <defs>
            <linearGradient id="mmLg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#FFE9B8" />
              <stop offset="0.55" stopColor="#FFB547" />
              <stop offset="1" stopColor="#FF7A1A" />
            </linearGradient>
          </defs>
          <path d="M6 2 Q20 -1 34 2 L38 38 Q20 44 2 38 Z" fill="url(#mmLg)" />
          <path d="M14 3 L12 39 M26 3 L28 39" stroke="rgba(160,80,10,0.25)" strokeWidth="1" fill="none" />
          <ellipse cx="20" cy="41" rx="6" ry="3.2" fill="#FFF3C4" />
        </svg>
      </span>
    </span>
  )
}

/** Current time. Starts from the server's clock so the first paint matches, then ticks every second. */
function useNow(serverNow: number) {
  const [now, setNow] = useState(serverNow)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    const first = window.setTimeout(() => { setMounted(true); setNow(Date.now()) }, 0)
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => { window.clearTimeout(first); window.clearInterval(id) }
  }, [])
  return { now, mounted }
}

export default function MemoraClient({ serverNow }: { serverNow: number }) {
  const { now, mounted } = useNow(serverNow)
  const open = memoraSalesOpen(now)
  const started = now >= Date.parse(MEMORA.eventStartISO)
  const [f, setF] = useState({ ...empty })
  const [agree, setAgree] = useState(false)
  const [receipt, setReceipt] = useState<Uploaded | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<string | null>(null)
  const [copied, setCopied] = useState('')
  const [showBar, setShowBar] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const formTop = useRef<HTMLDivElement>(null)
  const ticketsRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  // Slow drift of the cover as the page scrolls
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '14%'])
  const heroFade = useTransform(scrollYProgress, [0, 0.9], [1, reduce ? 1 : 0.35])

  // Mobile bottom bar: visible after the hero, hidden while the ticket section is on screen.
  useEffect(() => {
    const el = ticketsRef.current
    let inTickets = false
    const onScroll = () => setShowBar(window.scrollY > 520 && !inTickets)
    const io = el ? new IntersectionObserver(([e]) => { inTickets = e.isIntersecting; onScroll() }, { rootMargin: '0px 0px -20% 0px' }) : null
    if (el && io) io.observe(el)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); io?.disconnect() }
  }, [])

  const set = (k: keyof typeof empty, v: string) => setF((p) => ({ ...p, [k]: v }))
  const phoneBad = f.whatsapp.replace(/\D/g, '').length >= 9 && !toLocalMobile(f.whatsapp)
  const nicBad = f.nic.trim().length >= 9 && !looksLikeNic(f.nic)

  function goTickets() {
    document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function copy(key: string, value: string) {
    const text = key === 'account' ? value.replace(/\s/g, '') : value
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(''), 1600)
    }).catch(() => {})
  }

  async function handleReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/memora/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) setReceipt({ url: data.url, filename: data.filename || file.name })
      else setError(data.error || 'Receipt upload failed. Please try again.')
    } catch {
      setError('Receipt upload failed. Check your connection and try again.')
    } finally {
      setUploading(false)
    }
  }

  function fail(msg: string) {
    setError(msg)
    formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function submit() {
    setError('')
    if (!f.full_name.trim()) return fail('Please enter your full name.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) return fail('Please enter a valid email address.')
    if (!toLocalMobile(f.whatsapp)) return fail('Please enter a valid mobile number, for example 077 123 4567. Your ticket is sent to it by SMS.')
    if (!looksLikeNic(f.nic)) return fail(NIC_MSG)
    if (!f.school.trim()) return fail('Please enter your school.')
    if (!f.al_batch) return fail('Please choose your A/L batch.')
    if (!receipt) return fail('Please upload your bank receipt.')
    if (!agree) return fail('Please tick the box to confirm the ticket terms.')

    setSubmitting(true)
    try {
      const res = await fetch('/api/memora/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, receipt_url: receipt.url, receipt_filename: receipt.filename, agree }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setDone(data.ticketNumber)
        setTimeout(() => formTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
      } else {
        fail(data.error || 'Could not submit. Please try again.')
      }
    } catch {
      fail('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mm-root">
      {/* Night sky with drifting lanterns */}
      <div className="mm-sky" aria-hidden>
        <div className="mm-stars" />
        <div className="mm-glow" />
        {SKY.map((l, i) => <Lantern key={i} l={l} />)}
      </div>

      {/* ── Floating glass nav ── */}
      <div className="mm-nav-wrap">
        <nav className="mm-glass mm-nav">
          <Link href="/" className="mm-nav-logo" aria-label="AISCA home">
            <img src="/aisca-original.png" alt="AISCA" className="mm-logo-img" />
          </Link>
          <div className="mm-nav-right">
            <Link href="/" className="mm-nav-link"><ArrowLeft size={14} /> <span>aisca.lk</span></Link>
            <button type="button" onClick={goTickets} className="mm-btn mm-btn-sm">Tickets</button>
          </div>
        </nav>
      </div>

      <main className="mm-main">
        {/* ── Hero: the cover art, never cropped through the logo ── */}
        <div ref={heroRef} className="mm-hero">
          <motion.div className="mm-hero-art" style={{ y: heroY, opacity: heroFade }}>
            <motion.div initial={{ scale: 1.08, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2.2, ease }} className="mm-hero-zoom">
              <picture>
                <source media="(max-width: 700px)" srcSet="/memora/cover-square.webp" />
                <img src="/memora/cover-wide.webp" alt="MEMORA '26, A Day to Remember, by AISCA" className="mm-hero-img" />
              </picture>
            </motion.div>
          </motion.div>
          <div className="mm-hero-lanterns" aria-hidden>{HERO.map((l, i) => <Lantern key={i} l={l} />)}</div>
          <div className="mm-hero-fade" aria-hidden />
        </div>

        {/* ── Intro panel ── */}
        <div className="mm-wrap mm-intro-wrap">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5, ease }} className="mm-glass mm-intro">
            <span className="mm-eyebrow">AISCA presents</span>
            <h1 className="mm-h1">The date is locked. <span className="mm-gold">The vibe is matched.</span></h1>
            <p className="mm-lead">The most awaited night of the year is here.</p>
            <p className="mm-body mm-caption">
              This is not just an event, this is an experience. Get ready to make memories that will never fade.
            </p>

            <div className="mm-facts">
              {[
                { icon: CalendarDays, label: 'Date', value: MEMORA.dateShort, sub: MEMORA.dayName },
                { icon: Clock, label: 'Time', value: '4.00 PM', sub: 'onwards' },
                { icon: MapPin, label: 'Venue', value: 'Rock House', sub: 'Piliyandala' },
                { icon: Ticket, label: 'Ticket', value: lkr(MEMORA.price), sub: 'per person' },
              ].map((x) => (
                <div key={x.label} className="mm-fact">
                  <span className="mm-fact-icon"><x.icon size={17} strokeWidth={2.1} /></span>
                  <span className="mm-fact-label">{x.label}</span>
                  <span className="mm-fact-value">{x.value}</span>
                  <span className="mm-fact-sub">{x.sub}</span>
                </div>
              ))}
            </div>

            {!started && (
              <div className="mm-cd-wrap">
                <div className="mm-cd-title">The night begins in</div>
                <Countdown to={MEMORA.eventStartISO} now={now} mounted={mounted} />
              </div>
            )}

            <div className="mm-cta-row">
              <button type="button" onClick={goTickets} className="mm-btn">{open ? 'Get your ticket' : 'Ticket details'} <ChevronRight size={18} /></button>
              <span className="mm-limited"><span className="mm-pulse" /> {open ? `Ticket sales close ${MEMORA.salesCloseLabel}` : 'Ticket sales are closed'}</span>
            </div>
          </motion.div>
        </div>

        {/* ── The night ── */}
        <div className="mm-block">
          <motion.div {...fadeUp} className="mm-wrap mm-center mm-head">
            <span className="mm-eyebrow">What is waiting for you</span>
            <h2 className="mm-h2">An evening under the lanterns</h2>
          </motion.div>
          <div className="mm-scroller" role="list">
            {NIGHT.map((x, i) => (
              <motion.div role="listitem" key={x.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }} className="mm-glass mm-exp">
                <span className="mm-exp-icon"><x.icon size={20} strokeWidth={2} /></span>
                <div className="mm-card-title">{x.title}</div>
                <div className="mm-small">{x.text}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="mm-block mm-wrap">
          <motion.div {...fadeUp} className="mm-center mm-head">
            <span className="mm-eyebrow">How to get your ticket</span>
            <h2 className="mm-h2">Four simple steps</h2>
          </motion.div>
          <div className="mm-steps">
            {STEPS.map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.07 }} className="mm-glass mm-step">
                <span className="mm-step-no">{i + 1}</span>
                <div>
                  <div className="mm-card-title">{s.title}</div>
                  <div className="mm-small">{s.text}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Tickets ── */}
        <div id="tickets" ref={ticketsRef} className="mm-block mm-wrap mm-anchor">
          <motion.div {...fadeUp} className="mm-center mm-head">
            <span className="mm-eyebrow">Tickets</span>
            <h2 className="mm-h2">Reserve your night</h2>
            <p className="mm-body mm-sub">
              {lkr(MEMORA.price)} per person. Pay by bank transfer, upload the receipt, and your QR ticket comes to your email and phone once we confirm the payment. Ticket sales close on {MEMORA.salesCloseLabel}.
            </p>
            <p className="mm-onlyone">Each ticket admits one person only. Coming with friends? Every person needs their own ticket, bought with their own form.</p>
          </motion.div>

          <div className="mm-ticket-grid">
            {/* Step 1: Pay */}
            <motion.div {...fadeUp} className="mm-glass mm-card mm-pay">
              <div className="mm-step-tag">Step 1</div>
              <div className="mm-card-h">Pay {lkr(MEMORA.price)}</div>
              <p className="mm-small" style={{ margin: '0 0 16px' }}>Transfer or deposit to this account. If your bank lets you add a reference, please use your name.</p>
              <div className="mm-bank">
                {([
                  ['Account No', MEMORA_BANK.account, 'account'],
                  ['Account Name', MEMORA_BANK.name, 'name'],
                  ['Bank', MEMORA_BANK.bank, ''],
                  ['Branch', MEMORA_BANK.branch, ''],
                ] as [string, string, string][]).map(([k, v, key]) => (
                  <div key={k} className="mm-bank-row">
                    <div style={{ minWidth: 0 }}>
                      <div className="mm-label-xs">{k}</div>
                      <div className={key === 'account' ? 'mm-bank-acc' : 'mm-bank-val'}>{v}</div>
                    </div>
                    {key && (
                      <button type="button" onClick={() => copy(key, v)} aria-label={`Copy ${k}`} className={`mm-copy ${copied === key ? 'is-done' : ''}`}>
                        {copied === key ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <WhatsAppBox text="Whether you have just filled the form or already have your ticket, please join. All updates are shared here." />
              <div className="mm-ticket-peek" aria-hidden>
                <img src="/memora/ticket-bg.webp" alt="" />
              </div>
            </motion.div>

            {/* Step 2: Form / success */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="mm-glass mm-card mm-anchor" ref={formTop}>
              {done ? (
                <SuccessCard ticketNumber={done} email={f.email} phone={toLocalMobile(f.whatsapp) || f.whatsapp} />
              ) : !open ? (
                <div className="mm-center" style={{ padding: '26px 6px' }}>
                  <div className="mm-card-h">Online sales are closed</div>
                  <p className="mm-body">Thank you for the amazing response. Ticket sales for MEMORA &apos;26 closed on {MEMORA.salesCloseLabel}. Already have a ticket? Join the WhatsApp group for updates. For help, message {MEMORA.helpWhatsappLabel}.</p>
                  <div style={{ marginTop: 18 }}><WhatsAppBox text="All MEMORA '26 updates and reminders are shared here." /></div>
                </div>
              ) : (
                <>
                  <div className="mm-step-tag">Step 2</div>
                  <div className="mm-card-h">Your details</div>
                  <p className="mm-small" style={{ margin: '0 0 18px' }}>This ticket is for one person only: the person whose details you enter here. Every field is required.</p>

                  {error && (
                    <div role="alert" className="mm-alert"><AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 1 }} /> <span>{error}</span></div>
                  )}

                  <div className="mm-form">
                    <Field label="Full name" hint="As it appears on your NIC" full>
                      <input className="mm-input" value={f.full_name} onChange={(e) => set('full_name', e.target.value)} autoComplete="name" maxLength={200} placeholder="e.g. Kavindi Perera" />
                    </Field>

                    <div className="mm-email-box mm-full">
                      <div className="mm-email-note">
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span><strong>Please type these two carefully.</strong> Your QR ticket is sent to both your email and your phone (by SMS). If either one is wrong, your ticket may not reach you.</span>
                      </div>
                      <div className="mm-form" style={{ gap: 12 }}>
                        <Field label="Email address">
                          <input className="mm-input" type="email" inputMode="email" autoComplete="email" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
                        </Field>
                        <Field label="Phone number" hint={phoneBad ? undefined : 'A mobile number that can receive SMS'}>
                          <input className={`mm-input ${phoneBad ? 'is-bad' : ''}`} type="tel" inputMode="tel" autoComplete="tel" value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="07X XXX XXXX" maxLength={20} />
                          {phoneBad && <span className="mm-err-text">Please enter a Sri Lankan mobile number, like 077 123 4567.</span>}
                        </Field>
                      </div>
                    </div>

                    <Field label="NIC number" hint={nicBad ? undefined : '12 digits, or 9 digits followed by V or X'}>
                      <input className={`mm-input ${nicBad ? 'is-bad' : ''}`} autoCapitalize="characters" autoCorrect="off" spellCheck={false} value={f.nic} onChange={(e) => set('nic', e.target.value.toUpperCase())} placeholder="e.g. 200712345678" maxLength={14} />
                      {nicBad && <span className="mm-err-text">That does not look like a valid NIC number.</span>}
                    </Field>
                    <Field label="A/L batch">
                      <select className="mm-input mm-select" value={f.al_batch} onChange={(e) => set('al_batch', e.target.value)}>
                        <option value="">Choose your batch</option>
                        {MEMORA_AL_BATCHES.map((b) => <option key={b} value={b}>{/^\d+$/.test(b) ? `${b} A/L batch` : b}</option>)}
                      </select>
                    </Field>
                    <Field label="School" full>
                      <input className="mm-input" value={f.school} onChange={(e) => set('school', e.target.value)} placeholder="Your school" maxLength={200} />
                    </Field>

                    <Field label="Bank receipt" hint="A clear photo, screenshot or PDF of your payment slip" full>
                      <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleReceipt} style={{ display: 'none' }} />
                      {receipt ? (
                        <div className="mm-file">
                          <FileText size={18} color={C.green} style={{ flexShrink: 0 }} />
                          <span className="mm-file-name">{receipt.filename}</span>
                          <button type="button" onClick={() => setReceipt(null)} aria-label="Remove receipt" className="mm-icon-btn"><X size={17} /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="mm-upload">
                          <Upload size={22} />
                          <span className="mm-upload-title">{uploading ? 'Uploading your receipt...' : 'Tap to upload your receipt'}</span>
                          <span className="mm-upload-sub">JPG, PNG, HEIC or PDF, up to 15 MB</span>
                        </button>
                      )}
                    </Field>
                  </div>

                  <label className="mm-check">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span>I confirm my details are correct. I understand the ticket is non refundable and non transferable, and the QR code allows one entry only.</span>
                  </label>

                  <button type="button" onClick={submit} disabled={submitting || uploading} className="mm-btn mm-btn-block" style={{ opacity: submitting || uploading ? 0.6 : 1 }}>
                    {submitting ? 'Submitting...' : 'Submit ticket request'}
                  </button>
                  <p className="mm-help">
                    Need help? WhatsApp{' '}
                    {MEMORA.helpContacts.map((c, i) => (
                      <span key={c.whatsapp}>
                        {i > 0 && ' or '}
                        <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer">{c.name} {c.label}</a>
                      </span>
                    ))}
                  </p>
                </>
              )}
            </motion.div>
          </div>
        </div>

        {/* ── Good to know ── */}
        <div className="mm-block mm-wrap mm-narrow">
          <motion.div {...fadeUp} className="mm-center mm-head">
            <span className="mm-eyebrow">Good to know</span>
            <h2 className="mm-h2">Before you come</h2>
          </motion.div>
          <motion.div {...fadeUp} className="mm-glass mm-card mm-list">
            {GOOD_TO_KNOW.map((t) => (
              <div key={t} className="mm-list-row">
                <span className="mm-dot" />
                <span>{t}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Closing ── */}
        <div className="mm-block mm-wrap mm-narrow mm-center mm-closing">
          <motion.div {...fadeUp}>
            <div className="mm-closing-mark" aria-hidden><Music size={18} /></div>
            <p className="mm-closing-quote">A day to remember.</p>
            <p className="mm-closing-text">{MEMORA.dateLabel}<br />{MEMORA.timeLabel} · {MEMORA.venue}</p>
            <button type="button" onClick={goTickets} className="mm-btn">{open ? 'Get your ticket' : 'Ticket details'} <ChevronRight size={18} /></button>
          </motion.div>
        </div>
      </main>

      <footer className="mm-footer">
        <div className="mm-footer-bar" />
        <div className="mm-wrap mm-footer-inner">
          <span>MEMORA &apos;26 is organised by the All Island Schools Commerce Association.</span>
          <Link href="/">aisca.lk</Link>
        </div>
      </footer>

      {/* ── Mobile bottom ticket bar ── */}
      {!done && open && (
        <div className={`mm-bottom ${showBar ? 'is-on' : ''}`} aria-hidden={!showBar}>
          <div className="mm-glass mm-bottom-inner">
            <div className="mm-bottom-text">
              <span className="mm-bottom-price">{lkr(MEMORA.price)}</span>
              <span className="mm-bottom-sub">{MEMORA.dateShort} · Rock House</span>
            </div>
            <button type="button" onClick={goTickets} className="mm-btn mm-btn-sm" tabIndex={showBar ? 0 : -1}>Get ticket</button>
          </div>
        </div>
      )}

      <style>{`
        .mm-root { position: relative; min-height: 100vh; font-family: ${BODY}; color: ${C.body}; background: ${C.night}; overflow: hidden; -webkit-font-smoothing: antialiased; }
        .mm-root ::selection { background: rgba(242,193,78,0.3); color: #fff; }
        .mm-root a, .mm-root button, .mm-root input, .mm-root select { min-height: 0; }

        /* sky */
        .mm-sky { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
          background: radial-gradient(120% 70% at 50% 110%, #4A2508 0%, #1A0F14 38%, transparent 70%), linear-gradient(180deg, #03050F 0%, #081032 45%, #0B0D24 75%, #140B0A 100%); }
        .mm-stars { position: absolute; inset: -10%; opacity: .55;
          background-image: radial-gradient(1px 1px at 12% 18%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 72% 12%, #fff 50%, transparent 51%), radial-gradient(1.4px 1.4px at 38% 32%, #FFE8B0 50%, transparent 51%),
            radial-gradient(1px 1px at 86% 44%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 24% 64%, #fff 50%, transparent 51%), radial-gradient(1.2px 1.2px at 58% 58%, #CFE3FF 50%, transparent 51%),
            radial-gradient(1px 1px at 6% 86%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 92% 80%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 46% 8%, #fff 50%, transparent 51%);
          background-size: 420px 420px; animation: mm-twinkle 7s ease-in-out infinite alternate; }
        .mm-glow { position: absolute; left: 50%; bottom: -30vh; width: 120vw; height: 60vh; transform: translateX(-50%); background: radial-gradient(closest-side, rgba(255,150,50,0.22), transparent); filter: blur(20px); }
        @keyframes mm-twinkle { from { opacity: .35; } to { opacity: .7; } }

        .mm-lantern { position: absolute; bottom: -12vh; display: block; animation-name: mm-rise; animation-timing-function: linear; animation-iteration-count: infinite; will-change: transform; }
        .mm-lantern-sway { display: block; width: 100%; height: 100%; animation: mm-sway ease-in-out infinite alternate; }
        .mm-lantern svg { width: 100%; height: 100%; display: block; overflow: visible; filter: drop-shadow(0 0 6px rgba(255,170,60,0.9)) drop-shadow(0 0 18px rgba(255,120,30,0.55)); }
        @keyframes mm-rise { 0% { transform: translate3d(0, 0, 0); opacity: 0; } 8% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translate3d(0, -128vh, 0); opacity: 0; } }
        @keyframes mm-sway { from { transform: translateX(calc(var(--sway) * -0.5)) rotate(-4deg); } to { transform: translateX(calc(var(--sway) * 0.5)) rotate(4deg); } }
        @media (prefers-reduced-motion: reduce) {
          .mm-lantern, .mm-lantern-sway, .mm-stars, .mm-pulse { animation: none !important; }
          .mm-lantern { display: none; }
        }

        /* glass */
        .mm-glass { position: relative; background: linear-gradient(160deg, rgba(22,30,68,0.62), rgba(10,14,36,0.55)); border: 1px solid rgba(255,255,255,0.09);
          -webkit-backdrop-filter: blur(20px) saturate(140%); backdrop-filter: blur(20px) saturate(140%);
          box-shadow: 0 24px 60px -30px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.08); }
        .mm-glass::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; pointer-events: none;
          background: linear-gradient(140deg, rgba(242,193,78,0.55), rgba(242,193,78,0) 30%, rgba(90,169,230,0) 70%, rgba(90,169,230,0.35));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
        .mm-glass > * { position: relative; }

        /* layout */
        .mm-main { position: relative; z-index: 1; }
        .mm-wrap { max-width: 1120px; margin: 0 auto; padding-left: 20px; padding-right: 20px; }
        .mm-narrow { max-width: 820px; }
        .mm-center { text-align: center; }
        .mm-block { padding-top: 96px; }
        .mm-head { margin-bottom: 30px; }
        .mm-anchor { scroll-margin-top: 92px; }

        /* nav */
        .mm-nav-wrap { position: fixed; top: 12px; left: 0; right: 0; z-index: 50; padding: 0 12px; }
        .mm-nav { max-width: 1120px; margin: 0 auto; height: 58px; border-radius: 999px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px 0 22px; background: rgba(8,12,32,0.55); }
        .mm-nav-logo { display: flex; align-items: center; }
        .mm-root img.mm-logo-img { width: 112px !important; height: auto !important; display: block; }
        .mm-nav-right { display: flex; align-items: center; gap: 6px; }
        .mm-nav-link { display: inline-flex; align-items: center; gap: 5px; padding: 9px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; color: ${C.ink}; text-decoration: none; }
        .mm-nav-link:hover { background: rgba(255,255,255,0.06); }

        /* hero */
        .mm-hero { position: relative; width: 100%; aspect-ratio: 16 / 9; max-height: 94vh; overflow: hidden;
          -webkit-mask-image: linear-gradient(180deg, #000 0%, #000 60%, transparent 100%); mask-image: linear-gradient(180deg, #000 0%, #000 60%, transparent 100%); }
        .mm-hero-art, .mm-hero-zoom { position: absolute; inset: 0; }
        .mm-root img.mm-hero-img { width: 100% !important; height: 100% !important; object-fit: cover; object-position: 50% 45%; display: block; max-width: none !important; }
        .mm-hero-lanterns { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .mm-hero-lanterns .mm-lantern { bottom: -10%; }
        .mm-hero-fade { position: absolute; inset: auto 0 0 0; height: 30%; background: linear-gradient(180deg, transparent, rgba(5,8,23,0.35)); pointer-events: none; }

        .mm-intro-wrap { margin-top: -12vh; position: relative; z-index: 2; }
        .mm-intro { max-width: 900px; margin: 0 auto; padding: 40px 36px 34px; border-radius: 34px; text-align: center; }

        /* type */
        .mm-eyebrow { display: inline-block; font-size: 11.5px; letter-spacing: 0.32em; text-transform: uppercase; font-weight: 700; color: ${C.gold}; }
        .mm-h1 { font-family: ${DISPLAY}; font-weight: 600; font-size: clamp(1.9rem, 5.2vw, 3.2rem); line-height: 1.12; letter-spacing: 0.01em; color: ${C.ink}; margin: 14px 0 12px; }
        .mm-h2 { font-family: ${DISPLAY}; font-weight: 600; font-size: clamp(1.7rem, 4.4vw, 2.6rem); line-height: 1.12; color: ${C.ink}; margin: 10px 0 0; }
        .mm-gold { background: ${GOLD}; background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: mm-sheen 6s ease-in-out infinite alternate; }
        @keyframes mm-sheen { from { background-position: 0% 0; } to { background-position: 100% 0; } }
        .mm-lead { font-family: ${SERIF}; font-style: italic; font-weight: 500; font-size: clamp(1.3rem, 3.4vw, 1.7rem); color: #E9DDBF; margin: 0 0 10px; }
        .mm-body { font-size: 16px; line-height: 1.75; color: ${C.body}; margin: 0; }
        .mm-caption { max-width: 560px; margin: 0 auto; }
        .mm-sub { max-width: 580px; margin: 12px auto 0; font-size: 15px; }
        .mm-small { font-size: 14px; line-height: 1.65; color: ${C.body}; }
        .mm-card-title { font-family: ${DISPLAY}; font-weight: 600; font-size: 17px; line-height: 1.25; color: ${C.ink}; margin-bottom: 7px; letter-spacing: .02em; }
        .mm-card-h { font-family: ${DISPLAY}; font-weight: 600; font-size: 23px; line-height: 1.2; color: ${C.ink}; margin: 10px 0 6px; }
        .mm-label-xs { font-size: 10.5px; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.muted}; font-weight: 700; }

        /* facts */
        .mm-facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 30px; }
        .mm-fact { display: flex; flex-direction: column; align-items: center; padding: 16px 8px 14px; border-radius: 22px; background: rgba(255,255,255,0.035); border: 1px solid rgba(255,255,255,0.07); }
        .mm-fact-icon { width: 34px; height: 34px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: ${C.gold}; background: rgba(242,193,78,0.1); }
        .mm-fact-label { font-size: 10.5px; letter-spacing: 0.2em; text-transform: uppercase; color: ${C.muted}; font-weight: 700; margin-top: 10px; }
        .mm-fact-value { font-family: ${DISPLAY}; font-weight: 700; font-size: 19px; line-height: 1.2; margin-top: 4px; color: ${C.ink}; }
        .mm-fact-sub { font-size: 12.5px; color: ${C.muted}; }

        /* countdown */
        .mm-cd-wrap { margin-top: 26px; }
        .mm-cd-title { font-family: ${SERIF}; font-style: italic; font-size: 19px; color: #E9DDBF; margin-bottom: 12px; }
        .mm-cd { display: flex; justify-content: center; gap: 10px; }
        .mm-cd-cell { display: flex; flex-direction: column; align-items: center; min-width: 76px; padding: 12px 8px 10px; border-radius: 18px; background: rgba(242,193,78,0.06); border: 1px solid rgba(242,193,78,0.22); }
        .mm-cd-num { font-family: ${DISPLAY}; font-weight: 700; font-size: 32px; line-height: 1; color: ${C.gold}; font-variant-numeric: tabular-nums; }
        .mm-cd-lbl { font-size: 10px; letter-spacing: .2em; text-transform: uppercase; font-weight: 700; color: ${C.muted}; margin-top: 6px; }

        /* buttons */
        .mm-cta-row { display: flex; flex-wrap: wrap; gap: 14px 18px; justify-content: center; align-items: center; margin-top: 28px; }
        .mm-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 15px 30px; border-radius: 999px; border: none; cursor: pointer; color: #1A1206; text-decoration: none;
          background: ${GOLD}; background-size: 200% 100%; font-family: ${DISPLAY}; font-weight: 700; font-size: 15.5px; letter-spacing: .06em;
          box-shadow: 0 14px 34px -12px rgba(242,193,78,0.6), inset 0 1px 0 rgba(255,255,255,0.6); transition: background-position .6s ease, transform .15s ease, box-shadow .3s; -webkit-tap-highlight-color: transparent; }
        .mm-btn:hover { background-position: 100% 0; box-shadow: 0 18px 40px -12px rgba(242,193,78,0.75), inset 0 1px 0 rgba(255,255,255,0.6); }
        .mm-btn:active { transform: scale(.97); }
        .mm-btn-sm { padding: 10px 18px; font-size: 13.5px; }
        .mm-btn-block { width: 100%; margin-top: 22px; padding: 17px 20px; }
        .mm-limited { display: inline-flex; align-items: center; gap: 9px; font-size: 13px; font-weight: 600; color: #E9DDBF; letter-spacing: .04em; }
        .mm-pulse { width: 8px; height: 8px; border-radius: 50%; background: ${C.amber}; box-shadow: 0 0 0 0 rgba(255,159,67,0.7); animation: mm-pulse 1.8s ease-out infinite; }
        @keyframes mm-pulse { 0% { box-shadow: 0 0 0 0 rgba(255,159,67,0.6); } 100% { box-shadow: 0 0 0 12px rgba(255,159,67,0); } }

        /* night */
        .mm-scroller { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; max-width: 1120px; margin: 0 auto; padding: 4px 20px 10px; }
        .mm-exp { padding: 24px 22px; border-radius: 26px; transition: transform .4s cubic-bezier(.22,1,.36,1); }
        .mm-exp:hover { transform: translateY(-4px); }
        .mm-exp-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; color: ${C.gold}; background: radial-gradient(circle at 50% 60%, rgba(255,159,67,0.28), rgba(242,193,78,0.06)); box-shadow: 0 0 24px -6px rgba(255,159,67,0.6); }

        /* steps */
        .mm-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .mm-step { display: flex; flex-direction: column; gap: 14px; padding: 24px 22px; border-radius: 26px; }
        .mm-step-no { width: 38px; height: 38px; flex-shrink: 0; border-radius: 50%; color: #1A1206; background: ${GOLD}; font-family: ${DISPLAY}; font-weight: 700; font-size: 17px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 22px -4px rgba(242,193,78,0.7); }

        /* tickets */
        .mm-onlyone { margin: 16px auto 0; max-width: 560px; padding: 12px 16px; border-radius: 16px; background: rgba(90,169,230,0.1); border: 1px solid rgba(90,169,230,0.25); color: #BFDDF6; font-size: 14px; line-height: 1.6; font-weight: 600; }
        .mm-ticket-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 18px; align-items: start; }
        .mm-card { padding: 28px 26px; border-radius: 30px; }
        .mm-step-tag { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; padding: 5px 12px; border-radius: 999px; color: ${C.gold}; background: rgba(242,193,78,0.12); }
        .mm-bank { display: flex; flex-direction: column; gap: 8px; }
        .mm-bank-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; border-radius: 18px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); }
        .mm-bank-acc { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 19px; font-weight: 800; color: ${C.gold}; letter-spacing: .04em; }
        .mm-bank-val { font-size: 14px; font-weight: 600; color: ${C.ink}; word-break: break-word; }
        .mm-copy { flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px; padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color: ${C.ink}; font-size: 12.5px; font-weight: 700; cursor: pointer; }
        .mm-copy.is-done { background: rgba(52,211,153,0.14); color: ${C.green}; border-color: rgba(52,211,153,0.4); }
        .mm-ticket-peek { margin: 22px auto 0; width: min(210px, 62%); transform: rotate(-4deg); animation: mm-float 7s ease-in-out infinite alternate; filter: drop-shadow(0 26px 30px rgba(0,0,0,0.6)) drop-shadow(0 0 30px rgba(242,160,60,0.18)); }
        .mm-root .mm-ticket-peek img { width: 100% !important; height: auto !important; display: block; }
        @keyframes mm-float { from { transform: rotate(-4deg) translateY(0); } to { transform: rotate(-2deg) translateY(-10px); } }

        .mm-wa { margin-top: 16px; padding: 16px; border-radius: 20px; background: rgba(37,211,102,0.08); border: 1px solid rgba(37,211,102,0.3); }
        .mm-wa-title { font-weight: 700; color: #BBF7D0; font-size: 14.5px; margin-bottom: 4px; }
        .mm-wa-text { font-size: 13px; line-height: 1.6; color: #A7C7B4; margin-bottom: 12px; }
        .mm-wa-btn { display: inline-flex; align-items: center; gap: 7px; background: #25D366; color: #fff; padding: 10px 18px; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 8px 18px -8px rgba(37,211,102,0.8); }

        /* form */
        .mm-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .mm-full { grid-column: 1 / -1; }
        .mm-field-label { display: block; font-size: 13.5px; font-weight: 700; color: ${C.ink}; margin-bottom: 7px; }
        .mm-hint { display: block; font-size: 12.5px; color: ${C.muted}; margin-top: 6px; }
        .mm-err-text { display: block; font-size: 12.5px; color: #FCA5A5; margin-top: 6px; font-weight: 600; }
        .mm-input { width: 100%; height: 52px; padding: 0 16px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.12); background-color: rgba(4,7,22,0.55); color: ${C.ink}; font-size: 16px; font-family: ${BODY};
          outline: none; transition: border-color .2s, box-shadow .2s, background-color .2s; -webkit-appearance: none; appearance: none; color-scheme: dark; }
        .mm-input::placeholder { color: #69719A; }
        .mm-input:focus { border-color: ${C.gold}; background-color: rgba(4,7,22,0.8); box-shadow: 0 0 0 4px rgba(242,193,78,0.16); }
        .mm-input.is-bad { border-color: #F87171; background-color: rgba(80,10,20,0.35); }
        .mm-select { padding-right: 40px; background-image: linear-gradient(45deg, transparent 50%, ${C.muted} 50%), linear-gradient(135deg, ${C.muted} 50%, transparent 50%); background-position: calc(100% - 22px) 52%, calc(100% - 16px) 52%; background-size: 6px 6px; background-repeat: no-repeat; cursor: pointer; }
        .mm-select option { background: ${C.navy}; color: ${C.ink}; }
        .mm-email-box { padding: 16px; border-radius: 22px; background: rgba(242,193,78,0.07); border: 1px solid rgba(242,193,78,0.28); }
        .mm-email-note { display: flex; gap: 9px; align-items: flex-start; margin-bottom: 12px; font-size: 13.5px; line-height: 1.55; color: #F3D99A; }
        .mm-upload { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 22px 14px; border-radius: 20px; border: 1.5px dashed rgba(242,193,78,0.45); background: rgba(242,193,78,0.05); color: ${C.gold}; cursor: pointer; font-family: ${BODY}; transition: background .2s; }
        .mm-upload:hover { background: rgba(242,193,78,0.09); }
        .mm-upload-title { font-weight: 700; color: ${C.ink}; font-size: 15px; }
        .mm-upload-sub { font-size: 12.5px; color: ${C.muted}; }
        .mm-file { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 18px; background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.35); min-width: 0; }
        .mm-file-name { font-size: 14px; color: ${C.ink}; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }
        .mm-icon-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: none; background: rgba(255,255,255,0.08); border-radius: 50%; color: ${C.body}; cursor: pointer; flex-shrink: 0; }
        .mm-check { display: flex; gap: 12px; align-items: flex-start; margin-top: 20px; cursor: pointer; font-size: 14px; line-height: 1.6; color: ${C.body}; }
        .mm-check input { width: 22px; height: 22px; margin-top: 1px; accent-color: ${C.gold}; flex-shrink: 0; }
        .mm-alert { display: flex; gap: 10px; align-items: flex-start; padding: 13px 15px; border-radius: 18px; background: rgba(127,29,29,0.35); border: 1px solid rgba(248,113,113,0.45); color: #FECACA; font-size: 14px; line-height: 1.55; margin-bottom: 18px; }
        .mm-help { text-align: center; font-size: 13px; color: ${C.muted}; margin: 14px 0 0; }
        .mm-help a { color: ${C.gold}; font-weight: 700; text-decoration: none; }

        /* list */
        .mm-list { padding: 8px 24px; }
        .mm-list-row { display: flex; gap: 14px; padding: 15px 0; font-size: 15px; line-height: 1.62; color: ${C.body}; }
        .mm-list-row + .mm-list-row { border-top: 1px solid rgba(255,255,255,0.07); }
        .mm-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 9px; flex-shrink: 0; background: ${C.gold}; box-shadow: 0 0 10px 2px rgba(242,193,78,0.5); }

        /* closing + footer */
        .mm-closing { padding-bottom: 110px; }
        .mm-closing-mark { width: 46px; height: 46px; margin: 0 auto 14px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${C.gold}; border: 1px solid rgba(242,193,78,0.35); }
        .mm-closing-quote { font-family: ${DISPLAY}; font-weight: 600; font-size: clamp(2rem, 6vw, 3.4rem); line-height: 1.1; margin: 0 0 14px; background: ${GOLD}; -webkit-background-clip: text; background-clip: text; color: transparent; letter-spacing: .02em; }
        .mm-closing-text { font-family: ${SERIF}; font-size: clamp(1.15rem, 3vw, 1.45rem); line-height: 1.45; color: #E9DDBF; margin: 0 0 26px; }
        .mm-footer { position: relative; z-index: 1; background: rgba(3,5,15,0.7); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); border-top: 1px solid rgba(255,255,255,0.06); }
        .mm-footer-bar { height: 2px; background: ${GOLD}; opacity: .8; }
        .mm-footer-inner { display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center; padding-top: 20px; padding-bottom: 22px; font-size: 12.5px; color: ${C.muted}; }
        .mm-footer-inner a { color: ${C.gold}; font-weight: 700; text-decoration: none; }

        .mm-bottom { display: none; }

        @media (max-width: 980px) {
          .mm-scroller { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; gap: 12px; padding: 4px 20px 14px; scroll-padding-left: 20px; }
          .mm-scroller::-webkit-scrollbar { display: none; }
          .mm-exp { flex: 0 0 min(72%, 300px); scroll-snap-align: start; }
          .mm-steps { grid-template-columns: repeat(2, 1fr); }
          .mm-ticket-grid { grid-template-columns: 1fr; }
          .mm-ticket-peek { display: none; }
        }
        @media (max-width: 700px) {
          .mm-hero { aspect-ratio: 1 / 1; max-height: none; }
          .mm-intro-wrap { margin-top: -18vw; }
        }
        @media (max-width: 640px) {
          .mm-wrap { padding-left: 16px; padding-right: 16px; }
          .mm-nav { height: 54px; padding: 0 6px 0 16px; }
          .mm-root img.mm-logo-img { width: 96px !important; }
          .mm-nav-link span { display: none; }
          .mm-nav-link { padding: 9px 10px; }
          .mm-intro { padding: 28px 16px 24px; border-radius: 28px; }
          .mm-block { padding-top: 72px; }
          .mm-facts { grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 24px; }
          .mm-fact-value { font-size: 17px; }
          .mm-cd { gap: 7px; }
          .mm-cd-cell { min-width: 0; flex: 1; padding: 10px 4px 8px; border-radius: 15px; }
          .mm-cd-num { font-size: 26px; }
          .mm-cta-row { flex-direction: column; align-items: stretch; }
          .mm-cta-row .mm-btn { justify-content: center; }
          .mm-limited { justify-content: center; }
          .mm-scroller { padding-left: 16px; padding-right: 16px; scroll-padding-left: 16px; }
          .mm-exp { flex-basis: 80%; }
          .mm-steps { grid-template-columns: 1fr; gap: 10px; }
          .mm-step { flex-direction: row; align-items: flex-start; gap: 14px; padding: 18px; border-radius: 22px; }
          .mm-card { padding: 22px 16px; border-radius: 26px; }
          .mm-form { grid-template-columns: 1fr; gap: 16px; }
          .mm-email-box { padding: 14px; }
          .mm-list { padding: 4px 16px; }
          .mm-list-row { font-size: 14.5px; }
          .mm-bank-acc { font-size: 17px; }
          .mm-closing { padding-bottom: 120px; }
          .mm-footer-inner { padding-bottom: 96px; }
          .mm-bottom { display: block; position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; padding: 0 12px calc(12px + env(safe-area-inset-bottom)); transform: translateY(140%); transition: transform .4s cubic-bezier(.22,1,.36,1); pointer-events: none; }
          .mm-bottom.is-on { transform: translateY(0); pointer-events: auto; }
          .mm-bottom-inner { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 8px 8px 20px; border-radius: 999px; background: rgba(8,12,32,0.75); }
          .mm-bottom-text { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
          .mm-bottom-price { font-family: ${DISPLAY}; font-weight: 700; font-size: 17px; color: ${C.gold}; }
          .mm-bottom-sub { font-size: 12px; color: ${C.muted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        }
      `}</style>
    </div>
  )
}

function splitTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

/** Live countdown. Shows dashes until the page is running in the browser so nothing jumps on load. */
function Countdown({ to, now, mounted }: { to: string; now: number; mounted: boolean }) {
  const t = splitTime(Date.parse(to) - now)
  const pad = (n: number) => String(n).padStart(2, '0')
  const parts: [string, string][] = [
    [mounted ? String(t.d) : '--', 'days'],
    [mounted ? pad(t.h) : '--', 'hrs'],
    [mounted ? pad(t.m) : '--', 'min'],
    [mounted ? pad(t.s) : '--', 'sec'],
  ]
  return (
    <div className="mm-cd" role="timer" aria-live="off">
      {parts.map(([v, l]) => (
        <div key={l} className="mm-cd-cell">
          <span className="mm-cd-num">{v}</span>
          <span className="mm-cd-lbl">{l}</span>
        </div>
      ))}
    </div>
  )
}

function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? 'mm-full' : undefined} style={{ minWidth: 0 }}>
      <label className="mm-field-label">{label}</label>
      {children}
      {hint && <span className="mm-hint">{hint}</span>}
    </div>
  )
}

function WhatsAppBox({ title = "Join the MEMORA '26 WhatsApp group", text }: { title?: string; text: string }) {
  if (!MEMORA.whatsappGroup) return null
  return (
    <div className="mm-wa">
      <div className="mm-wa-title">{title}</div>
      <div className="mm-wa-text">{text}</div>
      <a href={MEMORA.whatsappGroup} target="_blank" rel="noopener noreferrer" className="mm-wa-btn"><MessageCircle size={16} /> Join the WhatsApp group</a>
    </div>
  )
}

function SuccessCard({ ticketNumber, email, phone }: { ticketNumber: string; email: string; phone: string }) {
  return (
    <div className="mm-center" style={{ padding: '6px 2px' }}>
      <div style={{ width: 66, height: 66, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(52,211,153,0.12)', color: C.green, border: '1px solid rgba(52,211,153,0.35)' }}>
        <CheckCircle2 size={34} />
      </div>
      <div className="mm-card-h" style={{ fontSize: 26 }}>Request received</div>
      <p className="mm-body" style={{ fontSize: 15, margin: '8px auto 20px', maxWidth: 440 }}>
        Thank you. Our team will check your receipt, and once it is confirmed your QR ticket will be sent to{' '}
        <strong style={{ color: C.ink, wordBreak: 'break-all' }}>{email.trim().toLowerCase()}</strong> and by SMS to{' '}
        <strong style={{ color: C.ink, whiteSpace: 'nowrap' }}>{phone}</strong>.
      </p>
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, padding: '14px 28px', borderRadius: 20, background: 'rgba(242,193,78,0.08)', border: '1.5px dashed rgba(242,193,78,0.5)', marginBottom: 18 }}>
        <span className="mm-label-xs">Your reference</span>
        <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: 22, fontWeight: 800, color: C.gold }}>{ticketNumber}</span>
      </div>
      <div style={{ textAlign: 'left' }}><WhatsAppBox title="One more thing: join the WhatsApp group" text="All MEMORA '26 updates, reminders and last minute details are shared in this group." /></div>
      <p className="mm-help" style={{ marginTop: 14 }}>We also sent a confirmation to your email. If you cannot find it, check your spam or promotions folder.</p>
    </div>
  )
}
