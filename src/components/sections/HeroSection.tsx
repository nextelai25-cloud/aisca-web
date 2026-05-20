'use client';

import { motion } from 'framer-motion';
import { STATS } from '@/lib/constants';
import { Container } from '@/components/layout/Container';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { Avatar } from '@/components/ui/Avatar';
import { CHAIRMAN } from '@/lib/constants';

const ease = [0.22, 1, 0.36, 1] as const;

export default function HeroSection() {
  const scroll = (id: string) => document.querySelector(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <SectionWrapper id="hero" spacing="none" className="hero-section min-h-[92svh] lg:min-h-[100svh] flex flex-col justify-center overflow-hidden relative bg-[#050505]" style={{ overflow: 'hidden', width: '100%', maxWidth: '100vw' }}>
      
      {/* Atmospheric lighting bloom */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white, transparent 80%)' }} />
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.022) 0%, transparent 70%)' }} />
        <div className="absolute top-1/3 right-0 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.035) 0%, transparent 70%)' }} />
      </div>
 
      <Container className="relative z-10 flex flex-col justify-center" style={{ overflow: 'hidden', width: '100%', maxWidth: '100vw' }}>
        <div className="hero-content" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden',
          margin: '0 auto',
          paddingTop: '120px',
          paddingBottom: '80px'
        }}>
          {/* Headline — ALL words same full white */}
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 24 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease }}
            style={{ 
              fontSize: 'clamp(1.8rem, 6.5vw, 7.5rem)',
              lineHeight: '1.05',
              textAlign: 'center',
              width: '100%',
              maxWidth: '100%',
              overflow: 'hidden',
              wordBreak: 'keep-all',
              whiteSpace: 'normal',
              padding: '0 2vw',
              fontWeight: '800',
              color: '#ffffff',
              textTransform: 'uppercase',
              marginBottom: '32px'
            }}
          >
            <span className="hero-line-desktop">
              <span style={{ display: 'block' }}>ALL ISLAND SCHOOLS</span>
              <span style={{ display: 'block' }}>COMMERCE ASSOCIATION</span>
            </span>
            <span className="hero-line-mobile">
              <span style={{ display: 'block' }}>ALL ISLAND</span>
              <span style={{ display: 'block' }}>SCHOOLS COMMERCE</span>
              <span style={{ display: 'block' }}>ASSOCIATION</span>
            </span>
          </motion.h1>

          {/* CTA Buttons — centered pair */}
          <div style={{ 
            display: 'flex', 
            gap: '12px', 
            justifyContent: 'center',
            flexWrap: 'wrap',
            marginTop: '32px'
          }}>
            <a
              href="/register/associate"
              style={{
                padding: '14px 28px',
                borderRadius: '999px',
                background: '#ffffff',
                color: '#000000',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
            >
              Become an Associate
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
            <a
              href="/register/school"
              style={{
                padding: '14px 28px',
                borderRadius: '9999px',
                background: 'transparent',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '500',
                border: '1px solid rgba(255,255,255,0.30)',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                textDecoration: 'none'
              }}
            >
              Register Your School
            </a>
          </div>
        </div>
      </Container>
    </SectionWrapper>
  );
}
