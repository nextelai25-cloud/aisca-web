'use client';

import { motion } from 'framer-motion';
import { CHAIRMAN } from '@/lib/constants';
import { Container } from '@/components/layout/Container';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

const ease = [0.22, 1, 0.36, 1] as const;

export default function ChairmanSection() {
  return (
    <SectionWrapper id="founder" spacing="none" background="primary" className="px-6 md:px-12 lg:px-16 py-24 lg:py-32">
      <Container>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-start max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.9, ease }}
        >
          {/* Left — Avatar + Credentials
              Mobile: centered, stacked above quote
              Desktop: left column with right border divider */}
          <div className="chairman-layout lg:col-span-4 flex flex-col items-center text-center lg:text-left lg:items-start gap-5 border-b border-white/[0.06] pb-10 lg:pb-0 lg:border-b-0 lg:border-r lg:pr-10 min-w-0">
            <div className="chairman-photo" style={{
              width: '260px',
              height: '320px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.10)',
              overflow: 'hidden',
              position: 'relative',
              flexShrink: 0,
              margin: '0 auto'
            }}>
              <img
                src="/isira-chirayu.webp"
                alt="Isira Chirayu — Founder & Chairman, AISCA"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  display: 'block'
                }}
              />
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-white mb-1.5">{CHAIRMAN.name}</h3>
              <p className="text-[11px] tracking-[0.2em] uppercase text-white/40 font-normal mb-4">Founder &amp; Chairman</p>
              <div className="h-px w-10 bg-white/[0.08] mx-auto lg:mx-0 mb-4" />
              <p className="text-xs text-white/30 font-light leading-relaxed max-w-[26ch] mx-auto lg:mx-0">
                Pioneering youth commerce education and islandwide student connectivity since inception.
              </p>
            </div>
          </div>

          {/* Right — Editorial Pull Quote
              Mobile: text-center, max-w-2xl mx-auto
              Desktop: text-left */}
          <div className="lg:col-span-8 relative lg:pl-6 min-w-0">
            {/* Decorative large quotation mark — hidden on small mobile to avoid overflow */}
            <span
              className="absolute -top-8 left-0 text-[120px] leading-none pointer-events-none select-none hidden sm:block font-serif"
              style={{ color: 'rgba(255,255,255,0.025)' }}
            >
              &ldquo;
            </span>

            <div className="relative z-10 flex flex-col">
              <blockquote className="chairman-quote text-xl lg:text-2xl text-white/80 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0 mb-0 tracking-normal text-center lg:text-left">
                &ldquo;{CHAIRMAN.message}&rdquo;
              </blockquote>
            </div>
          </div>
        </motion.div>
      </Container>
    </SectionWrapper>
  );
}
