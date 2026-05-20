'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Container } from '@/components/layout/Container';
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

export default function SchoolRegisterPage() {
  const [submitted, setSubmitted] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // State bindings for all form fields
  const [schoolName, setSchoolName] = useState('');
  const [schProvince, setSchProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [commerceSocietyName, setCommerceSocietyName] = useState('');
  const [commerceSocietyEmail, setCommerceSocietyEmail] = useState('');
  const [masterInChargeName, setMasterInChargeName] = useState('');
  const [masterInChargeEmail, setMasterInChargeEmail] = useState('');
  const [schMicContact, setSchMicContact] = useState('');
  const [studentPresidentName, setStudentPresidentName] = useState('');
  const [studentPresidentEmail, setStudentPresidentEmail] = useState('');
  const [schPresContact, setSchPresContact] = useState('');
  const [presidentALBatch, setPresidentALBatch] = useState('');
  const [secretaryName, setSecretaryName] = useState('');
  const [schSecContact, setSchSecContact] = useState('');
  const [secretaryALBatch, setSecretaryALBatch] = useState('');
  const [boardYear, setBoardYear] = useState('');

  // Submit flow states
  const [loading, setLoading] = useState(false);
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
    if (!schProvince) {
      setErrorMsg('Please select your Province.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      const formData = {
        school_name: schoolName,
        province: schProvince,
        district: district,
        commerce_society_name: commerceSocietyName,
        commerce_society_email: commerceSocietyEmail,
        master_in_charge_name: masterInChargeName,
        master_in_charge_email: masterInChargeEmail,
        master_in_charge_phone: schMicContact,
        student_president_name: studentPresidentName,
        student_president_email: studentPresidentEmail,
        student_president_phone: schPresContact,
        
        // These are not stored in the DB but collected by the form
        secretary_name: secretaryName,
        secretary_phone: schSecContact,
        secretary_batch: secretaryALBatch,
        board_year: boardYear
      };
      
      const res = await fetch('/api/register/school', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await res.json();
      
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Failed to submit registration');
      }
      
      if (result.success) {
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

  return (
    <SmoothScrollProvider>
      <Navbar />
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
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span className="section-eyebrow">National Onboarding</span>
            <h1 className="section-title" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>Register Your School</h1>
            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
              Register your school's Commerce Society inside the official AISCA registry to pioneer regional and national youth leadership.
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
                  padding: '60px 40px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '24px'
                }}>
                  <div style={{
                    width: '80px', height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(212,175,55,0.1)',
                    border: '1px solid rgba(212,175,55,0.4)',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    color: '#d4af37',
                    boxShadow: '0 0 25px rgba(212,175,55,0.15)'
                  }}>✓</div>
                  
                  <h3 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    School Registered!
                  </h3>
                  
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6' }}>
                    Thank you! Your school's Commerce Society registration request has been submitted to the AISCA board. 
                    Our management team will review the details and reach out to your Master-in-Charge shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div style={fullWidthStyle}>
                      <label style={labelStyle}>School Name*</label>
                      <input 
                        type="text" 
                        placeholder="Enter school name" 
                        required 
                        style={fieldStyle}
                        value={schoolName}
                        onChange={e => setSchoolName(e.target.value)}
                      />
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
                      <input 
                        type="text" 
                        placeholder="e.g. Colombo" 
                        required 
                        style={fieldStyle}
                        value={district}
                        onChange={e => setDistrict(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Commerce Society Name*</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Commerce Society of School" 
                        required 
                        style={fieldStyle}
                        value={commerceSocietyName}
                        onChange={e => setCommerceSocietyName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Commerce Society Email*</label>
                      <input 
                        type="email" 
                        placeholder="society@school.com" 
                        required 
                        style={fieldStyle}
                        value={commerceSocietyEmail}
                        onChange={e => setCommerceSocietyEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Master-In-Charge Name*</label>
                      <input 
                        type="text" 
                        placeholder="Mr./Ms. Name" 
                        required 
                        style={fieldStyle}
                        value={masterInChargeName}
                        onChange={e => setMasterInChargeName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Master-In-Charge Email*</label>
                      <input 
                        type="email" 
                        placeholder="mic@school.com" 
                        required 
                        style={fieldStyle}
                        value={masterInChargeEmail}
                        onChange={e => setMasterInChargeEmail(e.target.value)}
                      />
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
                      <input 
                        type="text" 
                        placeholder="President Name" 
                        required 
                        style={fieldStyle}
                        value={studentPresidentName}
                        onChange={e => setStudentPresidentName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>President Email*</label>
                      <input 
                        type="email" 
                        placeholder="president@school.com" 
                        required 
                        style={fieldStyle}
                        value={studentPresidentEmail}
                        onChange={e => setStudentPresidentEmail(e.target.value)}
                      />
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
                      <input 
                        type="text" 
                        placeholder="e.g. 2025" 
                        required 
                        style={fieldStyle}
                        value={presidentALBatch}
                        onChange={e => setPresidentALBatch(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Secretary Name*</label>
                      <input 
                        type="text" 
                        placeholder="Secretary Name" 
                        required 
                        style={fieldStyle}
                        value={secretaryName}
                        onChange={e => setSecretaryName(e.target.value)}
                      />
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
                      <input 
                        type="text" 
                        placeholder="e.g. 2025" 
                        required 
                        style={fieldStyle}
                        value={secretaryALBatch}
                        onChange={e => setSecretaryALBatch(e.target.value)}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Board Year Valid Till*</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2025" 
                        required 
                        style={fieldStyle}
                        value={boardYear}
                        onChange={e => setBoardYear(e.target.value)}
                      />
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
                      {loading ? 'Submitting Registration...' : 'Submit School Registration'}
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
