'use client'

import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarDays, Clock, MapPin, Ticket, Upload, FileText, X, CheckCircle2, Copy, Check,
  Palette, Music, UtensilsCrossed, Gamepad2, Shirt, AlertTriangle, MessageCircle, ArrowLeft,
} from 'lucide-react'
import { RANGEELA, RANGEELA_BANK, AL_BATCHES, salesOpen } from '@/lib/rangeela'

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
  ink: '#2B1B2E',
  body: '#5B4A58',
  muted: '#8A7A86',
  canvas: '#FFF8F3',
}
const RAINBOW = `linear-gradient(90deg, ${C.magenta}, ${C.red}, ${C.orange}, ${C.yellow}, ${C.teal}, ${C.blue}, ${C.violet})`
const DISPLAY = "'Baloo 2', 'Inter', system-ui, sans-serif"
const BODY = "'Inter', system-ui, -apple-system, sans-serif"
const ease = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' },
  transition: { duration: 0.7, ease },
}

const EXPERIENCES = [
  { icon: Palette, color: C.magenta, bg: '#FFE8F4', title: 'Colour packets included', text: 'Your ticket covers the colours. Pick up your packets at the venue and let the hues fly.' },
  { icon: Music, color: C.violet, bg: '#F1E9FF', title: 'Music and DJ', text: 'Beats that keep the whole ground moving, from the first splash to the last.' },
  { icon: UtensilsCrossed, color: C.orange, bg: '#FFF0E0', title: 'Food stalls', text: 'Something tasty for when you need a break from all the dancing.' },
  { icon: Gamepad2, color: C.blue, bg: '#E7EEFF', title: 'Games', text: 'Fun games and activities to enjoy with your friends between the colour showers.' },
  { icon: Shirt, color: C.teal, bg: '#E2F8F6', title: 'Dress code: white', text: 'Come dressed in white. It is the best canvas for a thousand colours.' },
]

const STEPS = [
  { color: C.magenta, title: 'Transfer LKR 1,200', text: 'Deposit or transfer the ticket price to the AISCA bank account below.' },
  { color: C.orange, title: 'Fill the form', text: 'Enter your details and upload a photo or screenshot of your bank receipt.' },
  { color: C.teal, title: 'We verify', text: 'Our team checks every receipt by hand. You get a confirmation email as soon as your request is in.' },
  { color: C.violet, title: 'QR ticket in your inbox', text: 'Once approved, your personal QR ticket is emailed to you. Show it at the entrance.' },
]

const GOOD_TO_KNOW = [
  'One ticket admits one person. Each person needs to fill the form separately.',
  'Your QR code works only once. After it is scanned at the entrance it cannot be used again, so please do not share it.',
  'Bring your NIC or school ID. The name and number on your ticket may be checked at the gate.',
  'Tickets are non refundable and non transferable.',
  'Please buy your ticket before the event. Bank transfer is the main way to get one.',
  'Wear white, and bring a change of clothes if you need one for the ride home.',
]

type Uploaded = { url: string; filename: string }

const empty = { full_name: '', email: '', email_confirm: '', whatsapp: '', school: '', al_batch: '', nic: '' }

export default function RangeelaClient() {
  const open = salesOpen()
  const [f, setF] = useState({ ...empty })
  const [agree, setAgree] = useState(false)
  const [receipt, setReceipt] = useState<Uploaded | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<string | null>(null)
  const [copied, setCopied] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const formTop = useRef<HTMLDivElement>(null)

  const set = (k: keyof typeof empty, v: string) => setF((p) => ({ ...p, [k]: v }))
  const emailsMismatch =
    f.email_confirm.length > 3 && f.email.trim().toLowerCase() !== f.email_confirm.trim().toLowerCase()

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
    if (f.email.trim().toLowerCase() !== f.email_confirm.trim().toLowerCase())
      return fail('The two email addresses do not match. Your ticket is sent here, so please check it again.')
    if (f.whatsapp.replace(/\D/g, '').length < 9) return fail('Please enter a valid WhatsApp number.')
    if (!f.school.trim()) return fail('Please enter your school.')
    if (!f.al_batch) return fail('Please choose your A/L batch.')
    if (f.nic.replace(/[^A-Za-z0-9]/g, '').length < 4) return fail('Please enter your NIC or school ID number.')
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
        setTimeout(() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
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
    <main className="rg-root" style={{ background: C.canvas, minHeight: '100vh', fontFamily: BODY, fontWeight: 400, color: C.body, position: 'relative', overflow: 'hidden' }}>
      {/* colour powder glows */}
      <div aria-hidden className="rg-powder" style={{ top: 520, left: -220, background: 'radial-gradient(circle, rgba(230,0,126,0.22), transparent 62%)' }} />
      <div aria-hidden className="rg-powder" style={{ top: 900, right: -240, background: 'radial-gradient(circle, rgba(47,107,255,0.20), transparent 62%)' }} />
      <div aria-hidden className="rg-powder" style={{ top: 1700, left: -200, background: 'radial-gradient(circle, rgba(255,195,0,0.26), transparent 62%)' }} />
      <div aria-hidden className="rg-powder" style={{ top: 2500, right: -220, background: 'radial-gradient(circle, rgba(123,47,247,0.18), transparent 62%)' }} />
      <div aria-hidden className="rg-powder" style={{ top: 3300, left: -180, background: 'radial-gradient(circle, rgba(15,181,174,0.20), transparent 62%)' }} />

      {/* ── Top bar ── */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 1180, margin: '0 auto', padding: '18px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <a href="/" aria-label="AISCA home">
          <img src="/aisca-logo.webp" alt="AISCA" style={{ height: 34, width: 'auto', filter: 'brightness(0)', opacity: 0.85 }} />
        </a>
        <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: C.ink, textDecoration: 'none', padding: '8px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(43,27,46,0.10)' }}>
          <ArrowLeft size={14} /> aisca.lk
        </a>
      </div>

      {/* ── Hero artwork ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 1180, margin: '0 auto', padding: '16px 16px 0' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease }}
          style={{ borderRadius: 28, overflow: 'hidden', boxShadow: '0 30px 80px -30px rgba(123,47,247,0.45), 0 10px 30px -15px rgba(230,0,126,0.35)' }}
        >
          <picture>
            <source media="(max-width: 640px)" srcSet="/rangeela/square.webp" />
            <img src="/rangeela/banner.webp" alt="RANGEELA '26, A Celebration of Hues, by AISCA" style={{ display: 'block', width: '100%', height: 'auto' }} />
          </picture>
        </motion.div>
      </section>

      {/* ── Caption ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 820, margin: '0 auto', padding: '56px 22px 10px', textAlign: 'center' }}>
        <motion.div {...fadeUp}>
          <span className="rg-eyebrow">AISCA presents</span>
          <h1 style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 'clamp(2.1rem, 6vw, 3.6rem)', lineHeight: 1.05, margin: '10px 0 18px', color: C.ink }}>
            The colours are <span className="rg-rainbow-text">calling.</span>
          </h1>
          <p style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 'clamp(1.15rem, 3vw, 1.45rem)', color: C.ink, margin: '0 0 14px' }}>
            The celebration is about to begin.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 620, margin: '0 auto' }}>
            One canvas. A thousand hues. Countless memories waiting to be made. Get ready to glow with colours and celebrate together at RANGEELA &apos;26, A Celebration of Hues.
          </p>
        </motion.div>

        {/* Facts */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.1 }} className="rg-facts">
          {[
            { icon: CalendarDays, label: 'Date', value: RANGEELA.dateShort, sub: 'Saturday, 2026', color: C.orange },
            { icon: Clock, label: 'Time', value: '3.00 PM', sub: 'onwards', color: C.magenta },
            { icon: MapPin, label: 'Venue', value: 'Hyde Park', sub: 'Grounds, Colombo', color: C.blue },
            { icon: Ticket, label: 'Ticket', value: `LKR ${RANGEELA.price.toLocaleString()}`, sub: 'per person', color: C.violet },
          ].map((x) => (
            <div key={x.label} className="rg-fact">
              <x.icon size={20} color={x.color} strokeWidth={2.2} />
              <span style={{ fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: C.muted, fontWeight: 700, marginTop: 10 }}>{x.label}</span>
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 22, color: x.color, lineHeight: 1.1, marginTop: 4 }}>{x.value}</span>
              <span style={{ fontSize: 12.5, color: C.muted }}>{x.sub}</span>
            </div>
          ))}
        </motion.div>

        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.15 }} style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 30 }}>
          <a href="#tickets" className="rg-btn">Get your ticket</a>
          <a href={RANGEELA.whatsappGroup} target="_blank" rel="noopener noreferrer" className="rg-btn-ghost">
            <MessageCircle size={16} /> Join the WhatsApp group
          </a>
        </motion.div>
      </section>

      {/* ── What's waiting ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '80px 20px 20px' }}>
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: 34 }}>
          <span className="rg-eyebrow">What is waiting for you</span>
          <h2 className="rg-h2">An afternoon made of colour</h2>
        </motion.div>
        <div className="rg-exp-grid">
          {EXPERIENCES.map((x, i) => (
            <motion.div key={x.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.06 }} className="rg-card" style={{ padding: '26px 22px' }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, background: x.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <x.icon size={22} color={x.color} strokeWidth={2.2} />
              </div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 19, color: C.ink, marginBottom: 6, lineHeight: 1.2 }}>{x.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.65 }}>{x.text}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '70px 20px 10px' }}>
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: 34 }}>
          <span className="rg-eyebrow">How to get your ticket</span>
          <h2 className="rg-h2">Four simple steps</h2>
        </motion.div>
        <div className="rg-steps">
          {STEPS.map((s, i) => (
            <motion.div key={s.title} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }} className="rg-card" style={{ padding: '24px 22px' }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: s.color, color: '#fff', fontFamily: DISPLAY, fontWeight: 800, fontSize: 19, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14, boxShadow: `0 8px 20px -8px ${s.color}` }}>{i + 1}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 18.5, color: C.ink, marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.65 }}>{s.text}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Tickets ── */}
      <section id="tickets" style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', padding: '80px 20px 20px', scrollMarginTop: 20 }}>
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: 34 }}>
          <span className="rg-eyebrow">Tickets</span>
          <h2 className="rg-h2">Get your RANGEELA &apos;26 ticket</h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 560, margin: '10px auto 0' }}>
            LKR {RANGEELA.price.toLocaleString()} per person. Pay by bank transfer, upload the receipt, and your QR ticket comes to your email once we confirm the payment.
          </p>
        </motion.div>

        <div className="rg-ticket-grid">
          {/* Bank details */}
          <motion.div {...fadeUp} className="rg-card rg-rainbow-border" style={{ padding: '28px 24px', alignSelf: 'start' }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: C.ink, marginBottom: 6 }}>Step 1: Pay</div>
            <p style={{ fontSize: 14, lineHeight: 1.65, margin: '0 0 18px' }}>
              Transfer or deposit <strong style={{ color: C.ink }}>LKR {RANGEELA.price.toLocaleString()}</strong> to this account. If your bank lets you add a reference, please use your name.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                ['Account No', RANGEELA_BANK.account, 'account'],
                ['Account Name', RANGEELA_BANK.name, 'name'],
                ['Bank', RANGEELA_BANK.bank, ''],
                ['Branch', RANGEELA_BANK.branch, ''],
              ] as [string, string, string][]).map(([k, v, key]) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', borderRadius: 14, background: '#FFFFFF', border: '1px solid rgba(43,27,46,0.08)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: C.muted, fontWeight: 700 }}>{k}</div>
                    <div style={{ fontSize: key === 'account' ? 19 : 14, fontWeight: key === 'account' ? 800 : 600, color: C.ink, fontFamily: key === 'account' ? 'ui-monospace, monospace' : BODY, wordBreak: 'break-word' }}>{v}</div>
                  </div>
                  {key && (
                    <button type="button" onClick={() => copy(key, v)} aria-label={`Copy ${k}`}
                      style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 11px', borderRadius: 999, border: '1px solid rgba(43,27,46,0.12)', background: copied === key ? '#E9F9EF' : '#FAF6F9', color: copied === key ? C.green : C.ink, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      {copied === key ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, padding: '14px 16px', borderRadius: 14, background: '#F1FBF4', border: '1px solid #CDEFD8' }}>
              <div style={{ fontWeight: 700, color: '#14532D', fontSize: 14, marginBottom: 4 }}>Join the WhatsApp group</div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: '#3F6B4F', marginBottom: 10 }}>
                Whether you have just filled the form or already have your ticket, please join. All updates are shared here.
              </div>
              <a href={RANGEELA.whatsappGroup} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#25D366', color: '#fff', padding: '9px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                <MessageCircle size={15} /> Join now
              </a>
            </div>
          </motion.div>

          {/* Form / success */}
          <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.08 }} className="rg-card" style={{ padding: 'clamp(22px, 4vw, 34px)', scrollMarginTop: 20 }} ref={formTop}>
            {done ? (
              <SuccessCard ticketNumber={done} email={f.email} />
            ) : !open ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 26, color: C.ink, marginBottom: 10 }}>Online sales are closed</div>
                <p style={{ fontSize: 14.5, lineHeight: 1.7 }}>
                  Thank you for the amazing response. Online tickets for RANGEELA &apos;26 are no longer available. Please check the WhatsApp group for updates.
                </p>
              </div>
            ) : (
              <>
                <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 20, color: C.ink, marginBottom: 4 }}>Step 2: Your details</div>
                <p style={{ fontSize: 13.5, lineHeight: 1.6, margin: '0 0 20px', color: C.muted }}>One form for each person. Every field is required.</p>

                {error && (
                  <div role="alert" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', borderRadius: 14, background: '#FFF0F0', border: '1px solid #FBC6C6', color: '#B42318', fontSize: 13.5, lineHeight: 1.55, marginBottom: 18 }}>
                    <AlertTriangle size={17} style={{ flexShrink: 0, marginTop: 1 }} /> <span>{error}</span>
                  </div>
                )}

                <div className="rg-form-grid">
                  <Field label="Full name" hint="As it appears on your NIC or school ID" full>
                    <input className="rg-input" value={f.full_name} onChange={(e) => set('full_name', e.target.value)} autoComplete="name" maxLength={200} placeholder="e.g. Kavindi Perera" />
                  </Field>

                  <div className="rg-email-box" style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start', marginBottom: 12, fontSize: 13, lineHeight: 1.55, color: '#8A4B00' }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span><strong>Please check your email twice.</strong> Your QR ticket is sent to this address. If the email is wrong, your ticket will not reach you.</span>
                    </div>
                    <div className="rg-form-grid" style={{ gap: 14 }}>
                      <Field label="Email address">
                        <input className="rg-input" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
                      </Field>
                      <Field label="Type your email again">
                        <input className="rg-input" type="email" inputMode="email" autoComplete="off" value={f.email_confirm} onChange={(e) => set('email_confirm', e.target.value)} onPaste={(e) => e.preventDefault()} placeholder="Type it once more"
                          style={emailsMismatch ? { borderColor: '#F04438', background: '#FFF6F6' } : undefined} />
                        {emailsMismatch && <span style={{ fontSize: 12, color: '#B42318', marginTop: 5, display: 'block' }}>These emails do not match yet.</span>}
                      </Field>
                    </div>
                  </div>

                  <Field label="WhatsApp number">
                    <input className="rg-input" type="tel" inputMode="tel" autoComplete="tel" value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} placeholder="07X XXX XXXX" maxLength={20} />
                  </Field>
                  <Field label="NIC or school ID number">
                    <input className="rg-input" value={f.nic} onChange={(e) => set('nic', e.target.value)} placeholder="e.g. 200712345678" maxLength={30} />
                  </Field>
                  <Field label="School">
                    <input className="rg-input" value={f.school} onChange={(e) => set('school', e.target.value)} placeholder="Your school" maxLength={200} />
                  </Field>
                  <Field label="A/L batch">
                    <select className="rg-input" value={f.al_batch} onChange={(e) => set('al_batch', e.target.value)} style={{ cursor: 'pointer' }}>
                      <option value="">Choose your batch</option>
                      {AL_BATCHES.map((b) => <option key={b} value={b}>{/^\d+$/.test(b) ? `${b} A/L` : b}</option>)}
                    </select>
                  </Field>

                  <Field label="Bank receipt" hint="A clear photo, screenshot or PDF of your payment slip" full>
                    <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleReceipt} style={{ display: 'none' }} />
                    {receipt ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 14, background: '#F1FBF4', border: '1px solid #BFE8CD', minWidth: 0 }}>
                        <FileText size={18} color={C.green} style={{ flexShrink: 0 }} />
                        <span style={{ fontSize: 13.5, color: C.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>{receipt.filename}</span>
                        <button type="button" onClick={() => setReceipt(null)} aria-label="Remove receipt" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.muted, display: 'flex' }}><X size={17} /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="rg-upload">
                        <Upload size={20} />
                        <span style={{ fontWeight: 700, color: C.ink }}>{uploading ? 'Uploading your receipt...' : 'Tap to upload your receipt'}</span>
                        <span style={{ fontSize: 12, color: C.muted }}>JPG, PNG, HEIC or PDF, up to 15 MB</span>
                      </button>
                    )}
                  </Field>
                </div>

                <label style={{ display: 'flex', gap: 11, alignItems: 'flex-start', marginTop: 22, cursor: 'pointer', fontSize: 13.5, lineHeight: 1.6 }}>
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2, accentColor: C.violet, flexShrink: 0 }} />
                  <span>I confirm my details are correct. I understand the ticket is non refundable and non transferable, and the QR code allows one entry only.</span>
                </label>

                <button type="button" onClick={submit} disabled={submitting || uploading} className="rg-btn" style={{ width: '100%', marginTop: 22, justifyContent: 'center', opacity: submitting || uploading ? 0.6 : 1 }}>
                  {submitting ? 'Submitting...' : 'Submit ticket request'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 12.5, color: C.muted, marginTop: 12 }}>
                  Need help? WhatsApp AISCA on{' '}
                  <a href={`https://wa.me/${RANGEELA.helpWhatsapp}`} target="_blank" rel="noopener noreferrer" style={{ color: C.violet, fontWeight: 600 }}>{RANGEELA.helpWhatsappLabel}</a>
                </p>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Good to know ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 820, margin: '0 auto', padding: '80px 20px 30px' }}>
        <motion.div {...fadeUp} style={{ textAlign: 'center', marginBottom: 28 }}>
          <span className="rg-eyebrow">Good to know</span>
          <h2 className="rg-h2">Before you come</h2>
        </motion.div>
        <motion.div {...fadeUp} className="rg-card" style={{ padding: '10px 24px' }}>
          {GOOD_TO_KNOW.map((t, i) => (
            <div key={t} style={{ display: 'flex', gap: 14, padding: '16px 0', borderTop: i ? '1px solid rgba(43,27,46,0.07)' : 'none', fontSize: 14.5, lineHeight: 1.65 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 7, flexShrink: 0, background: [C.magenta, C.orange, C.yellow, C.teal, C.blue, C.violet][i % 6] }} />
              <span>{t}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Closing ── */}
      <section style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', padding: '60px 20px 90px', textAlign: 'center' }}>
        <motion.div {...fadeUp}>
          <img src="/rangeela/logo.webp" alt="RANGEELA '26" style={{ width: '100%', maxWidth: 420, height: 'auto', margin: '0 auto 18px', display: 'block' }} />
          <p style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 'clamp(1.1rem, 3.4vw, 1.5rem)', color: C.ink, margin: '0 0 22px' }}>
            {RANGEELA.dateLabel} · {RANGEELA.timeLabel}<br />{RANGEELA.venue}, {RANGEELA.venueArea}
          </p>
          <a href="#tickets" className="rg-btn">Get your ticket</a>
        </motion.div>
      </section>

      <footer style={{ position: 'relative', zIndex: 2, borderTop: '1px solid rgba(43,27,46,0.08)', background: 'rgba(255,255,255,0.6)' }}>
        <div style={{ height: 5, background: RAINBOW }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '22px 20px', display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, color: C.muted }}>
          <span>RANGEELA &apos;26 is organised by the All Island Schools Commerce Association.</span>
          <a href="/" style={{ color: C.ink, fontWeight: 600, textDecoration: 'none' }}>aisca.lk</a>
        </div>
      </footer>

      <style>{`
        .rg-root ::selection { background: rgba(230,0,126,0.18); color: ${C.ink}; }
        .rg-powder { position: absolute; width: 640px; height: 640px; filter: blur(40px); pointer-events: none; z-index: 1; }
        .rg-eyebrow { display: inline-block; font-size: 11.5px; letter-spacing: 0.24em; text-transform: uppercase; font-weight: 700; background: ${RAINBOW}; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .rg-h2 { font-family: ${DISPLAY}; font-weight: 800; font-size: clamp(1.8rem, 4.6vw, 2.7rem); line-height: 1.1; color: ${C.ink}; margin: 8px 0 0; }
        .rg-rainbow-text { background: ${RAINBOW}; -webkit-background-clip: text; background-clip: text; color: transparent; }
        .rg-card { background: rgba(255,255,255,0.82); border: 1px solid rgba(43,27,46,0.07); border-radius: 22px; box-shadow: 0 18px 50px -30px rgba(43,27,46,0.35); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .rg-rainbow-border { border: 2px solid transparent; background: linear-gradient(#FFFCFA, #FFFCFA) padding-box, ${RAINBOW} border-box; }
        .rg-facts { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 38px; }
        .rg-fact { display: flex; flex-direction: column; align-items: center; padding: 20px 10px; border-radius: 20px; background: rgba(255,255,255,0.85); border: 1px solid rgba(43,27,46,0.07); box-shadow: 0 14px 40px -28px rgba(43,27,46,0.4); }
        .rg-exp-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; }
        .rg-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .rg-ticket-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 20px; }
        .rg-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .rg-email-box { padding: 16px; border-radius: 16px; background: #FFF8EC; border: 1px solid #FFD89A; }
        .rg-input { width: 100%; padding: 12px 14px; border-radius: 12px; border: 1.5px solid rgba(43,27,46,0.14); background-color: #FFFFFF; color: ${C.ink}; font-size: 16px; font-family: ${BODY}; outline: none; transition: border-color .2s, box-shadow .2s; -webkit-appearance: none; appearance: none; }
        select.rg-input { background-image: linear-gradient(45deg, transparent 50%, ${C.muted} 50%), linear-gradient(135deg, ${C.muted} 50%, transparent 50%); background-position: calc(100% - 20px) 52%, calc(100% - 15px) 52%; background-size: 5px 5px; background-repeat: no-repeat; padding-right: 36px; }
        .rg-input::placeholder { color: #B6A9B3; }
        .rg-input:focus { border-color: ${C.violet}; box-shadow: 0 0 0 4px rgba(123,47,247,0.12); }
        .rg-upload { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 22px 14px; border-radius: 16px; border: 2px dashed rgba(123,47,247,0.35); background: #FBF8FF; color: ${C.violet}; font-size: 14px; cursor: pointer; font-family: ${BODY}; transition: background .2s, border-color .2s; }
        .rg-upload:hover { background: #F4EDFF; border-color: ${C.violet}; }
        .rg-btn { display: inline-flex; align-items: center; gap: 8px; padding: 15px 30px; border-radius: 999px; border: none; cursor: pointer; background: linear-gradient(90deg, ${C.magenta}, ${C.orange}, ${C.violet}); background-size: 200% 100%; color: #fff; font-family: ${DISPLAY}; font-weight: 800; font-size: 17px; letter-spacing: 0.01em; text-decoration: none; box-shadow: 0 16px 34px -14px rgba(230,0,126,0.6); transition: background-position .5s ease, transform .2s ease; }
        .rg-btn:hover { background-position: 100% 0; transform: translateY(-1px); }
        .rg-btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 14px 24px; border-radius: 999px; background: #FFFFFF; border: 1.5px solid rgba(43,27,46,0.12); color: ${C.ink}; font-weight: 700; font-size: 14.5px; text-decoration: none; transition: border-color .2s; }
        .rg-btn-ghost:hover { border-color: #25D366; }
        @media (max-width: 980px) {
          .rg-exp-grid { grid-template-columns: repeat(2, 1fr); }
          .rg-steps { grid-template-columns: repeat(2, 1fr); }
          .rg-ticket-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .rg-facts { grid-template-columns: repeat(2, 1fr); }
          .rg-form-grid { grid-template-columns: 1fr; }
          .rg-exp-grid { grid-template-columns: 1fr; }
          .rg-steps { grid-template-columns: 1fr; }
          .rg-powder { width: 420px; height: 420px; }
          .rg-btn { font-size: 16px; padding: 14px 24px; }
        }
      `}</style>
    </main>
  )
}

function Field({ label, hint, full, children }: { label: string; hint?: string; full?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined, minWidth: 0 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 6 }}>{label}</label>
      {children}
      {hint && <span style={{ display: 'block', fontSize: 12, color: C.muted, marginTop: 5 }}>{hint}</span>}
    </div>
  )
}

function SuccessCard({ ticketNumber, email }: { ticketNumber: string; email: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '10px 4px' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E9F9EF', color: C.green }}>
        <CheckCircle2 size={34} />
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 28, color: C.ink, lineHeight: 1.15, marginBottom: 10 }}>Request received!</div>
      <p style={{ fontSize: 14.5, lineHeight: 1.7, margin: '0 auto 20px', maxWidth: 440 }}>
        Thank you. Our team will check your receipt, and once it is confirmed your QR ticket will be emailed to{' '}
        <strong style={{ color: C.ink, wordBreak: 'break-all' }}>{email.trim().toLowerCase()}</strong>.
      </p>
      <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 4, padding: '14px 26px', borderRadius: 16, background: '#FBF8FF', border: '1.5px dashed rgba(123,47,247,0.4)', marginBottom: 22 }}>
        <span style={{ fontSize: 10.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.muted, fontWeight: 700 }}>Your reference</span>
        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 22, fontWeight: 800, color: C.violet }}>{ticketNumber}</span>
      </div>
      <div style={{ padding: '18px 18px', borderRadius: 16, background: '#F1FBF4', border: '1px solid #CDEFD8', textAlign: 'left' }}>
        <div style={{ fontWeight: 800, color: '#14532D', fontSize: 15, marginBottom: 4 }}>One more thing: join the WhatsApp group</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6, color: '#3F6B4F', marginBottom: 12 }}>All RANGEELA &apos;26 updates and reminders are shared in this group.</div>
        <a href={RANGEELA.whatsappGroup} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#25D366', color: '#fff', padding: '11px 20px', borderRadius: 999, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          <MessageCircle size={16} /> Join the WhatsApp group
        </a>
      </div>
      <p style={{ fontSize: 12.5, color: C.muted, marginTop: 16 }}>
        We also sent a confirmation to your email. If you cannot find it, check your spam or promotions folder.
      </p>
    </div>
  )
}
