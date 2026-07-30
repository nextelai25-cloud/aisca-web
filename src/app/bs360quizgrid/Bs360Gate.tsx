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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#050505' }}>
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-[#38bdf8] animate-spin" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6 py-16 relative overflow-hidden"
        style={{ background: '#050505' }}
      >
        {/* neon glow backdrop, matching the BS360 logo */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 45% at 50% 38%, rgba(56,189,248,0.16), transparent 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm"
        >
          <div
            className="relative rounded-[24px] p-8 md:p-10 text-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(56,189,248,0.18)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 80px -20px rgba(56,189,248,0.25)',
            }}
          >
            <img
              src="/bs360-logo.png"
              alt="BS360"
              className="mx-auto mb-6 w-full max-w-[220px] h-auto"
              draggable={false}
            />

            <p
              className="uppercase mb-1"
              style={{ fontSize: '11px', letterSpacing: '0.25em', color: 'rgba(56,189,248,0.7)' }}
            >
              Quiz Grid — Locked
            </p>
            <p className="text-white/40 text-sm mb-8">
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
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${error ? 'rgba(244,63,94,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  letterSpacing: '0.05em',
                }}
              />

              {error && (
                <p style={{ color: '#f87171', fontSize: '12.5px', marginTop: '10px' }}>
                  Incorrect password. Try again.
                </p>
              )}

              <button
                type="submit"
                className="w-full mt-5 rounded-xl font-semibold transition-transform active:scale-[0.98]"
                style={{
                  padding: '14px',
                  background: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
                  color: '#04121a',
                  fontSize: '14px',
                  letterSpacing: '0.03em',
                  border: 'none',
                  boxShadow: '0 8px 24px -8px rgba(56,189,248,0.6)',
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
