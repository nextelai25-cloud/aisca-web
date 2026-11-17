'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

const ease = [0.22, 1, 0.36, 1] as const;

const Arrow = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

type Card = {
  href: string
  icon: React.ReactNode
  eyebrow: string
  title: string
  body: string
  cta: string
  cover?: string
  actions?: { href: string; label: string; primary?: boolean }[]
}

const CARDS: Card[] = [
  {
    href: '/nextup01',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" />
      </svg>
    ),
    eyebrow: 'Out now · E-magazine',
    title: 'NEXTUP 01: The Young Founders Edition',
    body: 'Thirteen young founders, thirteen real stories. Read the AISCA × Business Advisor Junior e-magazine, then apply to be featured in NEXTUP 02.',
    cta: 'Read the magazine',
    cover: '/nextup01/thumbs/01.webp',
    actions: [
      { href: '/nextup01', label: 'Read the magazine', primary: true },
      { href: '/nextup02', label: 'Apply for NEXTUP 02' },
    ],
  },
  {
    href: '/shop',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
    eyebrow: 'Pre-orders · Close 25 Aug',
    title: 'AISCA Merchandise',
    body: 'Order the official Black Edition T-Shirt, Wrist Band, and Blazer Pin. Island-wide delivery, straight to your door.',
    cta: 'Shop now',
  },
];

export default function SpotlightSection() {
  return (
    <SectionWrapper id="spotlight" spacing="compact" background="primary" className="border-y border-white/[0.04]">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">Happening Now</span>
          <h2 className="section-title">Get Involved</h2>
          <p className="section-subtitle">
            See what AISCA has going on right now.
          </p>
        </div>

        <div className="vision-grid">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.href}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: i * 0.15, ease }}
            >
              {card.actions ? (
                <div
                  className="spotlight-card nextup-card"
                  style={{
                    padding: '40px 36px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {card.cover && (
                    <Link href={card.href} className="nextup-cover" aria-label={card.title}>
                      <img src={card.cover} alt={card.title} />
                    </Link>
                  )}
                  <div style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.40)' }}>{card.icon}</div>
                  <span className="section-eyebrow nextup-eyebrow" style={{ textAlign: 'left', marginBottom: '10px' }}>
                    {card.eyebrow}
                  </span>
                  <div className="nextup-title" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', lineHeight: 1.2 }}>
                    {card.title}
                  </div>
                  <div className="nextup-body" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, fontWeight: 300, flex: 1, marginBottom: '24px' }}>
                    {card.body}
                  </div>
                  <div className="nextup-actions">
                    {card.actions.map(a => (
                      <Link key={a.href} href={a.href} className={`nextup-btn ${a.primary ? 'nextup-btn-primary' : ''}`}>
                        {a.label} <Arrow />
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
              <Link
                href={card.href}
                className="spotlight-card"
                style={{
                  padding: '40px 36px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                }}
              >
                <div style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.40)' }}>{card.icon}</div>
                <span className="section-eyebrow" style={{ textAlign: 'left', marginBottom: '10px' }}>
                  {card.eyebrow}
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', lineHeight: 1.2 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, fontWeight: 300, flex: 1, marginBottom: '24px' }}>
                  {card.body}
                </div>
                <div style={{ fontSize: '12px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginTop: 'auto', paddingTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {card.cta} <Arrow />
                </div>
              </Link>
              )}
            </motion.div>
          ))}
        </div>
      </Container>

      <style>{`
        .nextup-cover { position: absolute; top: 26px; right: 26px; width: 74px; aspect-ratio: 1060 / 1500; border-radius: 4px; overflow: hidden; transform: rotate(6deg); box-shadow: 0 18px 30px -10px rgba(0,0,0,0.9), 0 0 30px -6px rgba(225,29,42,0.45); transition: transform .4s cubic-bezier(.22,1,.36,1); }
        .nextup-cover img { width: 100% !important; height: 100% !important; object-fit: cover; display: block; }
        .nextup-card:hover .nextup-cover { transform: rotate(2deg) scale(1.06); }
        .nextup-title, .nextup-eyebrow { padding-right: 84px; }
        .nextup-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: auto; padding-top: 8px; }
        .nextup-btn { display: inline-flex; align-items: center; gap: 8px; padding: 11px 16px; border-radius: 999px; font-size: 11.5px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 600; color: #fff; text-decoration: none; border: 1px solid rgba(255,255,255,0.18); transition: background .25s, border-color .25s, color .25s; }
        .nextup-btn:hover { border-color: rgba(255,255,255,0.45); }
        .nextup-btn-primary { background: #ffffff; color: #000; border-color: #fff; }
        .nextup-btn-primary:hover { background: rgba(255,255,255,0.85); }
        @media (max-width: 480px) { .nextup-cover { width: 58px; top: 22px; right: 20px; } .nextup-title, .nextup-eyebrow { padding-right: 64px; } .nextup-title { font-size: 1.35rem !important; } }
        .spotlight-card { transition: border-color 0.3s ease, background 0.3s ease; }
        .spotlight-card:hover { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.055); }
      `}</style>
    </SectionWrapper>
  );
}
