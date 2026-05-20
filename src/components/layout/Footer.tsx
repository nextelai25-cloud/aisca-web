'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { NAV_LINKS, SOCIAL_LINKS } from '@/lib/constants';
import { Container } from '@/components/layout/Container';

const ease = [0.22, 1, 0.36, 1] as const;

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSubscribed(true);
        setEmail('');
      }
    } catch (err) {
      setError('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nav = (href: string) => {
    if (window.location.pathname === '/') {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = '/' + href;
    }
  };

  return (
    <footer id="social" className="footer-section relative bg-[#050505] pb-20 border-t border-white/[0.04] overflow-hidden" style={{ paddingTop: '120px' }}>
      {/* Ambient bloom */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.025) 0%, transparent 70%)', filter: 'blur(80px)' }}
      />

      <Container>
        {/* Massive emotional closing headline */}
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <motion.h3
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ delay: 0.15, duration: 1.0, ease }}
            className="footer-headline"
            style={{ 
              fontWeight: '800',
              color: '#ffffff',
              letterSpacing: '-0.02em',
              lineHeight: '1',
              margin: '0'
            }}
          >
            Dream. Achieve. Inspire.
          </motion.h3>
        </div>

        {/* 4-column grid: AISCA block + NAVIGATION + INITIATIVES + CONNECT */}
        <div className="footer-grid" style={{
          alignItems: 'start',
          marginTop: '64px',
          paddingTop: '80px',
          borderTop: '1px solid rgba(255,255,255,0.04)'
        }}>
          
          {/* AISCA Brand */}
          <div>
            <img
              src="/aisca-original.png"
              alt="AISCA Logo"
              className="footer-logo"
              style={{
                marginBottom: '16px'
              }}
            />
            <p className="text-sm text-white/40 font-light max-w-xs leading-relaxed mb-0">
              All Island Schools Commerce Association. Building Sri Lanka&apos;s most influential student commerce network.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{
              fontSize: '11px',
              letterSpacing: '0.25em',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
              marginBottom: '20px',
              display: 'block'
            }}>Navigation</h4>
            <div className="flex flex-col">
              {NAV_LINKS.map(l => (
                <button
                  key={l.href}
                  onClick={() => nav(l.href)}
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.50)',
                    fontWeight: '300',
                    lineHeight: '2.2',
                    display: 'block',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Initiatives */}
          <div>
            <h4 style={{
              fontSize: '11px',
              letterSpacing: '0.25em',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
              marginBottom: '20px',
              display: 'block'
            }}>Initiatives</h4>
            <div className="flex flex-col">
              {[
                { label: 'Associate Registry', href: '/register/associate' },
                { label: 'School Registry', href: '/register/school' },
                { label: 'Merchandise Dispatch', href: '/#products' },
                { label: 'Executive Directorate', href: '/#board' },
                { label: 'Impact Archives', href: '/#gallery' },
              ].map(t => (
                <a
                  key={t.label}
                  href={t.href}
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.50)',
                    fontWeight: '300',
                    lineHeight: '2.2',
                    display: 'block',
                    textAlign: 'left',
                    textDecoration: 'none'
                  }}
                >
                  {t.label}
                </a>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 style={{
              fontSize: '11px',
              letterSpacing: '0.25em',
              color: 'rgba(255,255,255,0.25)',
              textTransform: 'uppercase',
              marginBottom: '20px',
              display: 'block'
            }}>Connect</h4>
            <div className="flex flex-col">
              {SOCIAL_LINKS.map(l => (
                <a
                  key={l.platform}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255,255,255,0.50)',
                    fontWeight: '300',
                    lineHeight: '2.2',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textDecoration: 'none'
                  }}
                >
                  {l.platform}
                  <svg
                    style={{ opacity: 0.3 }}
                    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter subscribe box */}
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '48px 24px',
          textAlign: 'center',
          marginTop: '64px'
        }}>
          <p style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '8px', fontFamily: 'Space Grotesk, sans-serif' }}>
            Stay Updated
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginBottom: '24px' }}>
            Get notified about AISCA events, competitions and opportunities
          </p>
          {subscribed ? (
            <p style={{ color: '#d4af37', fontSize: '15px', fontWeight: '500' }}>
              ✓ Thank you! You have successfully subscribed to the AISCA newsletter.
            </p>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={loading}
                  required
                  style={{
                    padding: '12px 20px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '14px',
                    width: '280px',
                    outline: 'none',
                    minHeight: '44px'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '12px 24px',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  minHeight: '44px'
                }}
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
          {error && (
            <p style={{ color: '#ff4444', fontSize: '13px', marginTop: '12px' }}>
              ⚠️ {error}
            </p>
          )}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom mt-24 pt-12 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/20 font-light text-right">Engineered for the next generation of commerce leaders.</p>
        </div>
      </Container>
    </footer>
  );
}
