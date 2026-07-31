'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizGrid } from '@/data/bs360-grids';
import { BS360_STORAGE_KEY } from '@/lib/bs360-auth';
import Bs360Background from '../../../../Bs360Background';

const DIFFICULTY_STYLE: Record<
  string,
  { accent: string; glow: string; bg: string; label: string }
> = {
  Easy: { accent: '#34d399', glow: 'rgba(52,211,153,0.5)', bg: 'rgba(52,211,153,0.1)', label: 'EASY' },
  Medium: { accent: '#38bdf8', glow: 'rgba(56,189,248,0.5)', bg: 'rgba(56,189,248,0.1)', label: 'MEDIUM' },
  Hard: { accent: '#f59e0b', glow: 'rgba(245,158,11,0.5)', bg: 'rgba(245,158,11,0.1)', label: 'HARD' },
  'Super Hard': { accent: '#f43f5e', glow: 'rgba(244,63,94,0.5)', bg: 'rgba(244,63,94,0.1)', label: 'SUPER HARD' },
};

const SUBJECTS_ORDER = ['Economics', 'Business Studies', 'Accounting', 'General Knowledge'] as const;

const SUBJECT_CODE: Record<string, string> = {
  Economics: 'EC',
  'Business Studies': 'BU',
  Accounting: 'AC',
  'General Knowledge': 'GK',
};

const SUBJECT_SHORT: Record<string, string> = {
  Economics: 'Economics',
  'Business Studies': 'Business',
  Accounting: 'Accounting',
  'General Knowledge': 'Gen. Knowledge',
};

const LANG_LABEL: Record<'en' | 'si' | 'ta', string> = {
  en: 'English',
  si: 'සිංහල',
  ta: 'தமிழ்',
};

const POLL_MS = 3500;

interface Props {
  classroom: number;
  grid: QuizGrid;
}

function getKey(): string {
  try {
    return window.localStorage.getItem(BS360_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export default function QuizBoardClient({ classroom, grid }: Props) {
  const [revealed, setRevealed] = useState<Record<number, string>>({});
  const [loadingBox, setLoadingBox] = useState<number | null>(null);
  const [modalBox, setModalBox] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchState = useCallback(async () => {
    try {
      const key = getKey();
      const res = await fetch(
        `/api/bs360/state?classroom=${classroom}&grid=${grid.id}&key=${encodeURIComponent(key)}`,
        { cache: 'no-store' }
      );
      if (!res.ok) return;
      const data = await res.json();
      const map: Record<number, string> = {};
      for (const r of data.reveals || []) map[r.boxIndex] = r.revealedAt;
      setRevealed(map);
    } catch {
      // Silent — next poll will retry.
    }
  }, [classroom, grid.id]);

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchState]);

  async function handleBoxClick(index: number) {
    const box = grid.boxes[index];
    if (box.pending) return;
    if (revealed[index]) return; // already used — cannot be reopened
    if (loadingBox !== null) return;

    setLoadingBox(index);
    try {
      const key = getKey();
      const res = await fetch('/api/bs360/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, classroom, grid: grid.id, boxIndex: index }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Something went wrong. Try again.');
        setLoadingBox(null);
        return;
      }

      setRevealed((prev) => ({ ...prev, [index]: data.revealedAt || new Date().toISOString() }));

      if (data.firstReveal) {
        setModalBox(index);
      } else {
        showToast('This question was already opened.');
      }
    } catch {
      showToast('Network error — try again.');
    } finally {
      setLoadingBox(null);
    }
  }

  async function handleReset() {
    if (resetting) return;
    const ok = window.confirm(
      `Reset ALL 16 boxes for Classroom ${classroom} · Grid ${String(grid.id).padStart(2, '0')}?\nThis is for testing only — it cannot be undone.`
    );
    if (!ok) return;

    setResetting(true);
    try {
      const key = getKey();
      const res = await fetch('/api/bs360/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, classroom, grid: grid.id }),
      });
      if (res.ok) {
        setRevealed({});
        showToast('Grid reset.');
      } else {
        showToast('Could not reset grid.');
      }
    } catch {
      showToast('Network error — try again.');
    } finally {
      setResetting(false);
    }
  }

  const activeBox = modalBox !== null ? grid.boxes[modalBox] : null;
  const activeStyle = activeBox ? DIFFICULTY_STYLE[activeBox.difficulty] : null;

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Bs360Background />

      <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto', padding: '24px 16px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <Link href={`/bs360quizgrid/c/${classroom}`} className="bs360-back-link" style={{ fontSize: 13 }}>
            ← Grid list
          </Link>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="bs360-reset-link"
            style={{
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              cursor: resetting ? 'default' : 'pointer',
              opacity: resetting ? 0.5 : 1,
            }}
          >
            {resetting ? 'Resetting…' : 'Reset (testing)'}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: 20 }}
        >
          <p
            style={{
              textTransform: 'uppercase',
              marginBottom: 4,
              fontSize: 11,
              letterSpacing: '0.3em',
              color: '#7dd3fc',
              fontWeight: 600,
            }}
          >
            Classroom {String(classroom).padStart(2, '0')}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(1.4rem, 4.5vw, 2.1rem)',
              background: 'linear-gradient(180deg, #ffffff, rgba(255,255,255,0.6))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {grid.label}
          </h1>
        </motion.div>

        {!grid.available && (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 20 }}>
            This grid&apos;s questions haven&apos;t been uploaded yet.
          </p>
        )}

        {/* difficulty legend as pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
          {Object.entries(DIFFICULTY_STYLE).map(([diff, style]) => (
            <div
              key={diff}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                borderRadius: 999,
                background: style.bg,
                border: `1px solid ${style.accent}33`,
              }}
            >
              <span
                style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: style.accent }}
              />
              <span style={{ fontSize: 10.5, color: style.accent, letterSpacing: '0.04em', fontWeight: 700 }}>
                {style.label}
              </span>
            </div>
          ))}
        </div>

        {/* subject column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          {SUBJECTS_ORDER.map((s) => (
            <div key={s} style={{ textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: 9,
                  marginBottom: 6,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                  fontWeight: 800,
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.7)',
                  letterSpacing: '0.02em',
                }}
              >
                {SUBJECT_CODE[s]}
              </div>
              <p
                style={{
                  fontSize: 9.5,
                  color: 'rgba(255,255,255,0.48)',
                  letterSpacing: '0.02em',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                {SUBJECT_SHORT[s]}
              </p>
            </div>
          ))}
        </div>

        {/* 4x4 board */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {grid.boxes.map((box, index) => {
            const style = DIFFICULTY_STYLE[box.difficulty];
            const isRevealed = Boolean(revealed[index]);
            const isPending = Boolean(box.pending);
            const isLoading = loadingBox === index;
            const disabled = isRevealed || isPending || isLoading;

            return (
              <motion.button
                key={index}
                onClick={() => handleBoxClick(index)}
                disabled={disabled}
                initial={{ opacity: 0, y: 10, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, delay: index * 0.018, ease: [0.22, 1, 0.36, 1] }}
                whileHover={!disabled ? { y: -5, scale: 1.03 } : undefined}
                whileTap={!disabled ? { scale: 0.95 } : undefined}
                className={disabled ? 'bs360-box' : 'bs360-box bs360-box-live'}
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  background:
                    isRevealed || isPending
                      ? 'rgba(255,255,255,0.025)'
                      : `linear-gradient(155deg, ${style.accent}4D, ${style.accent}14)`,
                  border: `1.5px solid ${isRevealed || isPending ? 'rgba(255,255,255,0.06)' : style.accent + 'aa'}`,
                  cursor: disabled ? (isPending ? 'default' : 'not-allowed') : 'pointer',
                  opacity: isPending ? 0.4 : 1,
                  boxShadow: disabled ? 'none' : `0 12px 30px -14px ${style.glow}`,
                }}
              >
                {isLoading && (
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.15)',
                      borderTopColor: 'rgba(255,255,255,0.65)',
                      animation: 'bs360-spin 0.7s linear infinite',
                    }}
                  />
                )}

                {!isLoading && isRevealed && (
                  <>
                    <span style={{ fontSize: 19, color: 'rgba(255,255,255,0.22)' }}>✕</span>
                    <span
                      style={{
                        marginTop: 5,
                        fontSize: 9,
                        color: 'rgba(255,255,255,0.3)',
                        letterSpacing: '0.1em',
                        fontWeight: 600,
                      }}
                    >
                      USED
                    </span>
                  </>
                )}

                {!isLoading && !isRevealed && (
                  <>
                    <span
                      style={{
                        fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                        fontWeight: 800,
                        fontSize: 'clamp(15px, 3.6vw, 19px)',
                        lineHeight: 1,
                        color: isPending ? 'rgba(255,255,255,0.35)' : '#fff',
                        textShadow: isPending ? 'none' : '0 2px 10px rgba(0,0,0,0.35)',
                      }}
                    >
                      {isPending ? '···' : SUBJECT_CODE[box.subject]}
                    </span>
                    <span
                      style={{
                        marginTop: 8,
                        padding: '3px 11px',
                        borderRadius: 999,
                        background: isPending ? 'rgba(255,255,255,0.05)' : 'rgba(5,5,10,0.45)',
                        fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                        fontWeight: 800,
                        fontSize: 'clamp(12px, 3vw, 14px)',
                        color: isPending ? 'rgba(255,255,255,0.35)' : '#fff',
                      }}
                    >
                      {isPending ? '—' : box.points}
                    </span>
                  </>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 50,
              maxWidth: '90vw',
            }}
          >
            <div
              style={{
                padding: '12px 20px',
                borderRadius: 14,
                color: 'rgba(255,255,255,0.85)',
                background: 'rgba(16,16,22,0.96)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: 13,
                backdropFilter: 'blur(12px)',
                textAlign: 'center',
                boxShadow: '0 12px 34px -12px rgba(0,0,0,0.7)',
              }}
            >
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* question modal */}
      <AnimatePresence>
        {activeBox && activeStyle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              background: 'rgba(4,4,8,0.8)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setModalBox(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 640,
                maxHeight: '88vh',
                overflowY: 'auto',
                borderRadius: 24,
                padding: '30px 26px',
                background: 'linear-gradient(180deg, rgba(20,20,28,0.98), rgba(10,10,14,0.98))',
                border: `1px solid ${activeStyle.accent}44`,
                boxShadow: `0 30px 100px -24px rgba(0,0,0,0.75), 0 0 90px -20px ${activeStyle.glow}`,
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '15%',
                  right: '15%',
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${activeStyle.accent}55, transparent)`,
                }}
              />

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                      fontWeight: 800,
                      fontSize: 14,
                      color: activeStyle.accent,
                      background: activeStyle.bg,
                      border: `1px solid ${activeStyle.accent}33`,
                    }}
                  >
                    {SUBJECT_CODE[activeBox.subject]}
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{activeBox.subject}</p>
                    <p style={{ fontSize: 11, letterSpacing: '0.1em', color: activeStyle.accent, fontWeight: 700, marginTop: 2 }}>
                      {activeStyle.label} · {activeBox.points} PTS
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalBox(null)}
                  className="bs360-close-btn"
                  style={{
                    fontSize: 22,
                    lineHeight: 1,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.45)',
                    padding: 4,
                  }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {(['en', 'si', 'ta'] as const).map((lang) => (
                  <div
                    key={lang}
                    style={{
                      borderRadius: 16,
                      padding: '16px 18px',
                      background: 'rgba(255,255,255,0.035)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        marginBottom: 9,
                        padding: '4px 11px',
                        borderRadius: 999,
                        fontSize: 10,
                        letterSpacing: '0.1em',
                        fontWeight: 700,
                        color: activeStyle.accent,
                        background: activeStyle.bg,
                      }}
                    >
                      {LANG_LABEL[lang]}
                    </span>
                    <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: 'clamp(16px, 3.6vw, 19px)', fontWeight: 500, lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                      {activeBox.question[lang]}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setModalBox(null)}
                className="bs360-close-full"
                style={{
                  width: '100%',
                  marginTop: 24,
                  padding: 14,
                  borderRadius: 14,
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#fff',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  cursor: 'pointer',
                }}
              >
                Close — mark as used
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes bs360-spin {
          to { transform: rotate(360deg); }
        }
        .bs360-back-link {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.25s;
        }
        .bs360-back-link:hover {
          color: #7dd3fc;
        }
        .bs360-reset-link {
          color: rgba(255,255,255,0.3);
          transition: color 0.25s;
        }
        .bs360-reset-link:hover:not(:disabled) {
          color: rgba(255,255,255,0.65);
        }
        .bs360-box-live:hover {
          box-shadow: 0 14px 34px -14px rgba(56,189,248,0.4) !important;
        }
        .bs360-close-btn:hover {
          color: rgba(255,255,255,0.9) !important;
        }
        .bs360-close-full:hover {
          background: rgba(255,255,255,0.11) !important;
          border-color: rgba(255,255,255,0.2) !important;
        }
      `}</style>
    </div>
  );
}
