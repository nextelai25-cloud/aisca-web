'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, useMotionValue, useSpring } from 'framer-motion';
import { STATS } from '@/lib/constants';
import { Container } from '@/components/layout/Container';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

const ease = [0.22, 1, 0.36, 1] as const;

function CountUp({ end, duration = 2000, decimals = 0 }: { end: number; duration?: number; decimals?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration, bounce: 0 });

  useEffect(() => {
    if (inView) motionVal.set(end);
  }, [inView, end, motionVal]);

  useEffect(() => {
    return spring.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = decimals > 0 ? v.toFixed(decimals) : Math.floor(v).toLocaleString();
      }
    });
  }, [spring, decimals]);

  return <span ref={ref}>0</span>;
}

export default function StatsSection() {
  return (
    <SectionWrapper id="stats" spacing="default" background="tertiary" className="border-y border-white/[0.04]">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">National Scale</span>
          <h2 className="section-title">AISCA in Numbers</h2>
          <p className="section-subtitle">
            The measurable impact of Sri Lanka&apos;s leading youth commerce organization.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid" style={{ alignItems: 'start' }}>
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              className="stat-item"
              style={{
                padding: '32px 24px',
                borderRight: i < STATS.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
              } as React.CSSProperties}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.12, duration: 0.8, ease }}
            >
              <div className="flex items-baseline gap-1 justify-center" style={{ marginBottom: '0', justifyContent: 'center' }}>
                <span className="stat-number font-display font-extralight text-white tabular-nums tracking-tight" style={{ fontSize: 'clamp(3rem, 6vw, 5rem)' }}>
                  <CountUp end={s.value} duration={2200} decimals={'isDecimal' in s && s.isDecimal ? 1 : 0} />
                </span>
                <span className="font-display font-extralight text-white/25" style={{ fontSize: '2.5rem' }}>{s.suffix}</span>
              </div>
              <span className="stat-label" style={{
                fontSize: '10px',
                letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.35)',
                textTransform: 'uppercase',
                lineHeight: '1.6',
                marginTop: '8px',
                maxWidth: '140px',
                textAlign: 'center'
              }}>{s.label}</span>
            </motion.div>
          ))}
        </div>
      </Container>
    </SectionWrapper>
  );
}
