'use client';

import { useEffect, useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { BS360_PASSWORD, BS360_STORAGE_KEY } from '@/lib/bs360-auth';

export default function Bs360Gate({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(BS360_STORAGE_KEY);
      if (saved === BS360_PASSWORD) setUnlocked(true);
    } catch {
      // localStorage unavailable (private browsing etc) — just show the gate.
    }
    setChecking(false);
  }, []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (input === BS360_PASSWORD) {
      try {
        window.localStorage.setItem(BS360_STORAGE_KEY, BS360_PASSWORD);
      } catch {}
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  }

  if (checking) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '9999px',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#38bdf8',
            animation: 'bs360-spin 0.7s linear infinite',
          }}
        />
        <style jsx>{`
          @keyframes bs360-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px 20px',
          position: 'relative',
          overflow: 'hidden',
          background: '#050505',
        }}
      >
        {/* neon glow backdrop, matching the BS360 logo */}
        <div
          style={{
            pointerEvents: 'none',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 60% 45% at 50% 38%, rgba(56,189,248,0.14), transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ position: 'relative', width: '100%', maxWidth: 380 }}
        >
          <div
            style={{
              position: 'relative',
              borderRadius: 20,
              padding: '36px 28px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(56,189,248,0.2)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 0 90px -24px rgba(56,189,248,0.35)',
            }}
          >
            <img
              src="/bs360-logo.png"
              alt="BS360"
              draggable={false}
              style={{
                display: 'block',
                margin: '0 auto 20px',
                width: '100%',
                maxWidth: 170,
                height: 'auto',
              }}
            />

            <p
              style={{
                textTransform: 'uppercase',
                marginBottom: 6,
                fontSize: 11,
                letterSpacing: '0.25em',
                color: 'rgba(56,189,248,0.75)',
                fontWeight: 600,
              }}
            >
              Quiz Grid — Locked
            </p>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13.5, marginBottom: 28 }}>
              Enter the event password to continue
            </p>

            <motion.form
              onSubmit={handleSubmit}
              animate={shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.45 }}
            >
              <input
                type="password"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Password"
                autoFocus
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${error ? 'rgba(244,63,94,0.55)' : 'rgba(255,255,255,0.12)'}`,
                  borderRadius: 12,
                  color: '#fff',
                  fontSize: 15,
                  outline: 'none',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                }}
              />

              {error && (
                <p style={{ color: '#f87171', fontSize: 12.5, marginTop: 10 }}>
                  Incorrect password. Try again.
                </p>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  marginTop: 18,
                  padding: 14,
                  borderRadius: 12,
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                  color: '#04121a',
                  fontSize: 14,
                  letterSpacing: '0.03em',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 28px -10px rgba(56,189,248,0.65)',
                }}
              >
                Unlock
              </button>
            </motion.form>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
