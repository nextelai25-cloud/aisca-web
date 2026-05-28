import React from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ScrollWrapper from '@/providers/ScrollWrapper'

export const metadata = {
  title: 'About AISCA | All Island Schools Commerce Association',
  description: 'Learn about AISCA — founded to unite Sri Lanka\'s school commerce students across all 25 educational districts. Our mission, vision, and board of officials.',
  alternates: { canonical: 'https://aisca.lk/about' }
}

export default function AboutPage() {
  return (
    <ScrollWrapper>
      <Navbar />
      <main style={{ paddingTop: '100px', minHeight: '100vh', background: '#080808' }}>
        <section style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 40px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '800', color: '#fff', marginBottom: '24px' }}>
            About AISCA
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '32px' }}>
            The All Island Schools Commerce Association (AISCA) is Sri Lanka's largest student-led commerce network, 
            uniting over 2,000 commerce students across all 25 educational districts.
          </p>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '32px' }}>
            Founded to bridge the gap between isolated school commerce societies, AISCA creates a unified platform 
            for collaboration, competition, mentorship, and national-level events.
          </p>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Our Mission</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '32px' }}>
            To empower future commerce professionals through elite educational masterclasses, national summits, 
            and community-driven initiatives that transcend regional boundaries.
          </p>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>Our Vision</h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.8', marginBottom: '32px' }}>
            To build the largest and most influential network of commerce students in Sri Lanka, creating unprecedented 
            opportunities for high-level leadership, entrepreneurial innovation, and national economic advancement.
          </p>
          <div style={{ marginTop: '48px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <a href="/register/associate" style={{ padding: '14px 28px', background: '#fff', color: '#000', borderRadius: '10px', fontWeight: '700', textDecoration: 'none', fontSize: '14px' }}>
              Become an Associate
            </a>
            <a href="/register/school" style={{ padding: '14px 28px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '10px', fontWeight: '600', textDecoration: 'none', fontSize: '14px' }}>
              Register Your School
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </ScrollWrapper>
  )
}
