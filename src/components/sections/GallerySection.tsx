'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'

const events = [
  { id: 1, name: 'AISCA CA Walk Meetup', tag: 'Networking', year: '2025' },
  { id: 2, name: 'Legacy Night 2025', tag: 'Annual Event', year: '2025' },
  { id: 3, name: 'Gift a Smile Campaign', tag: 'Community', year: '2025' },
  { id: 4, name: 'Shoreline Beach Cleanup', tag: 'Environment', year: '2025' },
  { id: 5, name: 'Board Getogether Lunch', tag: 'Internal', year: '2025' },
  { id: 6, name: 'Legacy Night 2026', tag: 'Annual Event', year: '2026' },
  { id: 7, name: 'AISCA Forum: Inaugural Edition', tag: 'Forum', year: '2026' },
]

export default function GallerySection() {
  return (
    <section id="gallery" style={{ padding: '120px 40px' }} className="relative border-t border-white/[0.03] bg-[#080808] overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 relative z-10">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{
              fontSize: '11px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              marginBottom: '16px'
            }}
          >
            OUR IMPACT
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '16px',
              letterSpacing: '-0.02em',
              lineHeight: '1.0'
            }}
          >
            Events & Initiatives
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: '400'
            }}
          >
            Moments that define the islandwide commerce movement
          </motion.p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative z-10" style={{ gap: '20px' }}>
          {events.map((event, idx) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
              whileHover={{ 
                scale: 1.02,
                borderColor: 'rgba(255,255,255,0.2)',
                boxShadow: '0 8px 30px rgba(0,0,0,0.4)'
              }}
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                aspectRatio: '4/3',
                background: 'linear-gradient(145deg, #151515 0%, #080808 100%)',
                border: '1px solid rgba(255,255,255,0.08)',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, border-color 0.3s ease'
              }}
            >
              {/* Dark placeholder image with subtle branding initials */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#121212] to-[#050505]">
                <span className="text-white/[0.02] font-black text-9xl select-none tracking-widest font-display">
                  AISCA
                </span>
              </div>

              {/* Bottom gradient overlay */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  padding: '24px 20px 20px',
                  background: 'linear-gradient(0deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 60%, transparent 100%)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '9px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.5)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    padding: '3px 8px',
                    borderRadius: '4px'
                  }}>{event.tag}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{event.year}</span>
                </div>
                <p style={{
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: 0,
                  lineHeight: '1.3'
                }}>{event.name}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
