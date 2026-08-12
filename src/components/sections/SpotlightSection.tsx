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

const CARDS = [
  {
    href: '/nextup',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    eyebrow: 'Applications open · Closes 31 Aug',
    title: 'NextUp',
    body: "Get featured as one of Sri Lanka's youngest founders in the AISCA × Business Advisor Junior e-magazine and podcast-style video series.",
    cta: 'Apply now',
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
            Two ways to be part of the movement right now: apply to be featured, or gear up in official AISCA merchandise.
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
            </motion.div>
          ))}
        </div>
      </Container>

      <style>{`
        .spotlight-card { transition: border-color 0.3s ease, background 0.3s ease; }
        .spotlight-card:hover { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.055); }
      `}</style>
    </SectionWrapper>
  );
}
