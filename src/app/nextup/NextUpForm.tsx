'use client'

import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, X, FileText, CheckCircle2 } from 'lucide-react'

const RED = '#e11d2a'
const DISPLAY = "'Anton', system-ui, sans-serif"
const BODY = "'Inter', system-ui, -apple-system, sans-serif"

type Mode = '' | 'self' | 'referral'
interface Uploaded { url: string; filename: string }

const SUPPORT = [
  { name: 'Sachindra', phone: '074 254 2662' },
  { name: 'Kovida', phone: '077 158 5048' },
]

function Support() {
  return (
    <div style={{ marginTop: 22, textAlign: 'center' }}>
      <p style={{ fontSize: 10.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 10 }}>
        Need help? Contact
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
        {SUPPORT.map((c) => (
          <a key={c.name} href={`tel:${c.phone.replace(/\s/g, '')}`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '9px 15px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)', textDecoration: 'none' }}>
            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{c.name}</span>
            <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, fontFamily: 'monospace' }}>{c.phone}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

const emptyForm = {
  // referral
  referrer_name: '', referrer_phone: '', referrer_relationship: '',
  referred_founder_name: '', referred_founder_phone: '',
  // self
  full_name: '', age: '', school: '', district: '', whatsapp: '', email: '', social_handle: '',
  venture_name: '', venture_description: '', venture_start: '', venture_stage: '', role: '',
  proud_achievement: '', story: '', work_links: '',
}

export default function NextUpForm() {
  const [mode, setMode] = useState<Mode>('')
  const [f, setF] = useState({ ...emptyForm })
  const [podcast, setPodcast] = useState<null | boolean>(null)
  const [consent, setConsent] = useState(false)
  const [guardian, setGuardian] = useState(false)

  const [uploads, setUploads] = useState<Uploaded[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (k: keyof typeof f, v: string) => setF(prev => ({ ...prev, [k]: v }))

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    const remaining = 8 - uploads.length
    if (remaining <= 0) { setError('You can upload up to 8 files.'); return }
    setUploading(true); setError('')
    const results: Uploaded[] = []
    for (const file of files.slice(0, remaining)) {
      try {
        const fd = new FormData(); fd.append('file', file)
        const res = await fetch('/api/nextup/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (res.ok && data.url) results.push({ url: data.url, filename: data.filename || file.name })
        else setError(data.error || 'A file could not be uploaded.')
      } catch { setError('A file could not be uploaded. Check your connection.') }
    }
    if (results.length) setUploads(prev => [...prev, ...results])
    setUploading(false)
  }

  async function submit() {
    setError('')
    if (!mode) { setError('Please choose whether you are applying or referring.'); return }

    let body: Record<string, unknown>
    if (mode === 'referral') {
      if (!f.referrer_name.trim()) { setError('Please tell us your name.'); return }
      if (f.referrer_phone.replace(/\D/g, '').length < 9) { setError('Please enter your contact number.'); return }
      if (!f.referred_founder_name.trim()) { setError("Please enter the founder's name."); return }
      if (f.referred_founder_phone.replace(/\D/g, '').length < 9) { setError("Please enter the founder's contact number."); return }
      body = {
        application_type: 'referral',
        referrer_name: f.referrer_name, referrer_phone: f.referrer_phone,
        referrer_relationship: f.referrer_relationship,
        referred_founder_name: f.referred_founder_name, referred_founder_phone: f.referred_founder_phone,
      }
    } else {
      if (!f.full_name.trim()) { setError('Please enter your full name.'); return }
      if (!f.age.trim()) { setError('Please tell us your age.'); return }
      if (!f.school.trim()) { setError('Please tell us your school.'); return }
      if (!f.district.trim()) { setError('Please tell us your district.'); return }
      if (f.whatsapp.replace(/\D/g, '').length < 9) { setError('Please enter a valid WhatsApp number.'); return }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) { setError('Please enter a valid email address.'); return }
      if (!f.venture_name.trim()) { setError('Please name your venture.'); return }
      if (!f.venture_description.trim()) { setError('Please tell us what it does.'); return }
      if (!f.story.trim()) { setError('Please share your story.'); return }
      if (uploads.length === 0) { setError('Please upload at least one photo of yourself and your work.'); return }
      if (!consent) { setError('Please tick the consent box to continue.'); return }
      body = {
        application_type: 'self', ...f,
        willing_podcast: podcast === true, consent, guardian_consent: guardian, uploads,
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/nextup/apply', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok && data.success) { setDone(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }
      else setError(data.error || 'Could not submit. Please try again.')
    } catch { setError('Network error. Please try again.') }
    finally { setSubmitting(false) }
  }

  return (
    <main style={{ background: '#08080a', minHeight: '100vh', fontFamily: BODY, color: '#fff', position: 'relative', overflow: 'hidden' }}>
      {/* red glows */}
      <div style={{ position: 'absolute', top: -120, left: -120, width: 620, height: 620, background: 'radial-gradient(circle, rgba(225,29,42,0.28), transparent 62%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 380, right: -160, width: 560, height: 560, background: 'radial-gradient(circle, rgba(225,29,42,0.14), transparent 62%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 760, margin: '0 auto', padding: '28px 22px 100px' }}>
        {/* Logos row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 40 }}>
          <img src="/nextup/aisca.webp" alt="AISCA" className="nx-aisca" />
          <img src="/nextup/ba-junior.webp" alt="Business Advisor Junior" className="nx-ba" />
        </div>

        {done ? (
          <SuccessCard />
        ) : (
          <>
            {/* Hero */}
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <img src="/nextup/nextup.webp" alt="NextUp" style={{ width: '100%', maxWidth: 340, height: 'auto', margin: '0 auto 18px', display: 'block' }} />
              <p style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.4rem, 4.5vw, 2.1rem)', color: RED, letterSpacing: '0.01em', margin: '0 0 12px' }}>
                EMPOWERING SRI LANKA&apos;S YOUNGEST MINDS
              </p>
              <p className="nx-intro" style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.7)', maxWidth: 620, margin: '0 auto' }}>
                NextUp is a national initiative by AISCA, in partnership with Business Advisor Junior, spotlighting the country&apos;s boldest young entrepreneurs, changemakers, and innovators. If you are nineteen or under and already building something real, this is your moment to be seen. Up to twenty young founders will be featured in a professionally produced AISCA e-magazine and a podcast-style video series with Business Advisor Junior.
              </p>
              <div style={{ display: 'inline-block', marginTop: 18, padding: '9px 18px', borderRadius: 999, background: 'rgba(225,29,42,0.12)', border: `1px solid ${RED}66`, color: '#fff', fontSize: 12.5, fontWeight: 700, letterSpacing: '0.06em' }}>
                Applications close on 16th August 2026
              </div>
              <Support />
            </div>

            {/* Who this is for */}
            <Card>
              <SectionLabel>Who this is for</SectionLabel>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  'You are a Sri Lankan student aged nineteen or under.',
                  'You are already running or building a business, project, or venture, not just an idea on paper.',
                  'You are ready to share your story publicly.',
                  'You can apply for yourself, or refer someone you believe deserves the spotlight.',
                ].map((t) => (
                  <li key={t} style={{ display: 'flex', gap: 10, fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 1.6 }}>
                    <span style={{ color: RED, fontWeight: 800, flexShrink: 0 }}>›</span>{t}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Mode selector */}
            <Card>
              <SectionLabel>Application</SectionLabel>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>Are you applying for yourself, or referring someone you know?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                {([['self', 'Applying for myself'], ['referral', 'Referring someone']] as [Mode, string][]).map(([val, label]) => {
                  const on = mode === val
                  return (
                    <button key={val} onClick={() => { setMode(val); setError('') }}
                      style={{
                        padding: '16px 18px', borderRadius: 14, textAlign: 'left', cursor: 'pointer',
                        background: on ? 'rgba(225,29,42,0.14)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${on ? RED : 'rgba(255,255,255,0.12)'}`,
                        color: '#fff', fontSize: 14.5, fontWeight: 700, transition: 'all 0.2s',
                      }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${on ? RED : 'rgba(255,255,255,0.3)'}`, background: on ? RED : 'transparent', flexShrink: 0 }} />
                        {label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Card>

            <AnimatePresence mode="wait">
              {mode === 'referral' && (
                <motion.div key="ref" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card>
                    <SectionLabel>Referring someone</SectionLabel>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.6)', marginBottom: 18 }}>Please tell us about yourself first, then the founder you&apos;re referring. We&apos;ll reach out to them directly.</p>
                    <Grid>
                      <Field label="Your name" required><input className="nx-input" value={f.referrer_name} onChange={e => set('referrer_name', e.target.value)} /></Field>
                      <Field label="Your contact number" required><input className="nx-input" value={f.referrer_phone} onChange={e => set('referrer_phone', e.target.value)} placeholder="+94 7X XXX XXXX" /></Field>
                    </Grid>
                    <Field label="How do you know this person?"><input className="nx-input" value={f.referrer_relationship} onChange={e => set('referrer_relationship', e.target.value)} /></Field>
                    <Grid>
                      <Field label="The founder's name" required><input className="nx-input" value={f.referred_founder_name} onChange={e => set('referred_founder_name', e.target.value)} /></Field>
                      <Field label="The founder's contact number" required><input className="nx-input" value={f.referred_founder_phone} onChange={e => set('referred_founder_phone', e.target.value)} placeholder="So we can reach them" /></Field>
                    </Grid>
                  </Card>
                </motion.div>
              )}

              {mode === 'self' && (
                <motion.div key="self" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <Card>
                    <SectionLabel>About you</SectionLabel>
                    <Field label="What is your full name?" required><input className="nx-input" value={f.full_name} onChange={e => set('full_name', e.target.value)} /></Field>
                    <Grid>
                      <Field label="How old are you right now?" required hint="Confirm you are 19 or under as of August 2026."><input className="nx-input" value={f.age} onChange={e => set('age', e.target.value)} /></Field>
                      <Field label="Which district are you based in?" required><input className="nx-input" value={f.district} onChange={e => set('district', e.target.value)} /></Field>
                    </Grid>
                    <Field label="Which school do you attend?" required><input className="nx-input" value={f.school} onChange={e => set('school', e.target.value)} /></Field>
                    <Grid>
                      <Field label="Your WhatsApp number" required><input className="nx-input" value={f.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+94 7X XXX XXXX" /></Field>
                      <Field label="Your email address" required><input className="nx-input" type="email" value={f.email} onChange={e => set('email', e.target.value)} /></Field>
                    </Grid>
                    <Field label="Instagram / social handle for your venture" hint="If you have one."><input className="nx-input" value={f.social_handle} onChange={e => set('social_handle', e.target.value)} placeholder="@yourventure" /></Field>
                  </Card>

                  <Card>
                    <SectionLabel>About what you are building</SectionLabel>
                    <Field label="Name of your business, project, or venture" required><input className="nx-input" value={f.venture_name} onChange={e => set('venture_name', e.target.value)} /></Field>
                    <Field label="Tell us what it does, in a sentence or two" required><textarea className="nx-input" rows={2} value={f.venture_description} onChange={e => set('venture_description', e.target.value)} /></Field>
                    <Grid>
                      <Field label="When did you start it?"><input className="nx-input" value={f.venture_start} onChange={e => set('venture_start', e.target.value)} /></Field>
                      <Field label="What is your role in it?"><input className="nx-input" value={f.role} onChange={e => set('role', e.target.value)} /></Field>
                    </Grid>
                    <Field label="Where is it right now?" hint="Making sales? Have customers or users? Still getting it off the ground?"><textarea className="nx-input" rows={2} value={f.venture_stage} onChange={e => set('venture_stage', e.target.value)} /></Field>
                    <Field label="The one achievement so far you are most proud of"><textarea className="nx-input" rows={2} value={f.proud_achievement} onChange={e => set('proud_achievement', e.target.value)} /></Field>
                    <Field label="Why should NextUp feature you?" required hint="Tell us your story in your own words. This is the part we care about most, so take your time.">
                      <textarea className="nx-input" rows={6} value={f.story} onChange={e => set('story', e.target.value)} />
                    </Field>
                    <Field label="Share any links that show your work" hint="A website, an online shop, a social page, anything that lets us see what you have built."><textarea className="nx-input" rows={2} value={f.work_links} onChange={e => set('work_links', e.target.value)} /></Field>
                  </Card>

                  <Card>
                    <SectionLabel>Photos of you and your work</SectionLabel>
                    <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 16 }}>
                      Upload a few photos that help us tell your story. Please include a clear photo of yourself, photos or documents of what you have built, moments worth showing, and anything that proves the journey (awards, recognition, press, early days vs now). Images or PDFs, up to 8 files.
                    </p>
                    <input ref={fileRef} type="file" accept="image/*,application/pdf" multiple onChange={handleFiles} style={{ display: 'none' }} />
                    {uploads.length < 8 && (
                      <button onClick={() => fileRef.current?.click()} disabled={uploading}
                        style={{ width: '100%', padding: '22px', borderRadius: 14, border: `1.5px dashed ${RED}66`, background: 'rgba(225,29,42,0.05)', color: '#fff', cursor: uploading ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                        <Upload size={22} color={RED} />
                        <span style={{ fontSize: 13.5, fontWeight: 700 }}>{uploading ? 'Uploading…' : 'Upload photos & documents'}</span>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)' }}>{uploads.length}/8 files · images or PDF, up to 25 MB each</span>
                      </button>
                    )}
                    {uploads.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 10, marginTop: 14 }}>
                        {uploads.map((u, i) => {
                          const isPdf = /\.pdf($|\?)/i.test(u.url)
                          return (
                            <div key={i} style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', aspectRatio: '1', background: '#111', border: '1px solid rgba(255,255,255,0.1)' }}>
                              {isPdf ? (
                                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, color: 'rgba(255,255,255,0.6)', padding: 8 }}>
                                  <FileText size={26} />
                                  <span style={{ fontSize: 10, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>{u.filename}</span>
                                </div>
                              ) : (
                                <img src={u.url} alt={u.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              )}
                              <button onClick={() => setUploads(prev => prev.filter((_, j) => j !== i))}
                                style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 7, background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <X size={13} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </Card>

                  <Card>
                    <SectionLabel>A few last things</SectionLabel>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', marginBottom: 12 }}>If selected, are you willing to appear in a podcast-style video with Business Advisor Junior?</p>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
                      {([[true, 'Yes'], [false, 'No']] as [boolean, string][]).map(([val, label]) => {
                        const on = podcast === val
                        return (
                          <button key={label} onClick={() => setPodcast(val)}
                            style={{ flex: 1, padding: '11px', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, background: on ? 'rgba(225,29,42,0.16)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${on ? RED : 'rgba(255,255,255,0.12)'}`, color: '#fff' }}>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                    <Check checked={consent} onToggle={() => setConsent(v => !v)}>
                      I confirm the information above is true, and I give AISCA permission to feature my story, name, and photo in the NextUp e-magazine and video series.
                    </Check>
                    <Check checked={guardian} onToggle={() => setGuardian(v => !v)}>
                      If I am under eighteen, a parent or guardian is aware of this application and agrees to it.
                    </Check>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {mode && (
              <>
                {error && <p style={{ color: '#ff6b6b', fontSize: 13.5, textAlign: 'center', marginTop: 18 }}>⚠️ {error}</p>}
                <button onClick={submit} disabled={submitting} className="nx-submit">
                  {submitting ? 'Submitting…' : 'Submit application'}
                </button>
              </>
            )}
          </>
        )}
      </div>

      <style>{`
        .nx-aisca { height: 44px !important; width: auto !important; object-fit: contain; }
        .nx-ba { height: 74px !important; width: auto !important; object-fit: contain; }
        @media (max-width: 767px) {
          .nx-aisca { height: 28px !important; }
          .nx-ba { height: 52px !important; }
          .nx-intro { font-size: 12.5px !important; line-height: 1.6 !important; }
        }
        .nx-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 11px;
          padding: 12px 14px;
          font-size: 14px;
          color: #fff;
          outline: none;
          font-family: ${BODY};
          transition: border-color 0.2s, background 0.2s;
          resize: vertical;
        }
        .nx-input::placeholder { color: rgba(255,255,255,0.3); }
        .nx-input:focus { border-color: ${RED}; background: rgba(255,255,255,0.06); }
        .nx-submit {
          width: 100%; margin-top: 22px; min-height: 56px; border: none; border-radius: 14px;
          background: ${RED}; color: #fff; font-weight: 800; font-size: 15px; letter-spacing: 0.03em;
          text-transform: uppercase; cursor: pointer; transition: filter 0.2s, transform 0.2s;
          font-family: ${BODY};
        }
        .nx-submit:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .nx-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </main>
  )
}

/* ── small building blocks ── */
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)', padding: 'clamp(20px, 4vw, 30px)', marginBottom: 18 }}>
      {children}
    </div>
  )
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.4rem, 4vw, 1.9rem)', color: '#fff', letterSpacing: '0.01em', margin: '0 0 18px', textTransform: 'uppercase' }}>
      {children}
    </h2>
  )
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>{children}</div>
}
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', marginBottom: hint ? 3 : 8 }}>
        {label} {required && <span style={{ color: RED }}>*</span>}
      </label>
      {hint && <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.42)', margin: '0 0 8px' }}>{hint}</p>}
      {children}
    </div>
  )
}
function Check({ checked, onToggle, children }: { checked: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onToggle} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', color: 'rgba(255,255,255,0.78)' }}>
      <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, marginTop: 1, border: `1.5px solid ${checked ? RED : 'rgba(255,255,255,0.3)'}`, background: checked ? RED : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {checked && <CheckCircle2 size={14} color="#fff" />}
      </span>
      <span style={{ fontSize: 13, lineHeight: 1.6 }}>{children}</span>
    </button>
  )
}

function SuccessCard() {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ textAlign: 'center', borderRadius: 24, padding: 'clamp(30px, 6vw, 56px)', background: 'rgba(255,255,255,0.03)', border: `1px solid ${RED}55`, marginTop: 20 }}>
      <img src="/nextup/nextup.webp" alt="NextUp" style={{ width: '100%', maxWidth: 260, height: 'auto', margin: '0 auto 24px', display: 'block' }} />
      <div style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(225,29,42,0.14)', border: `1px solid ${RED}66`, color: RED }}>
        <CheckCircle2 size={30} />
      </div>
      <h2 style={{ fontFamily: DISPLAY, fontSize: 'clamp(1.8rem, 6vw, 2.6rem)', color: '#fff', margin: '0 0 14px', textTransform: 'uppercase' }}>Your story is in</h2>
      <p style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(255,255,255,0.72)', maxWidth: 480, margin: '0 auto' }}>
        Thank you. We read every single application, and our team will be in touch with the founders selected for NextUp. Keep building.
      </p>
      <Support />
    </motion.div>
  )
}
