'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays, Clock, MapPin, Ticket, Upload, FileText, X, CheckCircle2, Copy, Check,
  Palette, Music, UtensilsCrossed, Gamepad2, Shirt, AlertTriangle, MessageCircle, ArrowLeft, ChevronRight,
} from 'lucide-react'
import {
  RANGEELA, RANGEELA_BANK, AL_BATCHES, PRICING, salesOpen, looksLikeNic, isEarlyBird, currentPrice, toLocalMobile,
} from '@/lib/rangeela'

// ── Holi palette taken from the RANGEELA '26 artwork ──
const C = {
  magenta: '#E6007E',
  red: '#FF4D2E',
  orange: '#FF7A00',
  yellow: '#FFC300',
  green: '#16A34A',
  teal: '#0FB5AE',
  blue: '#2F6BFF',
  violet: '#7B2FF7',
  ink: '#241628',
  body: '#4E3E4B',
  muted: '#7D6D79',
}
const RAINBOW = `linear-gradient(90deg, ${C.magenta}, ${C.red}, ${C.orange}, ${C.yellow}, ${C.teal}, ${C.blue}, ${C.violet})`
const DISPLAY = "'Baloo 2', 'Inter', system-ui, sans-serif"
const BODY = "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', system-ui, sans-serif"
const ease = [0.22, 1, 0.36, 1] as const
const NIC_MSG = 'Please enter a valid NIC number (12 digits, or 9 digits followed by V or X).'

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { duration: 0.65, ease },
}

const EXPERIENCES = [
  { icon: Palette, color: C.magenta, title: 'Colour packets included', text: 'Your ticket covers the colours. Pick up your packets at the venue and let the hues fly.' },
  { icon: Music, color: C.violet, title: 'Music and DJ', text: 'Beats that keep the whole ground moving, from the first splash to the last.' },
  { icon: UtensilsCrossed, color: C.orange, title: 'Food stalls', text: 'Something tasty for when you need a break from all the dancing.' },
  { icon: Gamepad2, color: C.blue, title: 'Games', text: 'Fun games and activities to enjoy with your friends between the colour showers.' },
  { icon: Shirt, color: C.teal, title: 'Dress code: white', text: 'Come dressed in white. It is the best canvas for a thousand colours.' },
]

const lkr = (n: number) => `LKR ${n.toLocaleString('en-US')}`

const stepsFor = (price: number) => [
  { color: C.magenta, title: `Transfer ${lkr(price)}`, text: 'Deposit or transfer the ticket price to the account shown below.' },
  { color: C.orange, title: 'Fill the form', text: 'Enter your details and upload a photo or screenshot of your receipt.' },
  { color: C.teal, title: 'We verify', text: 'Our team checks every receipt by hand and emails you once your request is in.' },
  { color: C.violet, title: 'Ticket by email and SMS', text: 'Once approved, your personal QR ticket comes to your email and your phone. Show it at the entrance.' },
]

const GOOD_TO_KNOW = [
  `Early bird tickets are ${lkr(PRICING.earlyBird)} until ${PRICING.earlyBirdEndsLabel}. After that, online tickets are ${lkr(PRICING.standard)} until the event, and tickets at the gate are ${lkr(PRICING.gate)}.`,
  'One ticket admits one person. Each person fills the form separately.',
  'Your QR code works only once. After it is scanned at the entrance it cannot be used again, so please do not share it.',
  'Bring your NIC. The name and NIC number on your ticket may be checked at the gate.',
  'Tickets are non refundable and non transferable.',
  'Please buy your ticket before the event. Bank transfer is the main way to get one.',
  'Wear white, and bring a change of clothes if you need one for the ride home.',
]

type Uploaded = { url: string; filename: string }

// The form still sends the phone as "whatsapp" so the database column stays the same.
const empty = { full_name: '', email: '', whatsapp: '', school: '', al_batch: '', nic: '' }

/** Current time. Starts from the server's clock so the first paint matches, then ticks every second. */
function useNow(serverNow: number) {
  const [now, setNow] = useState(serverNow)
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return { now, mounted }
}

export default function RangeelaClient({ serverNow }: { serverNow: number }) {
  const { now, mounted } = useNow(serverNow)
  const open = salesOpen(now)
  const early = isEarlyBird(now)
  const price = currentPrice(now)
  const STEPS = stepsFor(price)
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

  // Mobile bottom bar: visible after the hero, hidden while the ticket section is on screen.
  useEffect(() => {
    const el = ticketsRef.current
    let inTickets = false
    const onScroll = () => setShowBar(window.scrollY > 420 && !inTickets)
    const io = el
      ? new IntersectionObserver(([e]) => { inTickets = e.isIntersecting; onScroll() }, { rootMargin: '0px 0px -20% 0px' })
      : null
    if (el && io) io.observe(el)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
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
      const res = await fetch('/api/rangeela/upload', { method: 'POST', body: fd })
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
      const res = await fetch('/api/rangeela/register', {
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
    <div className="lg-root">
      {/* Liquid colour backdrop */}
      <div className="lg-bg" aria-hidden>
        <span className="lg-blob b1" /><span className="lg-blob b2" /><span className="lg-blob b3" />
        <span className="lg-blob b4" /><span className="lg-blob b5" /><span className="lg-blob b6" />
      </div>

      {/* ── Floating glass nav ── */}
      <div className="lg-nav-wrap">
        <nav className="lg-glass lg-nav">
          <a href="/" className="lg-nav-logo" aria-label="AISCA home">
            <img src="/rangeela/aisca-dark.png" alt="AISCA" className="lg-logo-img" />
          </a>
          <div className="lg-nav-right">
            <a href="/" className="lg-nav-link"><ArrowLeft size={14} /> <span>aisca.lk</span></a>
            <button type="button" onClick={goTickets} className="lg-btn lg-btn-sm">Tickets</button>
          </div>
        </nav>
      </div>

      <main className="lg-main">
        {/* ── Hero ── */}
        <div className="lg-wrap lg-hero">
          <motion.div initial={{ opacity: 0, y: 14, scale: 0.985 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.9, ease }} className="lg-glass lg-hero-frame">
            <picture>
              <source media="(max-width: 640px)" srcSet="/rangeela/square.webp" />
              <img src="/rangeela/banner.webp" alt="RANGEELA '26, A Celebration of Hues, by AISCA" className="lg-hero-img" />
            </picture>
          </motion.div>
        </div>

        {/* ── Caption + facts ── */}
        <div className="lg-wrap lg-narrow lg-center lg-pad-top">
          <motion.div {...fadeUp}>
            <span className="lg-eyebrow">AISCA presents</span>
            <h1 className="lg-h1">The colours are <span className="lg-rainbow">calling.</span></h1>
            <p className="lg-lead">The celebration is about to begin.</p>
            <p className="lg-body lg-caption">
              One canvas. A thousand hues. Countless memories waiting to be made. Get ready to glow with colours and celebrate together at RANGEELA &apos;26, A Celebration of Hues.
            </p>
          </motion.div>

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="lg-facts">
            {[
              { icon: CalendarDays, label: 'Date', value: RANGEELA.dateShort, sub: 'Saturday', color: C.orange },
              { icon: Clock, label: 'Time', value: '2.00 PM', sub: 'onwards', color: C.magenta },
              { icon: MapPin, label: 'Venue', value: 'Nawinna', sub: 'Grounds, Maharagama', color: C.blue },
              { icon: Ticket, label: early ? 'Early bird' : 'Ticket', value: lkr(price), sub: early ? 'ends tonight' : 'online, per person', color: C.violet },
            ].map((x) => (
              <div key={x.label} className="lg-glass lg-fact">
                <span className="lg-fact-icon" style={{ color: x.color }}><x.icon size={18} strokeWidth={2.3} /></span>
                <span className="lg-fact-label">{x.label}</span>
                <span className="lg-fact-value" style={{ color: x.color }}>{x.value}</span>
                <span className="lg-fact-sub">{x.sub}</span>
              </div>
            ))}
          </motion.div>

          {early && open && (
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="lg-glass lg-eb-strip">
              <span className="lg-eb-strip-label">Early bird {lkr(PRICING.earlyBird)} ends in</span>
              <Countdown to={PRICING.earlyBirdEndsISO} now={now} mounted={mounted} compact />
            </motion.div>
          )}

          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.12 }} className="lg-cta-row">
            <button type="button" onClick={goTickets} className="lg-btn">Get your ticket <ChevronRight size={18} /></button>
            <a href={RANGEELA.whatsappGroup} target="_blank" rel="noopener noreferrer" className="lg-glass lg-btn-glass">
              <MessageCircle size={17} /> Join the WhatsApp group
            </a>
          </motion.div>
        </div>

        {/* ── What's waiting ── */}
        <div className="lg-block">
          <motion.div {...fadeUp} className="lg-wrap lg-center lg-head">
            <span className="lg-eyebrow">What is waiting for you</span>
            <h2 className="lg-h2">An evening made of colour</h2>
          </motion.div>
          <div className="lg-scroller" role="list">
            {EXPERIENCES.map((x, i) => (
              <motion.div role="listitem" key={x.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.05 }} className="lg-glass lg-exp">
                <span className="lg-exp-icon" style={{ color: x.color, background: `${x.color}1A` }}><x.icon size={21} strokeWidth={2.2} /></span>
                <div className="lg-card-title">{x.title}</div>
                <div className="lg-small">{x.text}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── How it works ── */}
        <div className="lg-block lg-wrap">
          <motion.div {...fadeUp} className="lg-center lg-head">
            <span className="lg-eyebrow">How to get your ticket</span>
            <h2 className="lg-h2">Four simple steps</h2>
          </motion.div>
          <div className="lg-steps">
            {STEPS.map((s, i) => (
              <motion.div key={s.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="lg-glass lg-step">
                <span className="lg-step-no" style={{ background: s.color, boxShadow: `0 8px 18px -8px ${s.color}` }}>{i + 1}</span>
                <div>
                  <div className="lg-card-title">{s.title}</div>
                  <div className="lg-small">{s.text}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Tickets ── */}
        <div id="tickets" ref={ticketsRef} className="lg-block lg-wrap lg-anchor">
          <motion.div {...fadeUp} className="lg-center lg-head">
            <span className="lg-eyebrow">Tickets</span>
            <h2 className="lg-h2">Get your RANGEELA &apos;26 ticket</h2>
            <p className="lg-body lg-sub">
              {early
                ? `Early bird price is ${lkr(PRICING.earlyBird)} per person. Pay by bank transfer, upload the receipt, and your QR ticket comes to your email and phone once we confirm the payment.`
                : `${lkr(price)} per person online. Pay by bank transfer, upload the receipt, and your QR ticket comes to your email and phone once we confirm the payment.`}
            </p>
            <p className="lg-small" style={{ margin: '14px auto 0', maxWidth: 560, padding: '12px 16px', borderRadius: 16, background: `${C.violet}14`, color: C.violet, fontWeight: 700 }}>
              Each ticket admits one person only. Coming with friends? Every person needs their own ticket, bought with their own form.
            </p>
          </motion.div>

          {/* Pricing tiers + early bird countdown */}
          <motion.div {...fadeUp} className="lg-glass lg-card lg-prices">
            {early && (
              <div className="lg-cd-wrap">
                <div className="lg-cd-title">Early bird ends in</div>
                <Countdown to={PRICING.earlyBirdEndsISO} now={now} mounted={mounted} />
                <div className="lg-cd-note">Grab yours for {lkr(PRICING.earlyBird)} before {PRICING.earlyBirdEndsLabel}. The price goes up to {lkr(PRICING.standard)} after that.</div>
              </div>
            )}
            <div className="lg-tiers">
              {[
                { key: 'early', name: 'Early bird', amount: PRICING.earlyBird, when: `Until ${PRICING.earlyBirdEndsLabel}`, color: C.magenta, active: early && open, over: !early },
                { key: 'online', name: 'Online', amount: PRICING.standard, when: '10th October until the event', color: C.orange, active: !early && open, over: !open },
                { key: 'gate', name: 'At the gate', amount: PRICING.gate, when: 'On the day, 17th October', color: C.violet, active: !open, over: false },
              ].map((t) => (
                <div key={t.key} className={`lg-tier ${t.active ? 'is-active' : ''} ${t.over ? 'is-over' : ''}`} style={t.active ? { borderColor: t.color, boxShadow: `0 14px 30px -16px ${t.color}` } : undefined}>
                  {t.active && <span className="lg-tier-badge" style={{ background: t.color }}>Now</span>}
                  {t.over && <span className="lg-tier-badge is-over">Ended</span>}
                  <span className="lg-tier-name" style={{ color: t.color }}>{t.name}</span>
                  <span className="lg-tier-amount">{lkr(t.amount)}</span>
                  <span className="lg-tier-when">{t.when}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="lg-ticket-grid">
            {/* Step 1: Pay */}
            <motion.div {...fadeUp} className="lg-glass lg-card lg-pay">
              <div className="lg-step-tag" style={{ background: `${C.magenta}14`, color: C.magenta }}>Step 1</div>
              <div className="lg-card-h">Pay {lkr(price)}</div>
              <p className="lg-small" style={{ margin: '0 0 16px' }}>
                {early
                  ? `Early bird price. Transfer or deposit to this account and submit the form before ${PRICING.earlyBirdEndsLabel}. If your bank lets you add a reference, please use your name.`
                  : 'Transfer or deposit to this account. If your bank lets you add a reference, please use your name.'}
              </p>
              <div className="lg-bank">
                {([
                  ['Account No', RANGEELA_BANK.account, 'account'],
                  ['Account Name', RANGEELA_BANK.name, 'name'],
                  ['Bank', RANGEELA_BANK.bank, ''],
                  ['Branch', RANGEELA_BANK.branch, ''],
                ] as [string, string, string][]).map(([k, v, key]) => (
                  <div key={k} className="lg-bank-row">
                    <div style={{ minWidth: 0 }}>
                      <div className="lg-label-xs">{k}</div>
                      <div className={key === 'account' ? 'lg-bank-acc' : 'lg-bank-val'}>{v}</div>
                    </div>
                    {key && (
                      <button type="button" onClick={() => copy(key, v)} aria-label={`Copy ${k}`} className={`lg-copy ${copied === key ? 'is-done' : ''}`}>
                        {copied === key ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="lg-wa">
                <div className="lg-wa-title">Join the WhatsApp group</div>
                <div className="lg-wa-text">Whether you have just filled the form or already have your ticket, please join. All updates are shared here.</div>
                <a href={RANGEELA.whatsappGroup} target="_blank" rel="noopener noreferrer" className="lg-wa-btn"><MessageCircle size={15} /> Join now</a>
              </div>
            </motion.div>

            {/* Step 2: Form / success */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.06 }} className="lg-glass lg-card lg-anchor" ref={formTop}>
              {done ? (
                <SuccessCard ticketNumber={done} email={f.email} phone={toLocalMobile(f.whatsapp) || f.whatsapp} />
              ) : !open ? (
                <div className="lg-center" style={{ padding: '26px 6px' }}>
                  <div className="lg-card-h">Online sales are closed</div>
                  <p className="lg-body">Thank you for the amazing response. Online tickets for RANGEELA &apos;26 are no longer available. You can still buy a ticket at the gate for {lkr(PRICING.gate)}. Please check the WhatsApp group for updates.</p>
                </div>
              ) : (
                <>
                  <div className="lg-step-tag" style={{ background: `${C.violet}14`, color: C.violet }}>Step 2</div>
                  <div className="lg-card-h">Your details</div>
                  <p className="lg-small" style={{ margin: '0 0 18px' }}>This ticket is for one person only: the person whose details you enter here. Every field is required.</p>

                  {error && (
                    <div role="alert" className="lg-alert"><AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 1 }} /> <span>{error}</span></div>
                  )}

                  <div className="lg-form">
                    <Field label="Full name" hint="As it appears on your NIC" full>
                      <input className="lg-input" value={f.full_name} onChange={(e) => set('full_name', e.target.value)} autoComplete="name" maxLength={200} placeholder="e.g. Kavindi Perera" />
                    </Field>

                    <div className="lg-email-box lg-full">
                      <div className="lg-email-note">
                        <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                        <span><strong>Please type these two carefully.</strong> Your QR ticket is sent to both your email and your phone (by SMS). If either one is wrong, your ticket may not reach you.</span>
                      </div>
                      <div className="lg-form" style={{ gap: 12 }}>
                        <Field label="Email address">
                          <input className="lg-input" type="email" inputMode="email" autoComplete="email" autoCapitalize="off" autoCorrect="off" spellCheck={false} value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
                        </Field>
                        <Field label="Phone number" hint={phoneBad ? undefined : 'A mobile number that can receive SMS'}>
                          <input className={`lg-input ${phoneBad ? 'is-bad' : ''}`} type="tel" inputMode="tel" autoComplete="tel" value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="07X XXX XXXX" maxLength={20} />
                          {phoneBad && <span className="lg-err-text">Please enter a Sri Lankan mobile number, like 077 123 4567.</span>}
                        </Field>
                      </div>
                    </div>

                    <Field label="NIC number" hint={nicBad ? undefined : '12 digits, or 9 digits followed by V or X'}>
                      <input className={`lg-input ${nicBad ? 'is-bad' : ''}`} autoCapitalize="characters" autoCorrect="off" spellCheck={false} value={f.nic} onChange={(e) => set('nic', e.target.value.toUpperCase())} placeholder="e.g. 200712345678" maxLength={14} />
                      {nicBad && <span className="lg-err-text">That does not look like a valid NIC number.</span>}
                    </Field>
                    <Field label="A/L batch">
                      <select className="lg-input lg-select" value={f.al_batch} onChange={(e) => set('al_batch', e.target.value)}>
                        <option value="">Choose your batch</option>
                        {AL_BATCHES.map((b) => <option key={b} value={b}>{/^\d+$/.test(b) ? `${b} A/L batch` : b}</option>)}
                      </select>
                    </Field>
                    <Field label="School" full>
                      <input className="lg-input" value={f.school} onChange={(e) => set('school', e.target.value)} placeholder="Your school" maxLength={200} />
                    </Field>

                    <Field label="Bank receipt" hint="A clear photo, screenshot or PDF of your payment slip" full>
                      <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleReceipt} style={{ display: 'none' }} />
                      {receipt ? (
                        <div className="lg-file">
                          <FileText size={18} color={C.green} style={{ flexShrink: 0 }} />
                          <span className="lg-file-name">{receipt.filename}</span>
                          <button type="button" onClick={() => setReceipt(null)} aria-label="Remove receipt" className="lg-icon-btn"><X size={17} /></button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="lg-upload">
                          <Upload size={22} />
                          <span className="lg-upload-title">{uploading ? 'Uploading your receipt...' : 'Tap to upload your receipt'}</span>
                          <span className="lg-upload-sub">JPG, PNG, HEIC or PDF, up to 15 MB</span>
                        </button>
                      )}
                    </Field>
                  </div>

                  <label className="lg-check">
                    <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span>I confirm my details are correct. I understand the ticket is non refundable and non transferable, and the QR code allows one entry only.</span>
                  </label>

                  <button type="button" onClick={submit} disabled={submitting || uploading} className="lg-btn lg-btn-block" style={{ opacity: submitting || uploading ? 0.6 : 1 }}>
                    {submitting ? 'Submitting...' : 'Submit ticket request'}
                  </button>
                  <p className="lg-help">
                    Need help? WhatsApp{' '}
                    {RANGEELA.helpContacts.map((c, i) => (
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
        <div className="lg-block lg-wrap lg-narrow">
          <motion.div {...fadeUp} className="lg-center lg-head">
            <span className="lg-eyebrow">Good to know</span>
            <h2 className="lg-h2">Before you come</h2>
          </motion.div>
          <motion.div {...fadeUp} className="lg-glass lg-card lg-list">
            {GOOD_TO_KNOW.map((t, i) => (
              <div key={t} className="lg-list-row">
                <span className="lg-dot" style={{ background: [C.magenta, C.orange, C.yellow, C.teal, C.blue, C.violet][i % 6] }} />
                <span>{t}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Closing ── */}
        <div className="lg-block lg-wrap lg-narrow lg-center lg-closing">
          <motion.div {...fadeUp}>
            <img src="/rangeela/logo.webp" alt="RANGEELA '26" className="lg-closing-logo" />
            <p className="lg-closing-text">
              {RANGEELA.dateLabel}<br />{RANGEELA.timeLabel} · {RANGEELA.venue}
            </p>
            <button type="button" onClick={goTickets} className="lg-btn">Get your ticket <ChevronRight size={18} /></button>
          </motion.div>
        </div>
      </main>

      <footer className="lg-footer">
        <div className="lg-footer-bar" />
        <div className="lg-wrap lg-footer-inner">
          <span>RANGEELA &apos;26 is organised by the All Island Schools Commerce Association.</span>
          <a href="/">aisca.lk</a>
        </div>
      </footer>

      {/* ── Mobile bottom ticket bar ── */}
      {!done && open && (
        <div className={`lg-bottom ${showBar ? 'is-on' : ''}`} aria-hidden={!showBar}>
          <div className="lg-glass lg-bottom-inner">
            <div className="lg-bottom-text">
              <span className="lg-bottom-price">{lkr(price)}{early && <span className="lg-bottom-eb">Early bird</span>}</span>
              <span className="lg-bottom-sub">{early && mounted ? `Ends in ${shortLeft(Date.parse(PRICING.earlyBirdEndsISO) - now)}` : `${RANGEELA.dateShort} · Nawinna`}</span>
            </div>
            <button type="button" onClick={goTickets} className="lg-btn lg-btn-sm" tabIndex={showBar ? 0 : -1}>Get ticket</button>
          </div>
        </div>
      )}

      <style>{`
        .lg-root { position: relative; min-height: 100vh; font-family: ${BODY}; font-weight: 400; color: ${C.body}; background: #FFF7F1; overflow: hidden; -webkit-font-smoothing: antialiased; }
        .lg-root ::selection { background: rgba(230,0,126,0.18); color: ${C.ink}; }
        .lg-root a, .lg-root button, .lg-root input, .lg-root select { min-height: 0; }

        /* backdrop */
        .lg-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden; pointer-events: none; background: linear-gradient(180deg, #FFF7F1 0%, #FDF2FA 45%, #F3F4FF 100%); }
        .lg-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .55; will-change: transform; animation: lg-drift 22s ease-in-out infinite alternate; }
        .lg-blob.b1 { width: 46vmax; height: 46vmax; left: -14vmax; top: -12vmax; background: #FF5FB0; }
        .lg-blob.b2 { width: 40vmax; height: 40vmax; right: -12vmax; top: 4vmax; background: #FFB347; animation-duration: 26s; }
        .lg-blob.b3 { width: 38vmax; height: 38vmax; left: 18vmax; top: 34vmax; background: #6FD6FF; animation-duration: 30s; }
        .lg-blob.b4 { width: 34vmax; height: 34vmax; right: -8vmax; bottom: -10vmax; background: #A77BFF; animation-duration: 24s; }
        .lg-blob.b5 { width: 28vmax; height: 28vmax; left: -8vmax; bottom: 6vmax; background: #FFE066; animation-duration: 28s; }
        .lg-blob.b6 { width: 24vmax; height: 24vmax; left: 44vmax; top: -6vmax; background: #5EE6C8; animation-duration: 32s; opacity: .4; }
        @keyframes lg-drift { 0% { transform: translate3d(0,0,0) scale(1); } 100% { transform: translate3d(4vmax, 3vmax, 0) scale(1.12); } }
        @media (prefers-reduced-motion: reduce) { .lg-blob { animation: none; } }

        /* liquid glass surface */
        .lg-glass { position: relative; background: rgba(255,255,255,0.46); border: 1px solid rgba(255,255,255,0.7); -webkit-backdrop-filter: blur(24px) saturate(180%); backdrop-filter: blur(24px) saturate(180%);
          box-shadow: 0 10px 34px -12px rgba(70,20,90,0.22), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -1px 0 rgba(255,255,255,0.35); }
        .lg-glass::before { content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
          background: linear-gradient(140deg, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.08) 32%, rgba(255,255,255,0) 60%, rgba(255,255,255,0.22) 100%); opacity: .7; }
        .lg-glass > * { position: relative; }

        /* layout */
        .lg-main { position: relative; z-index: 1; padding-top: 88px; }
        .lg-wrap { max-width: 1120px; margin: 0 auto; padding-left: 20px; padding-right: 20px; }
        .lg-narrow { max-width: 820px; }
        .lg-center { text-align: center; }
        .lg-pad-top { padding-top: 48px; }
        .lg-block { padding-top: 76px; }
        .lg-head { margin-bottom: 26px; }
        .lg-anchor { scroll-margin-top: 90px; }

        /* nav */
        .lg-nav-wrap { position: fixed; top: 12px; left: 0; right: 0; z-index: 50; padding: 0 12px; }
        .lg-nav { background: rgba(255,255,255,0.66); max-width: 1120px; margin: 0 auto; height: 58px; border-radius: 999px; display: flex; align-items: center; justify-content: space-between; padding: 0 8px 0 20px; }
        .lg-nav-logo { display: flex; align-items: center; }
        .lg-root img.lg-logo-img { width: 118px !important; height: auto !important; display: block; }
        .lg-nav-right { display: flex; align-items: center; gap: 6px; }
        .lg-nav-link { display: inline-flex; align-items: center; gap: 5px; padding: 9px 14px; border-radius: 999px; font-size: 13px; font-weight: 600; color: ${C.ink}; text-decoration: none; }
        .lg-nav-link:hover { background: rgba(255,255,255,0.5); }

        /* hero */
        .lg-hero-frame { padding: 8px; border-radius: 32px; overflow: hidden; }
        .lg-root img.lg-hero-img { display: block; width: 100% !important; height: auto !important; border-radius: 25px; }

        /* type */
        .lg-eyebrow { display: inline-block; font-size: 11.5px; letter-spacing: 0.24em; text-transform: uppercase; font-weight: 700; background: ${RAINBOW}; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .lg-h1 { font-family: ${DISPLAY}; font-weight: 800; font-size: clamp(2.3rem, 7vw, 3.8rem); line-height: 1.02; letter-spacing: -0.01em; color: ${C.ink}; margin: 10px 0 14px; }
        .lg-h2 { font-family: ${DISPLAY}; font-weight: 800; font-size: clamp(1.85rem, 5vw, 2.7rem); line-height: 1.08; color: ${C.ink}; margin: 6px 0 0; }
        .lg-rainbow { background: ${RAINBOW}; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .lg-lead { font-family: ${DISPLAY}; font-weight: 700; font-size: clamp(1.15rem, 3.4vw, 1.45rem); color: ${C.ink}; margin: 0 0 12px; }
        .lg-body { font-size: 16px; line-height: 1.75; color: ${C.body}; margin: 0; }
        .lg-caption { max-width: 600px; margin: 0 auto; }
        .lg-sub { max-width: 580px; margin: 10px auto 0; font-size: 15px; }
        .lg-small { font-size: 14px; line-height: 1.62; color: ${C.body}; }
        .lg-card-title { font-family: ${DISPLAY}; font-weight: 700; font-size: 18.5px; line-height: 1.2; color: ${C.ink}; margin-bottom: 6px; }
        .lg-card-h { font-family: ${DISPLAY}; font-weight: 800; font-size: 22px; line-height: 1.15; color: ${C.ink}; margin: 8px 0 6px; }
        .lg-label-xs { font-size: 10.5px; letter-spacing: 0.16em; text-transform: uppercase; color: ${C.muted}; font-weight: 700; }

        /* facts */
        .lg-facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 34px; }
        .lg-fact { display: flex; flex-direction: column; align-items: center; padding: 18px 8px 16px; border-radius: 24px; }
        .lg-fact-icon { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.7); }
        .lg-fact-label { font-size: 10.5px; letter-spacing: 0.18em; text-transform: uppercase; color: ${C.muted}; font-weight: 700; margin-top: 10px; }
        .lg-fact-value { font-family: ${DISPLAY}; font-weight: 800; font-size: 22px; line-height: 1.1; margin-top: 3px; }
        .lg-fact-sub { font-size: 12.5px; color: ${C.muted}; }

        /* buttons */
        .lg-cta-row { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 28px; }
        .lg-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 15px 28px; border-radius: 999px; border: none; cursor: pointer; color: #fff; text-decoration: none;
          background: linear-gradient(100deg, ${C.magenta}, ${C.orange} 55%, ${C.violet}); background-size: 200% 100%; font-family: ${DISPLAY}; font-weight: 800; font-size: 17px; letter-spacing: .01em;
          box-shadow: 0 14px 30px -12px rgba(230,0,126,0.55), inset 0 1px 0 rgba(255,255,255,0.45); transition: background-position .5s ease, transform .15s ease; -webkit-tap-highlight-color: transparent; }
        .lg-btn:hover { background-position: 100% 0; }
        .lg-btn:active { transform: scale(.97); }
        .lg-btn-sm { padding: 10px 18px; font-size: 15px; }
        .lg-btn-block { width: 100%; margin-top: 20px; padding: 17px 20px; }
        .lg-btn-glass { display: inline-flex; align-items: center; gap: 8px; padding: 14px 22px; border-radius: 999px; color: ${C.ink}; font-weight: 700; font-size: 14.5px; text-decoration: none; }
        .lg-btn-glass:active { transform: scale(.97); }

        /* experiences: grid on desktop, swipe row on mobile */
        .lg-scroller { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; max-width: 1120px; margin: 0 auto; padding: 4px 20px 10px; }
        .lg-exp { padding: 22px 20px; border-radius: 26px; }
        .lg-exp-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }

        /* steps */
        .lg-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .lg-step { display: flex; flex-direction: column; gap: 12px; padding: 22px 20px; border-radius: 26px; }
        .lg-step-no { width: 36px; height: 36px; flex-shrink: 0; border-radius: 50%; color: #fff; font-family: ${DISPLAY}; font-weight: 800; font-size: 18px; display: flex; align-items: center; justify-content: center; }

        /* tickets */
        .lg-ticket-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 18px; align-items: start; }
        .lg-card { padding: 26px 24px; border-radius: 30px; }
        .lg-step-tag { display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; padding: 5px 11px; border-radius: 999px; }
        .lg-bank { display: flex; flex-direction: column; gap: 8px; }
        .lg-bank-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 14px; border-radius: 18px; background: rgba(255,255,255,0.62); border: 1px solid rgba(255,255,255,0.85); }
        .lg-bank-acc { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-size: 19px; font-weight: 800; color: ${C.ink}; letter-spacing: .02em; }
        .lg-bank-val { font-size: 14px; font-weight: 600; color: ${C.ink}; word-break: break-word; }
        .lg-copy { flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px; padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(36,22,40,0.1); background: rgba(255,255,255,0.8); color: ${C.ink}; font-size: 12.5px; font-weight: 700; cursor: pointer; }
        .lg-copy.is-done { background: #E9F9EF; color: ${C.green}; border-color: #BFE8CD; }
        .lg-wa { margin-top: 16px; padding: 16px; border-radius: 20px; background: rgba(233,249,239,0.75); border: 1px solid rgba(191,232,205,0.9); }
        .lg-wa-title { font-weight: 700; color: #14532D; font-size: 14.5px; margin-bottom: 4px; }
        .lg-wa-text { font-size: 13px; line-height: 1.6; color: #3F6B4F; margin-bottom: 12px; }
        .lg-wa-btn { display: inline-flex; align-items: center; gap: 7px; background: #25D366; color: #fff; padding: 10px 18px; border-radius: 999px; font-size: 14px; font-weight: 700; text-decoration: none; box-shadow: 0 8px 18px -8px rgba(37,211,102,0.8); }

        /* form */
        .lg-form { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .lg-full { grid-column: 1 / -1; }
        .lg-field-label { display: block; font-size: 13.5px; font-weight: 700; color: ${C.ink}; margin-bottom: 7px; }
        .lg-hint { display: block; font-size: 12.5px; color: ${C.muted}; margin-top: 6px; }
        .lg-err-text { display: block; font-size: 12.5px; color: #B42318; margin-top: 6px; font-weight: 600; }
        .lg-input { width: 100%; height: 52px; padding: 0 16px; border-radius: 16px; border: 1px solid rgba(36,22,40,0.12); background-color: rgba(255,255,255,0.78); color: ${C.ink}; font-size: 16px; font-family: ${BODY};
          outline: none; transition: border-color .2s, box-shadow .2s, background-color .2s; -webkit-appearance: none; appearance: none; box-shadow: inset 0 1px 2px rgba(36,22,40,0.05); }
        .lg-input::placeholder { color: #A8989F; }
        .lg-input:focus { border-color: ${C.violet}; background-color: #fff; box-shadow: 0 0 0 4px rgba(123,47,247,0.14); }
        .lg-input.is-bad { border-color: #F04438; background-color: #FFF6F6; }
        .lg-select { padding-right: 40px; background-image: linear-gradient(45deg, transparent 50%, ${C.muted} 50%), linear-gradient(135deg, ${C.muted} 50%, transparent 50%); background-position: calc(100% - 22px) 52%, calc(100% - 16px) 52%; background-size: 6px 6px; background-repeat: no-repeat; cursor: pointer; }
        .lg-email-box { padding: 16px; border-radius: 22px; background: rgba(255,244,222,0.72); border: 1px solid rgba(255,206,120,0.8); }
        .lg-email-note { display: flex; gap: 9px; align-items: flex-start; margin-bottom: 12px; font-size: 13.5px; line-height: 1.55; color: #7A4300; }
        .lg-upload { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 22px 14px; border-radius: 20px; border: 2px dashed rgba(123,47,247,0.4); background: rgba(247,242,255,0.7); color: ${C.violet}; cursor: pointer; font-family: ${BODY}; }
        .lg-upload:active { transform: scale(.99); }
        .lg-upload-title { font-weight: 700; color: ${C.ink}; font-size: 15px; }
        .lg-upload-sub { font-size: 12.5px; color: ${C.muted}; }
        .lg-file { display: flex; align-items: center; gap: 10px; padding: 12px 14px; border-radius: 18px; background: rgba(233,249,239,0.85); border: 1px solid #BFE8CD; min-width: 0; }
        .lg-file-name { font-size: 14px; color: ${C.ink}; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0; }
        .lg-icon-btn { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border: none; background: rgba(255,255,255,0.7); border-radius: 50%; color: ${C.muted}; cursor: pointer; flex-shrink: 0; }
        .lg-check { display: flex; gap: 12px; align-items: flex-start; margin-top: 20px; cursor: pointer; font-size: 14px; line-height: 1.6; color: ${C.body}; }
        .lg-check input { width: 22px; height: 22px; margin-top: 1px; accent-color: ${C.violet}; flex-shrink: 0; }
        .lg-alert { display: flex; gap: 10px; align-items: flex-start; padding: 13px 15px; border-radius: 18px; background: rgba(255,240,240,0.9); border: 1px solid #FBC6C6; color: #B42318; font-size: 14px; line-height: 1.55; margin-bottom: 18px; }
        .lg-help { text-align: center; font-size: 13px; color: ${C.muted}; margin: 14px 0 0; }
        .lg-help a { color: ${C.violet}; font-weight: 700; }

        /* early bird strip under the facts */
        .lg-eb-strip { display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 10px 16px; margin: 14px auto 0; padding: 12px 18px; border-radius: 24px; max-width: 620px; }
        .lg-eb-strip-label { font-family: ${DISPLAY}; font-weight: 800; font-size: 16px; color: ${C.magenta}; }

        /* countdown */
        .lg-cd { display: flex; justify-content: center; gap: 10px; }
        .lg-cd-cell { display: flex; flex-direction: column; align-items: center; min-width: 74px; padding: 12px 8px 10px; border-radius: 20px; background: rgba(255,255,255,0.72); border: 1px solid rgba(255,255,255,0.95); box-shadow: inset 0 1px 0 #fff, 0 8px 20px -14px rgba(70,20,90,0.35); }
        .lg-cd-num { font-family: ${DISPLAY}; font-weight: 800; font-size: 34px; line-height: 1; color: ${C.ink}; font-variant-numeric: tabular-nums; }
        .lg-cd-lbl { font-size: 10.5px; letter-spacing: .16em; text-transform: uppercase; font-weight: 700; color: ${C.muted}; margin-top: 5px; }
        .lg-cd.is-compact { gap: 6px; }
        .lg-cd.is-compact .lg-cd-cell { min-width: 50px; padding: 7px 6px 6px; border-radius: 14px; }
        .lg-cd.is-compact .lg-cd-num { font-size: 20px; }
        .lg-cd.is-compact .lg-cd-lbl { font-size: 9px; margin-top: 3px; }

        /* price tiers */
        .lg-prices { margin-bottom: 18px; }
        .lg-cd-wrap { text-align: center; padding: 4px 0 22px; margin-bottom: 20px; border-bottom: 1px solid rgba(36,22,40,0.07); }
        .lg-cd-title { font-family: ${DISPLAY}; font-weight: 800; font-size: 20px; margin-bottom: 12px; background: ${RAINBOW}; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .lg-cd-note { font-size: 13.5px; color: ${C.body}; margin-top: 12px; line-height: 1.55; }
        .lg-tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .lg-tier { position: relative; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px; padding: 18px 10px 16px; border-radius: 22px; background: rgba(255,255,255,0.55); border: 1.5px solid rgba(255,255,255,0.9); }
        .lg-tier.is-active { background: rgba(255,255,255,0.9); }
        .lg-tier.is-over { opacity: .55; }
        .lg-tier.is-over .lg-tier-amount { text-decoration: line-through; text-decoration-thickness: 2px; }
        .lg-tier-badge { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); color: #fff; font-size: 10.5px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; }
        .lg-tier-badge.is-over { background: ${C.muted}; }
        .lg-tier-name { font-size: 11.5px; letter-spacing: .16em; text-transform: uppercase; font-weight: 800; }
        .lg-tier-amount { font-family: ${DISPLAY}; font-weight: 800; font-size: 25px; line-height: 1.15; color: ${C.ink}; }
        .lg-tier-when { font-size: 12.5px; color: ${C.muted}; line-height: 1.4; }
        .lg-bottom-eb { display: inline-block; margin-left: 7px; vertical-align: 2px; font-family: ${BODY}; font-size: 10px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: #fff; background: ${C.magenta}; padding: 2px 7px; border-radius: 999px; }

        /* list */
        .lg-list { padding: 6px 22px; }
        .lg-list-row { display: flex; gap: 14px; padding: 15px 0; font-size: 15px; line-height: 1.62; color: ${C.body}; }
        .lg-list-row + .lg-list-row { border-top: 1px solid rgba(36,22,40,0.07); }
        .lg-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 8px; flex-shrink: 0; }

        /* closing + footer */
        .lg-closing { padding-bottom: 90px; }
        .lg-root img.lg-closing-logo { width: min(400px, 82%) !important; height: auto !important; margin: 0 auto 14px; display: block; }
        .lg-closing-text { font-family: ${DISPLAY}; font-weight: 700; font-size: clamp(1.15rem, 3.4vw, 1.45rem); line-height: 1.35; color: ${C.ink}; margin: 0 0 22px; }
        .lg-footer { position: relative; z-index: 1; background: rgba(255,255,255,0.5); -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.8); }
        .lg-footer-bar { height: 4px; background: ${RAINBOW}; }
        .lg-footer-inner { display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center; padding-top: 20px; padding-bottom: 22px; font-size: 12.5px; color: ${C.muted}; }
        .lg-footer-inner a { color: ${C.ink}; font-weight: 700; text-decoration: none; }

        /* mobile bottom bar */
        .lg-bottom { display: none; }

        @media (max-width: 980px) {
          .lg-scroller { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; gap: 12px; padding: 4px 20px 14px; scroll-padding-left: 20px; }
          .lg-scroller::-webkit-scrollbar { display: none; }
          .lg-exp { flex: 0 0 min(72%, 300px); scroll-snap-align: start; }
          .lg-steps { grid-template-columns: repeat(2, 1fr); }
          .lg-ticket-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .lg-main { padding-top: 78px; }
          .lg-wrap { padding-left: 16px; padding-right: 16px; }
          .lg-nav { height: 54px; padding: 0 6px 0 16px; }
          .lg-root img.lg-logo-img { width: 100px !important; }
          .lg-nav-link span { display: none; }
          .lg-nav-link { padding: 9px 10px; }
          .lg-hero-frame { padding: 6px; border-radius: 28px; }
          .lg-root img.lg-hero-img { border-radius: 22px; }
          .lg-pad-top { padding-top: 36px; }
          .lg-block { padding-top: 60px; }
          .lg-facts { grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 26px; }
          .lg-fact-value { font-size: 20px; }
          .lg-cta-row { flex-direction: column; align-items: stretch; }
          .lg-cta-row .lg-btn, .lg-cta-row .lg-btn-glass { justify-content: center; }
          .lg-scroller { padding-left: 16px; padding-right: 16px; scroll-padding-left: 16px; }
          .lg-exp { flex-basis: 78%; }
          .lg-steps { grid-template-columns: 1fr; gap: 10px; }
          .lg-step { flex-direction: row; align-items: flex-start; gap: 14px; padding: 18px; border-radius: 22px; }
          .lg-card { padding: 22px 16px; border-radius: 26px; }
          .lg-form { grid-template-columns: 1fr; gap: 16px; }
          .lg-email-box { padding: 14px; }
          .lg-eb-strip { flex-direction: column; gap: 8px; padding: 12px; }
          .lg-cd { gap: 7px; }
          .lg-cd-cell { min-width: 0; flex: 1; padding: 10px 4px 8px; border-radius: 16px; }
          .lg-cd-num { font-size: 27px; }
          .lg-cd.is-compact .lg-cd-cell { min-width: 58px; flex: 0 0 auto; }
          .lg-tiers { grid-template-columns: 1fr; gap: 14px; }
          .lg-tier { flex-direction: row; flex-wrap: wrap; justify-content: space-between; text-align: left; padding: 14px 16px; column-gap: 10px; }
          .lg-tier-name { order: 1; }
          .lg-tier-amount { order: 2; font-size: 22px; }
          .lg-tier-when { order: 3; flex-basis: 100%; }
          .lg-tier-badge { left: auto; right: 14px; transform: none; }
          .lg-list { padding: 4px 16px; }
          .lg-list-row { font-size: 14.5px; }
          .lg-bank-acc { font-size: 17px; }
          .lg-closing { padding-bottom: 110px; }
          .lg-footer-inner { padding-bottom: 96px; }
          .lg-bottom { display: block; position: fixed; left: 0; right: 0; bottom: 0; z-index: 60; padding: 0 12px calc(12px + env(safe-area-inset-bottom)); transform: translateY(140%); transition: transform .35s cubic-bezier(.22,1,.36,1); pointer-events: none; }
          .lg-bottom.is-on { transform: translateY(0); pointer-events: auto; }
          .lg-bottom-inner { background: rgba(255,255,255,0.7); display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 8px 8px 8px 18px; border-radius: 999px; }
          .lg-bottom-text { display: flex; flex-direction: column; line-height: 1.2; min-width: 0; }
          .lg-bottom-price { font-family: ${DISPLAY}; font-weight: 800; font-size: 18px; color: ${C.ink}; }
          .lg-bottom-sub { font-size: 12px; color: ${C.muted}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        }
      `}</style>
    </div>
  )
}

function splitTime(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }
}

function shortLeft(ms: number) {
  const t = splitTime(ms)
  return t.d > 0 ? `${t.d}d ${t.h}h ${t.m}m` : `${t.h}h ${t.m}m ${t.s}s`
}

/** Live countdown. Shows dashes until the page is running in the browser so nothing jumps on load. */
function Countdown({ to, now, mounted, compact }: { to: string; now: number; mounted: boolean; compact?: boolean }) {
  const t = splitTime(Date.parse(to) - now)
  const pad = (n: number) => String(n).padStart(2, '0')
  const parts: [string, string][] = [
    [mounted ? String(t.d) : '--', t.d === 1 ? 'day' : 'days'],
    [mounted ? pad(t.h) : '--', 'hrs'],
    [mounted ? pad(t.m) : '--', 'min'],
    [mounted ? pad(t.s) : '--', 'sec'],
  ]
  return (
    <div className={`lg-cd ${compact ? 'is-compact' : ''}`} role="timer" aria-live="off">
      {parts.map(([v, l]) => (
        <div key={l === 'day' ? 'days' : l} className="lg-cd-cell">
          <span className="lg-cd-num">{v}</span>
          <span className="lg-cd-lbl">{l}</span>
        </div>
      ))}
    </div>
  )
}

function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div className={full ? 'lg-full' : undefined} style={{ minWidth: 0 }}>
      <label className="lg-field-label">{label}</label>
      {children}
      {hint && <span className="lg-hint">{hint}</span>}
    </div>
  )
}

function SuccessCard({ ticketNumber, email, phone }: { ticketNumber: string; email: string; phone: string }) {
  return (
    <div className="lg-center" style={{ padding: '6px 2px' }}>
      <div style={{ width: 66, height: 66, borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(233,249,239,0.9)', color: C.green, boxShadow: 'inset 0 1px 0 #fff' }}>
        <CheckCircle2 size={34} />
      </div>
      <div className="lg-card-h" style={{ fontSize: 27 }}>Request received!</div>
      <p className="lg-body" style={{ fontSize: 15, margin: '6px auto 18px', maxWidth: 440 }}>
        Thank you. Our team will check your receipt, and once it is confirmed your QR ticket will be sent to{' '}
        <strong style={{ color: C.ink, wordBreak: 'break-all' }}>{email.trim().toLowerCase()}</strong> and by SMS to{' '}
        <strong style={{ color: C.ink, whiteSpace: 'nowrap' }}>{phone}</strong>.
      </p>
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, padding: '14px 26px', borderRadius: 20, background: 'rgba(247,242,255,0.8)', border: '1.5px dashed rgba(123,47,247,0.4)', marginBottom: 20 }}>
        <span className="lg-label-xs">Your reference</span>
        <span style={{ fontFamily: "ui-monospace, 'SF Mono', Menlo, monospace", fontSize: 22, fontWeight: 800, color: C.violet }}>{ticketNumber}</span>
      </div>
      <div className="lg-wa" style={{ textAlign: 'left', marginTop: 0 }}>
        <div className="lg-wa-title">One more thing: join the WhatsApp group</div>
        <div className="lg-wa-text">All RANGEELA &apos;26 updates and reminders are shared in this group.</div>
        <a href={RANGEELA.whatsappGroup} target="_blank" rel="noopener noreferrer" className="lg-wa-btn"><MessageCircle size={16} /> Join the WhatsApp group</a>
      </div>
      <p className="lg-help" style={{ marginTop: 16 }}>We also sent a confirmation to your email. If you cannot find it, check your spam or promotions folder.</p>
    </div>
  )
}
