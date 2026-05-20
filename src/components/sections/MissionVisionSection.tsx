'use client';

import { motion } from 'framer-motion';
import { TRIPLE_MISSION } from '@/lib/constants';
import { Container } from '@/components/layout/Container';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

const ease = [0.22, 1, 0.36, 1] as const;

export default function MissionVisionSection() {
  return (
    <SectionWrapper id="mission" spacing="default" background="secondary" className="border-y border-white/[0.04]">
      <Container>

        {/* Section heading block */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">Our Purpose</span>
          <h2 className="section-title">Why AISCA Exists</h2>
          <p className="section-subtitle">
            Centralizing school commerce communities, strengthening student networking, and showcasing the future of commerce leadership across Sri Lanka.
          </p>
        </div>

        {/* Vision & Mission Cards */}
        <div className="vision-grid" style={{ marginBottom: '64px' }}>
          {[
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
              eyebrow: 'Vision',
              title: 'The Future We See',
              body: 'To build the largest and most influential network of commerce students in Sri Lanka — creating unprecedented opportunities for high-level leadership, entrepreneurial innovation, and national economic advancement.',
              tag: '› Islandwide Scope',
            },
            {
              icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>,
              eyebrow: 'Mission',
              title: 'What Drives Us',
              body: 'To empower future commerce professionals through elite educational masterclasses, national summits, and community-driven initiatives that transcend regional boundaries and unlock direct industry mentorship.',
              tag: '› Action Oriented',
            },
          ].map((card, i) => (
            <motion.div
              key={card.eyebrow}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.8, delay: i * 0.15, ease }}
            >
              <div
                style={{
                  padding: '40px 36px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.40)' }}>
                  {card.icon}
                </div>
                <span
                  className="section-eyebrow"
                  style={{ textAlign: 'left', marginBottom: '10px' }}
                >
                  {card.eyebrow}
                </span>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#ffffff', marginBottom: '16px', lineHeight: 1.2 }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.50)', lineHeight: 1.75, fontWeight: 300, flex: 1, marginBottom: '24px' }}>
                  {card.body}
                </div>
                <div style={{ fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', marginTop: 'auto', paddingTop: '20px' }}>
                  {card.tag}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Three Pillars */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">Foundation</span>
          <h2 className="section-title">The Three Pillars</h2>
          <p className="section-subtitle">
            The architectural foundation supporting every initiative across the AISCA movement.
          </p>
        </div>

        <div className="pillars-grid">
          {TRIPLE_MISSION.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ delay: i * 0.15, duration: 0.8, ease }}
            >
              <div
                style={{
                  padding: '40px 28px 36px 28px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '12px',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: '1.5rem', color: 'rgba(255,255,255,0.50)', marginBottom: '16px' }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em', color: '#ffffff', marginBottom: '12px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.50)', lineHeight: 1.7, fontWeight: 300 }}>
                  {item.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </Container>
    </SectionWrapper>
  );
}
