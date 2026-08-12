'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const CARDS = [
  {
    href: '/nextup',
    tag: 'Applications open · closes 31 Aug',
    title: 'NextUp',
    desc: "Get featured as one of Sri Lanka's youngest founders in the AISCA × Business Advisor Junior e-magazine and video series.",
    cta: 'Apply now',
    accent: '#e11d2a', // NextUp's brand red
  },
  {
    href: '/shop',
    tag: 'Pre-orders · close 25 Aug',
    title: 'AISCA Merchandise',
    desc: 'Order the official Black Edition T-Shirt, Wrist Band, and Blazer Pin. Island-wide delivery.',
    cta: 'Shop now',
    accent: '#ffffff',
  },
];

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

export default function SpotlightSection() {
  return (
    <section style={{ background: '#050505', padding: '48px 0' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {CARDS.map((c, i) => {
            const isRed = c.accent !== '#ffffff';
            return (
              <motion.div
                key={c.href}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={c.href}
                  className="spotlight-card"
                  style={{
                    display: 'block',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: 20,
                    padding: 'clamp(24px, 4vw, 38px)',
                    height: '100%',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                    border: `1px solid ${isRed ? 'rgba(225,29,42,0.35)' : 'rgba(255,255,255,0.1)'}`,
                    textDecoration: 'none',
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: c.accent, opacity: isRed ? 1 : 0.85 }} />
                  <span style={{ display: 'inline-block', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, color: isRed ? c.accent : 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
                    {c.tag}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(1.7rem, 4vw, 2.5rem)', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '-0.01em', lineHeight: 1.05, marginBottom: 12 }}>
                    {c.title}
                  </h3>
                  <p style={{ fontSize: 14, lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', marginBottom: 24, maxWidth: 460 }}>
                    {c.desc}
                  </p>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {c.cta} <Arrow />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        .spotlight-card { transition: transform 0.35s cubic-bezier(.22,1,.36,1), box-shadow 0.35s; }
        .spotlight-card:hover { transform: translateY(-5px); box-shadow: 0 24px 60px -24px rgba(0,0,0,0.7); }
      `}</style>
    </section>
  );
}
