'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Container } from '@/components/layout/Container';
import { SectionWrapper } from '@/components/layout/SectionWrapper';

const ease = [0.22, 1, 0.36, 1] as const;
type Tab = 'individual' | 'school';

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
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

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
      {/* Trigger button */}
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
          boxSizing: 'border-box'
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

      {/* Dropdown list */}
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
                color: value === opt
                  ? '#ffffff'
                  : 'rgba(255,255,255,0.65)',
                background: value === opt
                  ? 'rgba(255,255,255,0.08)'
                  : 'transparent',
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

export default function RegisterSection() {
  const [tab, setTab] = useState<Tab>('individual');
  const [submitted, setSubmitted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // Helper for phone auto-spacing
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
  };

  // Individual form select states
  const [indProvince, setIndProvince] = useState('');
  const [indWhoAreYou, setIndWhoAreYou] = useState('');
  const [indActiveProject, setIndActiveProject] = useState('');
  const [indHearAbout, setIndHearAbout] = useState('');

  // Controlled phone states for Individual form
  const [indWhatsApp, setIndWhatsApp] = useState('');

  // School form select states
  const [schProvince, setSchProvince] = useState('');

  // Controlled phone states for School form
  const [schMicContact, setSchMicContact] = useState('');
  const [schPresContact, setSchPresContact] = useState('');
  const [schSecContact, setSchSecContact] = useState('');

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
    fontFamily: 'inherit'
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
    <SectionWrapper id="register" spacing="none" background="primary" className="py-32 lg:py-40 border-t border-white/[0.04] relative">
      <Container className="relative z-10">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-eyebrow">National Onboarding</span>
          <h2 className="section-title">Join the Movement</h2>
          <p className="section-subtitle">
            Register as an individual Associate or formalize your institution&apos;s commerce society membership within the national registry.
          </p>
        </div>

        {!submitted && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <div className="form-tab-container" style={{
              display: 'inline-flex',
              padding: '4px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '999px',
              gap: '4px',
            }}>
              <button
                onClick={() => setTab('individual')}
                className="form-tab-btn"
                style={{
                  padding: '10px 24px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: tab === 'individual' ? 600 : 400,
                  background: tab === 'individual' ? 'rgba(255,255,255,0.95)' : 'transparent',
                  color: tab === 'individual' ? '#000' : 'rgba(255,255,255,0.50)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                Individual Associate
              </button>
              <button
                onClick={() => setTab('school')}
                className="form-tab-btn"
                style={{
                  padding: '10px 24px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: tab === 'school' ? 600 : 400,
                  background: tab === 'school' ? 'rgba(255,255,255,0.95)' : 'transparent',
                  color: tab === 'school' ? '#000' : 'rgba(255,255,255,0.50)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                School Society Registry
              </button>
            </div>
          </div>
        )}

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
                padding: '60px 40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px'
              }}>
                <div style={{
                  width: '64px', height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem'
                }}>✓</div>
                
                <h3 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#ffffff' }}>
                  Application Submitted
                </h3>
                
                {tab === 'individual' && (
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
                      marginTop: '8px'
                    }}
                  >
                    Join AISCA Associate Group →
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  {tab === 'individual' ? (
                    <>
                      <div>
                        <label style={labelStyle}>Full Name*</label>
                        <input type="text" placeholder="Jane Doe" required style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Email Address*</label>
                        <input type="email" placeholder="jane@email.com" required style={fieldStyle} />
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
                        <input type="date" required style={{ ...fieldStyle, colorScheme: 'dark' }} />
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
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={fullWidthStyle}>
                        <label style={labelStyle}>School Name*</label>
                        <input type="text" placeholder="Enter school name" required style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Province*</label>
                        <CustomSelect
                          options={provinces}
                          value={schProvince}
                          onChange={setSchProvince}
                          placeholder="Select Province"
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>District*</label>
                        <input type="text" placeholder="e.g. Colombo" required style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Commerce Society Name*</label>
                        <input type="text" placeholder="e.g. Commerce Society of School" required style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Commerce Society Email*</label>
                        <input type="email" placeholder="society@school.com" required style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Master-In-Charge Name*</label>
                        <input type="text" placeholder="Mr./Ms. Name" required style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Master-In-Charge Contact*</label>
                        <input 
                          type="tel" 
                          placeholder="070 000 0000" 
                          required 
                          style={fieldStyle} 
                          value={schMicContact}
                          onChange={e => setSchMicContact(formatPhone(e.target.value))}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>President Name*</label>
                        <input type="text" placeholder="President Name" required style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>President Contact (WhatsApp)*</label>
                        <input 
                          type="tel" 
                          placeholder="070 000 0000" 
                          required 
                          style={fieldStyle} 
                          value={schPresContact}
                          onChange={e => setSchPresContact(formatPhone(e.target.value))}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>President A/L Batch*</label>
                        <input type="text" placeholder="e.g. 2025" required style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Secretary Name*</label>
                        <input type="text" placeholder="Secretary Name" required style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Secretary Contact*</label>
                        <input 
                          type="tel" 
                          placeholder="070 000 0000" 
                          required 
                          style={fieldStyle} 
                          value={schSecContact}
                          onChange={e => setSchSecContact(formatPhone(e.target.value))}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Secretary A/L Batch*</label>
                        <input type="text" placeholder="e.g. 2025" required style={fieldStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>Board Year Valid Till*</label>
                        <input type="text" placeholder="e.g. 2025" required style={fieldStyle} />
                      </div>
                      <div style={fullWidthStyle}>
                        <label style={{ display:'flex', gap:'12px', alignItems:'flex-start', cursor:'pointer', marginTop: '10px' }}>
                          <input type="checkbox" required 
                            style={{ marginTop:'3px', accentColor:'#ffffff', width:'16px', height:'16px' }} />
                          <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.60)', lineHeight:'1.5', textTransform: 'none', letterSpacing: 'normal' }}>
                            I agree to AISCA Rules and Regulations and confirm all information provided is accurate.
                          </span>
                        </label>
                      </div>
                    </>
                  )}
                </div>

                <div style={{ marginTop: '32px', paddingTop: '28px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <button
                    type="submit"
                    className="form-submit-btn"
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      color: '#000000',
                      fontWeight: 600,
                      borderRadius: '999px',
                      padding: '18px',
                      fontSize: '15px',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {tab === 'individual' ? 'Submit Associate Application' : 'Submit School Registration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </Container>
    </SectionWrapper>
  );
}
