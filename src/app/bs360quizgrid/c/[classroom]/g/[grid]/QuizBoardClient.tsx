'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizGrid } from '@/data/bs360-grids';
import { BS360_STORAGE_KEY } from '@/lib/bs360-auth';

const DIFFICULTY_STYLE: Record<
  string,
  { accent: string; glow: string; bg: string; label: string }
> = {
  Easy: { accent: '#34d399', glow: 'rgba(52,211,153,0.45)', bg: 'rgba(52,211,153,0.08)', label: 'EASY' },
  Medium: { accent: '#38bdf8', glow: 'rgba(56,189,248,0.45)', bg: 'rgba(56,189,248,0.08)', label: 'MEDIUM' },
  Hard: { accent: '#f59e0b', glow: 'rgba(245,158,11,0.45)', bg: 'rgba(245,158,11,0.08)', label: 'HARD' },
  'Super Hard': { accent: '#f43f5e', glow: 'rgba(244,63,94,0.45)', bg: 'rgba(244,63,94,0.08)', label: 'SUPER HARD' },
};

const SUBJECT_ICON: Record<string, string> = {
  Economics: '📈',
  'Business Studies': '💼',
  Accounting: '📊',
  'General Knowledge': '🧠',
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

  return (
    <div className="min-h-screen px-4 md:px-6 py-10 md:py-16 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(56,189,248,0.10), transparent 70%)',
        }}
      />

      <div className="relative max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href={`/bs360quizgrid/c/${classroom}`}
            className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors"
            style={{ fontSize: '13px' }}
          >
            ← Grid list
          </Link>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="text-white/25 hover:text-white/50 transition-colors disabled:opacity-40"
            style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            {resetting ? 'Resetting…' : 'Reset (testing)'}
          </button>
        </div>

        <div className="text-center mb-10">
          <p
            className="uppercase mb-2"
            style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'rgba(56,189,248,0.7)' }}
          >
            Classroom {String(classroom).padStart(2, '0')}
          </p>
          <h1
            className="font-bold text-white"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4.5vw, 2.5rem)' }}
          >
            {grid.label}
          </h1>
        </div>

        {!grid.available && (
          <p className="text-center text-white/40 text-sm mb-8">
            This grid&apos;s questions haven&apos;t been uploaded yet.
          </p>
        )}

        {/* legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {Object.entries(DIFFICULTY_STYLE).map(([diff, style]) => (
            <div key={diff} className="flex items-center gap-1.5">
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: style.accent }}
              />
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                {style.label}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2.5 md:gap-4">
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
                whileHover={!disabled ? { y: -4 } : undefined}
                whileTap={!disabled ? { scale: 0.96 } : undefined}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center overflow-hidden"
                style={{
                  background: isRevealed || isPending ? 'rgba(255,255,255,0.02)' : style.bg,
                  border: `1px solid ${
                    isRevealed || isPending ? 'rgba(255,255,255,0.05)' : style.accent + '55'
                  }`,
                  boxShadow: !disabled ? `0 0 0 rgba(0,0,0,0)` : 'none',
                  cursor: disabled ? (isPending ? 'default' : 'not-allowed') : 'pointer',
                  opacity: isPending ? 0.35 : 1,
                }}
              >
                {!disabled && (
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300"
                    style={{ boxShadow: `0 0 30px -6px ${style.glow}` }}
                  />
                )}

                {isLoading && (
                  <div className="w-5 h-5 rounded-full border-2 border-white/15 border-t-white/60 animate-spin" />
                )}

                {!isLoading && isRevealed && (
                  <>
                    <span style={{ fontSize: '20px', color: 'rgba(255,255,255,0.15)' }}>✕</span>
                    <span
                      className="mt-1"
                      style={{ fontSize: '9px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}
                    >
                      USED
                    </span>
                  </>
                )}

                {!isLoading && !isRevealed && (
                  <>
                    <span style={{ fontSize: 'clamp(16px, 3.2vw, 22px)' }}>
                      {isPending ? '⏳' : SUBJECT_ICON[box.subject]}
                    </span>
                    <span
                      className="mt-1.5 font-bold"
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: 'clamp(13px, 2.6vw, 18px)',
                        color: isPending ? 'rgba(255,255,255,0.3)' : style.accent,
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

        <div className="mt-8 grid grid-cols-4 gap-2.5 md:gap-4 text-center">
          {['Economics', 'Business Studies', 'Accounting', 'General Knowledge'].map((s) => (
            <p key={s} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.03em' }}>
              {SUBJECT_ICON[s]} {s}
            </p>
          ))}
        </div>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
          >
            <div
              className="px-5 py-3 rounded-xl text-white/80"
              style={{
                background: 'rgba(20,20,20,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                fontSize: '13px',
                backdropFilter: 'blur(10px)',
              }}
            >
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* question modal */}
      <AnimatePresence>
        {activeBox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={() => setModalBox(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-[24px] p-6 md:p-10"
              style={{
                background: '#0a0a0a',
                border: `1px solid ${DIFFICULTY_STYLE[activeBox.difficulty].accent}55`,
                boxShadow: `0 0 100px -20px ${DIFFICULTY_STYLE[activeBox.difficulty].glow}`,
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <span style={{ fontSize: '20px' }}>{SUBJECT_ICON[activeBox.subject]}</span>
                  <div>
                    <p className="text-white font-semibold" style={{ fontSize: '14px' }}>
                      {activeBox.subject}
                    </p>
                    <p
                      style={{
                        fontSize: '11px',
                        letterSpacing: '0.1em',
                        color: DIFFICULTY_STYLE[activeBox.difficulty].accent,
                      }}
                    >
                      {DIFFICULTY_STYLE[activeBox.difficulty].label} · {activeBox.points} PTS
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setModalBox(null)}
                  className="text-white/40 hover:text-white/80 transition-colors"
                  style={{ fontSize: '22px', lineHeight: 1 }}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="space-y-5">
                {(['en', 'si', 'ta'] as const).map((lang) => (
                  <div
                    key={lang}
                    className="rounded-2xl p-4 md:p-5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <span
                      className="inline-block mb-2 px-2.5 py-1 rounded-full"
                      style={{
                        fontSize: '10px',
                        letterSpacing: '0.1em',
                        color: DIFFICULTY_STYLE[activeBox.difficulty].accent,
                        background: DIFFICULTY_STYLE[activeBox.difficulty].bg,
                      }}
                    >
                      {LANG_LABEL[lang]}
                    </span>
                    <p className="text-white/85" style={{ fontSize: '14.5px', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                      {activeBox.question[lang]}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setModalBox(null)}
                className="w-full mt-7 rounded-xl font-semibold transition-transform active:scale-[0.98]"
                style={{
                  padding: '14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '14px',
                }}
              >
                Close — mark as used
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
