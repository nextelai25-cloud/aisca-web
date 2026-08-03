'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, MessageSquare, Send } from 'lucide-react'

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.5)',
  fontWeight: 700,
  marginBottom: 8,
}

export default function ContactSection() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setSuccess(true)
        setName(''); setEmail(''); setSubject(''); setMessage('')
      } else {
        setError(data.error || 'Failed to submit message.')
      }
    } catch {
      setError('An error occurred. Please verify your connection.')
    } finally {
      setLoading(false)
    }
  }

  const socialLinks = [
    { label: 'info@aisca.lk', href: 'mailto:info@aisca.lk', icon: Mail },
    { label: '@aisca.lk', href: 'https://www.instagram.com/aisca.lk/', icon: InstagramIcon },
    { label: 'All Island Schools Commerce Association', href: 'https://web.facebook.com/profile.php?id=61586432106049', icon: FacebookIcon },
    { label: 'AISCA', href: 'https://www.linkedin.com/company/all-island-schools-commerce-association-aisca/', icon: LinkedinIcon },
    { label: 'Join WhatsApp Channel', href: 'https://whatsapp.com/channel/0029Vak5dvg4IBhIrk1DsK3i', icon: MessageSquare, isAccent: true },
  ]

  return (
    <section
      id="contact"
      style={{ position: 'relative', padding: '80px 0 96px', background: '#050505', overflow: 'hidden' }}
    >
      {/* soft gold flare */}
      <div style={{ position: 'absolute', top: '50%', right: '22%', transform: 'translateY(-50%)', width: 500, height: 500, background: 'rgba(255,255,255,0.02)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* header */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 14 }}>
            Get in touch
          </span>
          <h2 style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(2rem, 5vw, 3.25rem)', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 16 }}>
            Contact Channels
          </h2>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 300, maxWidth: 540, margin: '0 auto' }}>
            Connect with the leadership body and administrative coordinators
          </p>
        </div>

        {/* two columns */}
        <div className="aisca-cf-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 44, alignItems: 'start' }}>
          {/* left: directory */}
          <div>
            <h3 style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 20, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#fff', marginBottom: 14 }}>
              Board Directory
            </h3>
            <p style={{ fontSize: 12.5, lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 300, marginBottom: 26 }}>
              Have questions about student affiliation, administrative registrations, or custom corporate sponsorships? Reach out through our official channels.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {socialLinks.map((link, idx) => {
                const Icon = link.icon
                return (
                  <a
                    key={idx}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aisca-cf-link"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 16px',
                      borderRadius: 16,
                      textDecoration: 'none',
                      border: `1px solid ${link.isAccent ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                      background: link.isAccent ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                      color: link.isAccent ? '#ffffff' : 'rgba(255,255,255,0.72)',
                      transition: 'all 0.25s',
                    }}
                  >
                    <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: link.isAccent ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)' }}>
                      <Icon size={18} />
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.label}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>

          {/* right: form */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 24, padding: 'clamp(22px, 4vw, 40px)', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', boxShadow: '0 0 60px -20px rgba(255,255,255,0.04)' }}>
            <div aria-hidden style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)', pointerEvents: 'none' }} />

            <div style={{ marginBottom: 26 }}>
              <h3 style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.02em', color: '#fff', marginBottom: 6 }}>
                Dispatch message
              </h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Responses within 24 operational hours
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form
                  key="contact-form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 18 }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 18 }}>
                    <div>
                      <label style={labelStyle}>Full Name <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="text" value={name} onChange={e => setName(e.target.value)}
                        placeholder="Dilshan Silva" required className="aisca-cf-input"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address <span style={{ color: '#ef4444' }}>*</span></label>
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="dilshan@gmail.com" required className="aisca-cf-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Subject <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text" value={subject} onChange={e => setSubject(e.target.value)}
                      placeholder="Corporate Sponsorship Inquiries" required className="aisca-cf-input"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Your Message <span style={{ color: '#ef4444' }}>*</span></label>
                    <textarea
                      value={message} onChange={e => setMessage(e.target.value)}
                      placeholder="Write your message details..." required rows={5}
                      className="aisca-cf-input" style={{ resize: 'none' }}
                    />
                  </div>

                  {error && (
                    <p style={{ color: '#f87171', fontSize: 12.5, textAlign: 'center' }}>⚠️ {error}</p>
                  )}

                  <button type="submit" disabled={loading} className="aisca-cf-btn">
                    <Send size={14} />
                    <span>{loading ? 'Sending Message…' : 'Send Message'}</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ padding: '24px 8px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}
                >
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✓</div>
                  <h4 style={{ color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: 14 }}>Message Sent Successfully!</h4>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 300, maxWidth: 360 }}>
                    Your message has been securely submitted and notified to the board coordinators. We will reach back to you shortly.
                  </p>
                  <button onClick={() => setSuccess(false)} className="aisca-cf-again">Send Another Message</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 1024px) {
          .aisca-cf-grid { grid-template-columns: 5fr 7fr; gap: 48px; }
        }
        .aisca-cf-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 13px 15px;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .aisca-cf-input::placeholder { color: rgba(255,255,255,0.3); }
        .aisca-cf-input:focus {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.06);
        }
        .aisca-cf-btn {
          width: 100%;
          min-height: 50px;
          margin-top: 4px;
          background: #ffffff;
          color: #000;
          font-weight: 700;
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .aisca-cf-btn:hover:not(:disabled) { background: #ececec; transform: translateY(-1px); }
        .aisca-cf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .aisca-cf-link:hover { border-color: rgba(255,255,255,0.16) !important; color: #fff !important; }
        .aisca-cf-again {
          padding: 9px 18px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .aisca-cf-again:hover { background: rgba(255,255,255,0.1); }
      `}</style>
    </section>
  )
}
