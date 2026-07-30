'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Mail, MessageSquare, Send, CheckCircle } from 'lucide-react'

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
)

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

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
        body: JSON.stringify({ name, email, subject, message })
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSuccess(true)
        setName('')
        setEmail('')
        setSubject('')
        setMessage('')
      } else {
        setError(data.error || 'Failed to submit message.')
      }
    } catch (err: any) {
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
    { label: 'Join WhatsApp Channel', href: 'https://whatsapp.com/channel/0029Vak5dvg4IBhIrk1DsK3i', icon: MessageSquare, isAccent: true }
  ]

  return (
    <section id="contact" className="relative py-24 border-t border-white/[0.03] bg-[#050505] overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-[#d4af37]/[0.01] rounded-full blur-[100px] pointer-events-none" />

      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 relative z-10">
          <span className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-[#d4af37] uppercase block mb-3">
            GET IN TOUCH
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4 uppercase font-display">
            Contact Channels
          </h2>
          <p className="text-xs md:text-sm text-white/40 max-w-xl mx-auto uppercase tracking-wider font-light">
            Connect with the leadership body and administrative coordinators
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
          {/* Left Side: Contact info */}
          <div className="lg:col-span-5 space-y-8 flex flex-col justify-center">
            <div>
              <h3 className="text-xl font-bold tracking-wide uppercase text-white mb-3 font-display">
                Board Directory
              </h3>
              <p className="text-xs text-white/50 leading-relaxed uppercase tracking-wider font-light">
                Have questions about student affiliation, administrative registrations, or custom corporate sponsorships? Reach out through our official channels.
              </p>
            </div>

            <div className="space-y-4">
              {socialLinks.map((link, idx) => {
                const Icon = link.icon
                return (
                  <a
                    key={idx}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      link.isAccent 
                        ? 'border-[#d4af37]/30 bg-[#d4af37]/5 text-[#d4af37] hover:bg-[#d4af37]/10' 
                        : 'border-white/5 bg-white/[0.02] text-white/70 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      link.isAccent ? 'bg-[#d4af37]/10' : 'bg-white/5'
                    }`}>
                      <Icon size={18} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[250px] sm:max-w-none">
                      {link.label}
                    </span>
                  </a>
                )
              })}
            </div>
          </div>

          {/* Right Side: Message form */}
          <div className="lg:col-span-7 bg-[#0b0b0b] border border-white/5 rounded-3xl p-6 md:p-10 space-y-6">
            <div>
              <h3 className="text-lg font-bold tracking-wide uppercase text-white mb-1">
                Dispatch message
              </h3>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Responses within 24 operational hours</p>
            </div>

            <AnimatePresence mode="wait">
              {!success ? (
                <motion.form 
                  key="contact-form"
                  onSubmit={handleSubmit} 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-[10px] tracking-widest uppercase text-gray-400 font-bold">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Dilshan Silva"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/20 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] tracking-widest uppercase text-gray-400 font-bold">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="dilshan@gmail.com"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] tracking-widest uppercase text-gray-400 font-bold">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="Corporate Sponsorship Inquiries"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-white/20 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] tracking-widest uppercase text-gray-400 font-bold">
                      Your Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Write your message details..."
                      required
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white placeholder-gray-600 outline-none focus:border-white/20 transition-all resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-red-500 text-xs text-center">
                      ⚠️ {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-[48px] bg-white text-black font-semibold text-xs tracking-widest uppercase rounded-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Send size={14} />
                    <span>{loading ? 'Sending Message...' : 'Send Message'}</span>
                  </button>
                </motion.form>
              ) : (
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 text-center space-y-4"
                >
                  <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 flex items-center justify-center mx-auto text-xl">
                    ✓
                  </div>
                  <h4 className="text-white font-bold uppercase tracking-wider text-sm">Message Sent Successfully!</h4>
                  <p className="text-xs text-white/50 leading-relaxed uppercase tracking-wider font-light max-w-sm mx-auto">
                    Your message has been securely submitted to our database and notified directly to the board coordinators. We will reach back to you shortly.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="px-6 py-2 bg-white/5 border border-white/10 text-white font-semibold text-[10px] tracking-widest uppercase rounded-lg hover:bg-white/10 transition-all"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </section>
  )
}
