'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PRODUCTS } from '@/lib/constants';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

const ease = [0.22, 1, 0.36, 1] as const;

function ProductCard({ p, i }: { p: typeof PRODUCTS[number]; i: number }) {
  const [isBtnHovered, setIsBtnHovered] = useState(false);

  const productUrl = '/shop';

  return (
    <motion.div
      style={{ overflow: 'hidden', borderRadius: '14px' }}
      className="product-card group flex flex-col bg-[#0a0a0a] border border-white/[0.05] shadow-[0_12px_50px_rgba(0,0,0,0.5)] cursor-default"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ delay: i * 0.12, duration: 0.8, ease }}
    >
      {/* Product Image Container */}
      <div style={{
        width: '100%',
        aspectRatio: '3/4',
        overflow: 'hidden',
        background: '#111',
        position: 'relative'
      }}>
        {p.img ? (
          <img 
            src={p.img} 
            alt={p.name} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain', 
              objectPosition: 'center' 
            }} 
          />
        ) : (
          <span style={{
            fontSize: '3rem',
            opacity: 0.15,
            color: '#ffffff',
            fontWeight: '700',
            letterSpacing: '0.1em',
            textAlign: 'center',
            padding: '20px'
          }}>
            ITEM
          </span>
        )}
        <span className="absolute top-3 left-3 z-10 px-3 py-1 rounded-full text-[10px] tracking-[0.2em] uppercase text-white/70 font-normal" style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.10)' }}>
          Pre-orders close · Aug 25
        </span>
      </div>

      {/* Product Details */}
      <div style={{ padding: '20px 20px 20px 20px' }} className="product-card-info flex flex-col flex-1 border-t border-white/[0.04]">
        <div style={{ marginBottom: '10px' }} className="flex items-baseline justify-between pt-1">
          <h3 className="product-name text-lg font-semibold text-white/90 tracking-tight">{p.name}</h3>
          <span className="product-price text-sm text-white/50 font-light ml-3 shrink-0">{p.price}</span>
        </div>
        <p className="product-description" style={{
          fontSize: '13px',
          color: 'rgba(255,255,255,0.45)',
          lineHeight: '1.6',
          fontWeight: '300',
          marginTop: '8px',
          marginBottom: '20px'
        }}>{p.description}</p>

        <Link
          href={productUrl}
          className="product-order-btn"
          onMouseEnter={() => setIsBtnHovered(true)}
          onMouseLeave={() => setIsBtnHovered(false)}
          style={{
            width: '100%',
            padding: '12px 20px',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: isBtnHovered ? 'rgba(255,255,255,0.06)' : 'transparent',
            color: 'rgba(255,255,255,0.75)',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            marginTop: 'auto',
            textDecoration: 'none'
          }}
        >
          Order Now
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </Link>
      </div>
    </motion.div>
  );
}

export default function ProductsSection() {
  return (
    <SectionWrapper id="products" spacing="none" background="secondary" className="py-32 lg:py-40 border-t border-white/[0.04]">
      <Container>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-eyebrow">Official Dispatch</span>
          <h2 className="section-title">AISCA Collection</h2>
          <p className="section-subtitle">
            Minimalist physical merchandise representing the islandwide movement. Engineered for active student leadership.
          </p>
        </div>

        <div className="products-grid">
          {PRODUCTS.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        </div>
      </Container>
    </SectionWrapper>
  );
}
