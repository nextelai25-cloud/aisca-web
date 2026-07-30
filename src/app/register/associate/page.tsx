'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import dynamic from 'next/dynamic';

const SmoothScrollProvider = dynamic(() => import('@/providers/SmoothScrollProvider'), { ssr: false });

const ease = [0.22, 1, 0.36, 1] as const;

/* ── Custom dark dropdown ── */
const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder = 'Select...'
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px',
          padding: '13px 16px',
          color: value ? '#ffffff' : 'rgba(255,255,255,0.30)',
          fontSize: '14px',
          textAlign: 'left',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          minHeight: '44px'
        }}
      >
        <span>{value || placeholder}</span>
        <span style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.40)',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }}>▼</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 6px)',
          left: 0,
          right: 0,
          background: '#1a1a1a',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '10px',
          overflow: 'hidden',
          zIndex: 100,
          maxHeight: '240px',
          overflowY: 'auto'
        }}>
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                padding: '12px 16px',
                fontSize: '14px',
                color: value === opt ? '#ffffff' : 'rgba(255,255,255,0.65)',
                background: value === opt ? 'rgba(255,255,255,0.08)' : 'transparent',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
                borderBottom: '1px solid rgba(255,255,255,0.04)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = value === opt ? 'rgba(255,255,255,0.08)' : 'transparent';
                e.currentTarget.style.color = value === opt ? '#ffffff' : 'rgba(255,255,255,0.65)';
              }}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AssociateRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Bind individual state variables for all inputs
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [indWhatsApp, setIndWhatsApp] = useState('');
  const [dob, setDob] = useState('');
  const [school, setSchool] = useState('');
  const [district, setDistrict] = useState('');
  const [indProvince, setIndProvince] = useState('');
  const [indWhoAreYou, setIndWhoAreYou] = useState('');
  const [commerceStream, setCommerceStream] = useState('');
  const [indActiveProject, setIndActiveProject] = useState('');
  const [indHearAbout, setIndHearAbout] = useState('');
  const [projectIdeas, setProjectIdeas] = useState('');
  const [agreed, setAgreed] = useState(false);

  // Submit flow states
  const [loading, setLoading] = useState(false);
  const [membershipNumber, setMembershipNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Helper for phone auto-spacing
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indProvince || !indWhoAreYou || !commerceStream || !indActiveProject || !indHearAbout) {
      setErrorMsg('Please select all required dropdown fields.');
      return;
    }
    if (!agreed) {
      setErrorMsg('You must agree to the AISCA Rules and Regulations.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      const formData = {
        full_name: fullName,
        email: email,
        whatsapp: indWhatsApp,
        date_of_birth: dob,
        school: school,
        district: district,
        province: indProvince,
        who_are_you: indWhoAreYou,
        commerce_stream: commerceStream === 'Yes',
        actively_participate: indActiveProject !== 'No, not at this stage',
        how_heard: indHearAbout,
        project_ideas: projectIdeas
      };
      
      const res = await fetch('/api/register/associate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Failed to submit registration');
      }
      
      if (result.success) {
        setMembershipNumber(result.membershipNumber);
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '10px',
    padding: '13px 16px',
    color: '#ffffff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    minHeight: '44px'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.35)',
    marginBottom: '8px',
    fontWeight: '400'
  };

  const fullWidthStyle: React.CSSProperties = {
    gridColumn: isMobile ? 'auto' : '1 / -1'
  };

  const provinces = [
    'Western Province', 'Central Province', 'Southern Province',
    'Northern Province', 'Eastern Province', 'North Western Province',
    'North Central Province', 'Uva Province', 'Sabaragamuwa Province', 'Other'
  ];

  const whoAreYouOptions = [
    'Current Office Bearer of a School Commerce Society',
    'Past Office Bearer of a School Commerce Society',
    'Committee Member of a School Commerce Society',
    'Commerce Stream Student',
    'Non-Commerce Stream Student',
    'Undergraduate',
    'School Leaver',
    'Students Awaiting A/L Results',
    'Other'
  ];

  const hearAboutOptions = [
    'Social Media', 'Friends', 'School', 'AISCA Event', 'WhatsApp Groups', 'Other'
  ];

  return (
    <SmoothScrollProvider>
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type":"ListItem","position":1,"name":"Home","item":"https://aisca.lk"},
          {"@type":"ListItem","position":2,"name":"Become an Associate","item":"https://aisca.lk/register/associate"}
        ]
      })}} />
      <main className="min-h-screen text-white pb-20 relative overflow-hidden" style={{
        paddingTop: '100px',  // space for fixed navbar
        minHeight: '100vh',
        background: '#080808',
        overflowX: 'hidden',
        width: '100%'
      }}>
        {/* Atmospheric lighting bloom */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, white, transparent 80%)' }} />
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 w-[900px] h-[900px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.022) 0%, transparent 70%)' }} />
          <div className="absolute top-1/3 right-0 w-[800px] h-[800px] rounded-full blur-3xl" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.035) 0%, transparent 70%)' }} />
        </div>

        <Container className="relative z-10 py-12">
          <Breadcrumbs items={[{ label: 'Join', href: '/join' }, { label: 'Associate Registration' }]} className="mb-8 justify-center" />
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="section-eyebrow">National Onboarding</span>
            <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>Become an Associate</h1>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Register as an individual Associate member within the national registry and join the AISCA student network.
            </p>
          </div>

          <motion.div
            style={{ maxWidth: '760px', margin: '0 auto' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
          >
            <div className="form-panel" style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              borderRadius: '20px',
              padding: isMobile ? '30px 20px' : '40px 32px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}>
              {submitted ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '28px'
                }}>
                  <div style={{
                    width: '80px', height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: '#ffffff'
                  }}>✓</div>
                  
                  <div>
                    <h3 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                      Welcome to AISCA!
                    </h3>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', maxWidth: '480px', margin: '0 auto', lineHeight: '1.6' }}>
                      Your individual Associate Membership has been registered successfully.
                    </p>
                  </div>

                  <div style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '24px 32px',
                    width: '100%',
                    maxWidth: '440px',
                    boxSizing: 'border-box'
                  }}>
                    <span style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                      Membership Number
                    </span>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#ffffff', marginTop: '6px', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                      {membershipNumber || 'AISCA-2026-XXXXX'}
                    </div>
                  </div>

                  <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', maxWidth: '460px', lineHeight: '1.6' }}>
                    Your digital membership card is being prepared and will be sent to your email shortly.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '360px' }}>
                    <a 
                      href="https://chat.whatsapp.com/Li5UyOvxKRjH33PCLhId1o"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        padding: '14px 32px',
                        background: '#ffffff',
                        color: '#000000',
                        borderRadius: '10px',
                        fontWeight: '700',
                        fontSize: '14px',
                        textDecoration: 'none',
                        letterSpacing: '0.03em',
                        textAlign: 'center'
                      }}
                    >
                      Join AISCA Associate Group →
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div>
                      <label style={labelStyle}>Full Name*</label>
                      <input 
                        type="text" 
                        placeholder="Jane Doe" 
                        required 
                        style={fieldStyle}
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email Address*</label>
                      <input 
                        type="email" 
                        placeholder="jane@email.com" 
                        required 
                        style={fieldStyle}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>WhatsApp Number*</label>
                      <input 
                        type="tel" 
                        placeholder="070 000 0000" 
                        required 
                        style={fieldStyle} 
                        value={indWhatsApp}
                        onChange={e => setIndWhatsApp(formatPhone(e.target.value))}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Date of Birth*</label>
                      <input 
                        type="date" 
                        required 
                        style={{ ...fieldStyle, colorScheme: 'dark' }} 
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>School Name*</label>
                      <input 
                        type="text" 
                        placeholder="Enter your school name" 
                        required 
                        style={fieldStyle}
                        value={school}
                        onChange={e => setSchool(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>District*</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Colombo" 
                        required 
                        style={fieldStyle}
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                      />
                    </div>
                    <div style={fullWidthStyle}>
                      <label style={labelStyle}>Province*</label>
                      <CustomSelect
                        options={provinces}
                        value={indProvince}
                        onChange={setIndProvince}
                        placeholder="Select Province"
                      />
                    </div>
                    <div style={fullWidthStyle}>
                      <label style={labelStyle}>Who are you?*</label>
                      <CustomSelect
                        options={whoAreYouOptions}
                        value={indWhoAreYou}
                        onChange={setIndWhoAreYou}
                        placeholder="Select Option"
                      />
                    </div>
                    <div style={fullWidthStyle}>
                      <label style={labelStyle}>Are you a Commerce Stream Student?*</label>
                      <CustomSelect
                        options={['Yes', 'No']}
                        value={commerceStream}
                        onChange={setCommerceStream}
                        placeholder="Select Option"
                      />
                    </div>
                    <div style={fullWidthStyle}>
                      <label style={labelStyle}>Are you actively willing to participate in projects?*</label>
                      <CustomSelect
                        options={['Yes, actively', 'Yes, occasionally', 'No, not at this stage']}
                        value={indActiveProject}
                        onChange={setIndActiveProject}
                        placeholder="Select Option"
                      />
                    </div>
                    <div style={fullWidthStyle}>
                      <label style={labelStyle}>How did you hear about AISCA?*</label>
                      <CustomSelect
                        options={hearAboutOptions}
                        value={indHearAbout}
                        onChange={setIndHearAbout}
                        placeholder="Select Option"
                      />
                    </div>
                    <div style={fullWidthStyle}>
                      <label style={labelStyle}>Project ideas</label>
                      <textarea 
                        placeholder="Projects should be simple, low-budget, and easy to execute. Selected ideas may receive leadership opportunities."
                        rows={4}
                        style={fieldStyle}
                        value={projectIdeas}
                        onChange={e => setProjectIdeas(e.target.value)}
                      />
                    </div>
                    <div style={fullWidthStyle}>
                      {/* Custom checkbox */}
                      <div 
                        className="form-checkbox-wrapper"
                        onClick={() => setAgreed(!agreed)}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '14px',
                          cursor: 'pointer',
                          padding: '4px 0'
                        }}
                      >
                        <div 
                          className="custom-checkbox"
                          style={{
                            width: '22px',
                            height: '22px',
                            minWidth: '22px',
                            borderRadius: '6px',
                            border: agreed ? '2px solid #ffffff' : '2px solid rgba(255,255,255,0.25)',
                            background: agreed ? '#ffffff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease',
                            marginTop: '1px'
                          }}
                        >
                          {agreed && (
                            <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                              <path d="M1 4L4.5 7.5L11 1" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </div>
                        <span style={{
                          fontSize: '13px',
                          color: 'rgba(255,255,255,0.5)',
                          lineHeight: '1.5',
                          userSelect: 'none'
                        }}>
                          I agree to AISCA Rules and Regulations and confirm all information provided is accurate.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '32px', paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {errorMsg && (
                      <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        padding: '12px 16px',
                        color: '#ef4444',
                        fontSize: '13px',
                        marginBottom: '20px',
                        textAlign: 'center'
                      }}>
                        ⚠️ {errorMsg}
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="form-submit-btn"
                      style={{
                        width: '100%',
                        background: loading ? 'rgba(255,255,255,0.4)' : '#ffffff',
                        color: '#000000',
                        fontWeight: 600,
                        borderRadius: '999px',
                        padding: '18px',
                        fontSize: '15px',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        letterSpacing: '0.01em',
                        minHeight: '44px'
                      }}
                    >
                      {loading ? 'Submitting Application...' : 'Submit Associate Application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </Container>
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
