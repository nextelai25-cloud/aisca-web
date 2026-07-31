'use client';

import { useEffect, useState, FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { BS360_PASSWORD, BS360_STORAGE_KEY } from '@/lib/bs360-auth';
import Bs360Background from './Bs360Background';

// Paths under /bs360quizgrid that are public (no password gate).
const PUBLIC_PATHS = ['/bs360quizgrid/scoreboard'];

export default function Bs360Gate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
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

  if (isPublic) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Bs360Background />
        <div
          style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
        </div>
        <style>{`@keyframes bs360-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Bs360Background />

        <div
          style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 20px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '100%', maxWidth: 380 }}
          >
            <div
              className="bs360-gate-card"
              style={{
                position: 'relative',
                borderRadius: 26,
                padding: '38px 30px',
                textAlign: 'center',
                background:
                  'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.09)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                boxShadow: '0 24px 80px -24px rgba(0,0,0,0.65), 0 0 100px -30px rgba(56,189,248,0.35)',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '18%',
                  right: '18%',
                  height: 1,
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                }}
              />

              <motion.img
                src="/bs360-logo.png"
                alt="BS360"
                draggable={false}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  display: 'block',
                  margin: '0 auto 22px',
                  width: '100%',
                  maxWidth: 170,
                  height: 'auto',
                  filter: 'drop-shadow(0 0 24px rgba(56,189,248,0.35))',
                }}
              />

              <p
                style={{
                  textTransform: 'uppercase',
                  marginBottom: 6,
                  fontSize: 11,
                  letterSpacing: '0.28em',
                  color: '#7dd3fc',
                  fontWeight: 600,
                }}
              >
                Quiz Grid — Locked
              </p>
              <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13.5, marginBottom: 30, fontWeight: 300 }}>
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
                  className="bs360-gate-input"
                  style={{
                    width: '100%',
                    padding: '15px 16px',
                    background: 'rgba(255,255,255,0.05)',
                    border: `1px solid ${error ? 'rgba(244,63,94,0.55)' : 'rgba(255,255,255,0.12)'}`,
                    borderRadius: 14,
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

                <motion.button
                  type="submit"
                  whileHover={{ y: -2, boxShadow: '0 14px 34px -10px rgba(56,189,248,0.75)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%',
                    marginTop: 20,
                    padding: 15,
                    borderRadius: 14,
                    fontWeight: 700,
                    background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                    color: '#04121a',
                    fontSize: 14,
                    letterSpacing: '0.03em',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 10px 28px -10px rgba(56,189,248,0.65)',
                  }}
                >
                  Unlock
                </motion.button>
              </motion.form>
            </div>
          </motion.div>
        </div>

        <style>{`
          .bs360-gate-input:focus {
            border-color: rgba(56,189,248,0.6) !important;
            box-shadow: 0 0 0 3px rgba(56,189,248,0.15);
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
