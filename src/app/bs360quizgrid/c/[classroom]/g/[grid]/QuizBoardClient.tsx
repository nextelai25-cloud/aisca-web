'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import type { QuizGrid } from '@/data/bs360-grids';
import { teamsForClassroom } from '@/data/bs360-teams';
import { classroomStorageKey } from '@/lib/bs360-auth';
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

// Team A vs Team B colours — kept distinct from the difficulty palette.
const TEAM_A_COLOR = '#38bdf8';
const TEAM_B_COLOR = '#a78bfa';

const POLL_MS = 3500;

interface Match {
  teamA: string;
  teamB: string;
  winner: string | null;
}

interface RevealInfo {
  revealedAt: string;
  team: string | null;
}

interface Props {
  classroom: number;
  grid: QuizGrid;
}

export default function QuizBoardClient({ classroom, grid }: Props) {
  const allTeams = teamsForClassroom(classroom);
  const isDemo = grid.demo === true; // practice grid: fully local, never scored

  function getKey(): string {
    try {
      return window.localStorage.getItem(classroomStorageKey(classroom)) || '';
    } catch {
      return '';
    }
  }

  const [match, setMatch] = useState<Match | null>(null);
  const [matchLoaded, setMatchLoaded] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, RevealInfo>>({});
  const [loadingBox, setLoadingBox] = useState<number | null>(null);
  const [modalBox, setModalBox] = useState<number | null>(null);
  const [pickBox, setPickBox] = useState<number | null>(null); // box awaiting "who answered"
  const [toast, setToast] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);

  // team-selection gate
  const [selected, setSelected] = useState<string[]>([]);
  const [savingTeams, setSavingTeams] = useState(false);

  // winner
  const [winnerOpen, setWinnerOpen] = useState(false);
  const [savingWinner, setSavingWinner] = useState(false);

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
      const map: Record<number, RevealInfo> = {};
      for (const r of data.reveals || []) map[r.boxIndex] = { revealedAt: r.revealedAt, team: r.team ?? null };
      setRevealed(map);
      setMatch(data.match ?? null);
      setMatchLoaded(true);
    } catch {
      // Silent — next poll will retry.
    }
  }, [classroom, grid.id]);

  useEffect(() => {
    if (isDemo) {
      setMatchLoaded(true); // demo is local-only — no server state to load
      return;
    }
    fetchState();
    const interval = setInterval(fetchState, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchState, isDemo]);

  function toggleTeam(team: string) {
    setSelected((prev) => {
      if (prev.includes(team)) return prev.filter((t) => t !== team);
      if (prev.length >= 2) return prev; // max two
      return [...prev, team];
    });
  }

  async function confirmTeams() {
    if (selected.length !== 2 || savingTeams) return;
    if (isDemo) {
      setMatch({ teamA: selected[0], teamB: selected[1], winner: null });
      return;
    }
    setSavingTeams(true);
    try {
      const key = getKey();
      const res = await fetch('/api/bs360/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, classroom, grid: grid.id, teamA: selected[0], teamB: selected[1] }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Could not set teams.');
        setSavingTeams(false);
        return;
      }
      if (data.match) setMatch(data.match);
      if (data.alreadySet) showToast('Teams were already set for this grid.');
      await fetchState();
    } catch {
      showToast('Network error — try again.');
    } finally {
      setSavingTeams(false);
    }
  }

  function handleBoxClick(index: number) {
    const box = grid.boxes[index];
    if (box.pending) return;
    if (revealed[index]) return; // already used — cannot be reopened
    if (loadingBox !== null) return;
    if (!match) {
      showToast('Pick the two teams first.');
      return;
    }
    setPickBox(index); // ask which team is answering
  }

  async function revealWithTeam(index: number, team: string) {
    setPickBox(null);
    if (isDemo) {
      setRevealed((prev) => ({ ...prev, [index]: { revealedAt: new Date().toISOString(), team } }));
      setModalBox(index);
      return;
    }
    setLoadingBox(index);
    try {
      const key = getKey();
      const res = await fetch('/api/bs360/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, classroom, grid: grid.id, boxIndex: index, team }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || 'Something went wrong. Try again.');
        setLoadingBox(null);
        return;
      }

      setRevealed((prev) => ({
        ...prev,
        [index]: { revealedAt: data.revealedAt || new Date().toISOString(), team: data.team ?? team },
      }));

      if (data.firstReveal) {
        setModalBox(index);
      } else {
        showToast(
          data.team ? `Already opened — answered by ${data.team}.` : 'This question was already opened.'
        );
      }
    } catch {
      showToast('Network error — try again.');
    } finally {
      setLoadingBox(null);
    }
  }

  async function chooseWinner(team: string) {
    if (savingWinner) return;
    if (isDemo) {
      setMatch((prev) => (prev ? { ...prev, winner: team } : prev));
      setWinnerOpen(false);
      showToast(team === 'DRAW' ? 'Draw recorded (demo).' : `Winner recorded (demo): ${team}`);
      return;
    }
    setSavingWinner(true);
    try {
      const key = getKey();
      const res = await fetch('/api/bs360/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, classroom, grid: grid.id, winner: team }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Could not set winner.');
        setSavingWinner(false);
        return;
      }
      setMatch((prev) => (prev ? { ...prev, winner: team } : prev));
      setWinnerOpen(false);
      showToast(team === 'DRAW' ? 'Draw recorded.' : `Winner recorded: ${team}`);
      await fetchState();
    } catch {
      showToast('Network error — try again.');
    } finally {
      setSavingWinner(false);
    }
  }

  async function handleReset() {
    if (resetting) return;
    const ok = window.confirm(
      `Reset Classroom ${classroom} · Grid ${String(grid.id).padStart(2, '0')}?\nThis clears all boxes, the teams and the winner. Testing only.`
    );
    if (!ok) return;

    if (isDemo) {
      setRevealed({});
      setMatch(null);
      setSelected([]);
      showToast('Demo reset.');
      return;
    }

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
        setMatch(null);
        setSelected([]);
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

  function teamColor(team: string | null): string {
    if (!match || !team) return 'rgba(255,255,255,0.4)';
    return team === match.teamA ? TEAM_A_COLOR : TEAM_B_COLOR;
  }
  function teamLetter(team: string | null): string {
    if (!match || !team) return '';
    return team === match.teamA ? 'A' : 'B';
  }

  const activeBox = modalBox !== null ? grid.boxes[modalBox] : null;
  const activeStyle = activeBox ? DIFFICULTY_STYLE[activeBox.difficulty] : null;

  // ── Team-selection gate ─────────────────────────────────────
  if (matchLoaded && !match) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Bs360Background />
        <div style={{ position: 'relative', maxWidth: 520, margin: '0 auto', padding: '32px 18px 60px' }}>
          <Link href={`/bs360quizgrid/c/${classroom}`} className="bs360-back-link" style={{ fontSize: 13 }}>
            ← Grid list
          </Link>

          <div style={{ textAlign: 'center', margin: '30px 0 26px' }}>
            <p style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.3em', color: '#7dd3fc', fontWeight: 600, marginBottom: 8 }}>
              Classroom {String(classroom).padStart(2, '0')} · {grid.label}
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                fontWeight: 800,
                fontSize: 'clamp(1.4rem, 4.5vw, 2rem)',
                background: 'linear-gradient(180deg, #ffffff, rgba(255,255,255,0.6))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Select the two teams
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13.5, marginTop: 8, fontWeight: 300 }}>
              Choose exactly two teams competing in this grid.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {allTeams.map((t) => {
              const on = selected.includes(t);
              const idx = selected.indexOf(t);
              const color = idx === 0 ? TEAM_A_COLOR : idx === 1 ? TEAM_B_COLOR : '#38bdf8';
              return (
                <button
                  key={t}
                  onClick={() => toggleTeam(t)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                    textAlign: 'left',
                    padding: '15px 18px',
                    borderRadius: 16,
                    cursor: 'pointer',
                    background: on
                      ? `linear-gradient(180deg, ${color}26, ${color}0d)`
                      : 'rgba(255,255,255,0.035)',
                    border: `1.5px solid ${on ? color + 'cc' : 'rgba(255,255,255,0.1)'}`,
                    transition: 'all 0.2s',
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: on ? color : 'rgba(255,255,255,0.08)',
                      color: on ? '#04121a' : 'rgba(255,255,255,0.5)',
                      fontWeight: 800,
                      fontSize: 13,
                    }}
                  >
                    {on ? (idx === 0 ? 'A' : 'B') : '+'}
                  </span>
                  <span style={{ color: '#fff', fontSize: 14.5, fontWeight: 500 }}>{t}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={confirmTeams}
            disabled={selected.length !== 2 || savingTeams}
            style={{
              width: '100%',
              marginTop: 24,
              padding: 15,
              borderRadius: 14,
              fontWeight: 700,
              fontSize: 14,
              color: '#04121a',
              background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
              border: 'none',
              cursor: selected.length === 2 && !savingTeams ? 'pointer' : 'default',
              opacity: selected.length === 2 && !savingTeams ? 1 : 0.4,
              boxShadow: '0 10px 28px -10px rgba(56,189,248,0.6)',
            }}
          >
            {savingTeams ? 'Setting up…' : selected.length === 2 ? 'Start match' : `Select ${2 - selected.length} more`}
          </button>
        </div>
        <style>{`
          .bs360-back-link { color: rgba(255,255,255,0.45); text-decoration: none; transition: color 0.25s; }
          .bs360-back-link:hover { color: #7dd3fc; }
        `}</style>
      </div>
    );
  }

  // still loading match state — brief spinner
  if (!matchLoaded) {
    return (
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        <Bs360Background />
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: '2px solid rgba(255,255,255,0.12)',
              borderTopColor: '#38bdf8',
              animation: 'bs360-spin 0.7s linear infinite',
            }}
          />
        </div>
        <style>{`@keyframes bs360-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
          style={{ textAlign: 'center', marginBottom: 18 }}
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

        {isDemo && (
          <div
            style={{
              textAlign: 'center',
              margin: '0 auto 16px',
              maxWidth: 460,
              padding: '10px 16px',
              borderRadius: 12,
              background: 'linear-gradient(180deg, rgba(56,189,248,0.14), rgba(56,189,248,0.04))',
              border: '1px solid rgba(56,189,248,0.35)',
              color: '#7dd3fc',
              fontSize: 12.5,
              fontWeight: 600,
            }}
          >
            Practice grid — try the flow freely. Nothing here is saved or counted on the scoreboard.
          </div>
        )}

        {/* match header — Team A vs Team B */}
        {match && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            <TeamChip letter="A" name={match.teamA} color={TEAM_A_COLOR} won={match.winner === match.teamA} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em' }}>VS</span>
            <TeamChip letter="B" name={match.teamB} color={TEAM_B_COLOR} won={match.winner === match.teamB} />
          </div>
        )}

        {/* result banner or button */}
        {match && match.winner ? (
          <div
            style={{
              textAlign: 'center',
              margin: '0 auto 20px',
              maxWidth: 440,
              padding: '12px 18px',
              borderRadius: 14,
              background:
                match.winner === 'DRAW'
                  ? 'linear-gradient(180deg, rgba(148,163,184,0.16), rgba(148,163,184,0.05))'
                  : 'linear-gradient(180deg, rgba(250,204,21,0.16), rgba(250,204,21,0.05))',
              border: `1px solid ${match.winner === 'DRAW' ? 'rgba(148,163,184,0.45)' : 'rgba(250,204,21,0.4)'}`,
              color: match.winner === 'DRAW' ? '#cbd5e1' : '#fde68a',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {match.winner === 'DRAW'
              ? `🤝 ${grid.label} ended in a draw`
              : `🏆 ${grid.label} won by ${match.winner}`}
          </div>
        ) : (
          match && (
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <button
                onClick={() => setWinnerOpen(true)}
                className="bs360-winner-btn"
                style={{
                  padding: '10px 22px',
                  borderRadius: 999,
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#fde68a',
                  background: 'rgba(250,204,21,0.1)',
                  border: '1px solid rgba(250,204,21,0.35)',
                  cursor: 'pointer',
                }}
              >
                ★ Record result
              </button>
            </div>
          )
        )}

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
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: style.accent }} />
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
            const info = revealed[index];
            const isRevealed = Boolean(info);
            const isPending = Boolean(box.pending);
            const isLoading = loadingBox === index;
            const disabled = isRevealed || isPending || isLoading;
            const ansColor = teamColor(info?.team ?? null);
            const ansLetter = teamLetter(info?.team ?? null);

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
                title={isRevealed && info?.team ? `Answered by ${info.team}` : undefined}
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
                    isRevealed
                      ? `linear-gradient(160deg, ${ansColor}26, ${ansColor}08)`
                      : isPending
                      ? 'rgba(255,255,255,0.025)'
                      : `linear-gradient(155deg, ${style.accent}4D, ${style.accent}14)`,
                  border: `1.5px solid ${
                    isRevealed ? ansColor + '66' : isPending ? 'rgba(255,255,255,0.06)' : style.accent + 'aa'
                  }`,
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
                    {info?.team ? (
                      <span
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 9,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: ansColor,
                          color: '#04121a',
                          fontWeight: 800,
                          fontSize: 14,
                          fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                        }}
                      >
                        {ansLetter}
                      </span>
                    ) : (
                      <span style={{ fontSize: 19, color: 'rgba(255,255,255,0.22)' }}>✕</span>
                    )}
                    <span
                      style={{
                        marginTop: 5,
                        fontSize: 9,
                        color: info?.team ? ansColor : 'rgba(255,255,255,0.3)',
                        letterSpacing: '0.1em',
                        fontWeight: 700,
                      }}
                    >
                      {info?.team ? 'ANSWERED' : 'USED'}
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

        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <Link href="/bs360quizgrid/scoreboard" className="bs360-back-link" style={{ fontSize: 13 }}>
            View live scoreboard →
          </Link>
        </div>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 60, maxWidth: '90vw' }}
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

      {/* who-answered prompt */}
      <AnimatePresence>
        {pickBox !== null && match && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 55,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              background: 'rgba(4,4,8,0.8)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setPickBox(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 420,
                borderRadius: 22,
                padding: '28px 24px',
                background: 'linear-gradient(180deg, rgba(20,20,28,0.98), rgba(10,10,14,0.98))',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 30px 100px -24px rgba(0,0,0,0.75)',
              }}
            >
              <p style={{ textAlign: 'center', color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                Which team is answering?
              </p>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 12.5, marginBottom: 22 }}>
                Once revealed, this box is used up permanently.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { team: match.teamA, letter: 'A', color: TEAM_A_COLOR },
                  { team: match.teamB, letter: 'B', color: TEAM_B_COLOR },
                ].map(({ team, letter, color }) => (
                  <button
                    key={letter}
                    onClick={() => revealWithTeam(pickBox, team)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      width: '100%',
                      textAlign: 'left',
                      padding: '15px 18px',
                      borderRadius: 15,
                      cursor: 'pointer',
                      background: `linear-gradient(180deg, ${color}22, ${color}0a)`,
                      border: `1.5px solid ${color}99`,
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: color,
                        color: '#04121a',
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      {letter}
                    </span>
                    <span style={{ color: '#fff', fontSize: 14.5, fontWeight: 500 }}>{team}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPickBox(null)}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 12,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.55)',
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* winner prompt */}
      <AnimatePresence>
        {winnerOpen && match && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 55,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              background: 'rgba(4,4,8,0.8)',
              backdropFilter: 'blur(8px)',
            }}
            onClick={() => setWinnerOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: 420,
                borderRadius: 22,
                padding: '28px 24px',
                background: 'linear-gradient(180deg, rgba(20,20,28,0.98), rgba(10,10,14,0.98))',
                border: '1px solid rgba(250,204,21,0.35)',
                boxShadow: '0 30px 100px -24px rgba(0,0,0,0.75), 0 0 80px -30px rgba(250,204,21,0.4)',
              }}
            >
              <p style={{ textAlign: 'center', color: '#fde68a', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
                🏆 Result of {grid.label}
              </p>
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.45)', fontSize: 12.5, marginBottom: 22 }}>
                Win = 2 points · Draw = 1 each. Recorded on the live scoreboard.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { team: match.teamA, letter: 'A', color: TEAM_A_COLOR },
                  { team: match.teamB, letter: 'B', color: TEAM_B_COLOR },
                ].map(({ team, letter, color }) => (
                  <button
                    key={letter}
                    onClick={() => chooseWinner(team)}
                    disabled={savingWinner}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      width: '100%',
                      textAlign: 'left',
                      padding: '15px 18px',
                      borderRadius: 15,
                      cursor: savingWinner ? 'default' : 'pointer',
                      opacity: savingWinner ? 0.6 : 1,
                      background: `linear-gradient(180deg, ${color}22, ${color}0a)`,
                      border: `1.5px solid ${color}99`,
                    }}
                  >
                    <span
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: color,
                        color: '#04121a',
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      {letter}
                    </span>
                    <span style={{ color: '#fff', fontSize: 14.5, fontWeight: 500 }}>{team}</span>
                    <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>wins</span>
                  </button>
                ))}
                <button
                  onClick={() => chooseWinner('DRAW')}
                  disabled={savingWinner}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: 15,
                    cursor: savingWinner ? 'default' : 'pointer',
                    opacity: savingWinner ? 0.6 : 1,
                    background: 'rgba(148,163,184,0.12)',
                    border: '1.5px solid rgba(148,163,184,0.4)',
                    color: '#cbd5e1',
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  🤝 Draw — half a point each
                </button>
              </div>
              <button
                onClick={() => setWinnerOpen(false)}
                style={{
                  width: '100%',
                  marginTop: 16,
                  padding: 12,
                  borderRadius: 12,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.55)',
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </motion.div>
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

              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
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

              {/* who is answering */}
              {modalBox !== null && revealed[modalBox]?.team && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 9,
                    marginBottom: 20,
                    padding: '7px 14px',
                    borderRadius: 999,
                    background: `${teamColor(revealed[modalBox]!.team)}1f`,
                    border: `1px solid ${teamColor(revealed[modalBox]!.team)}66`,
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: teamColor(revealed[modalBox]!.team),
                      color: '#04121a',
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {teamLetter(revealed[modalBox]!.team)}
                  </span>
                  <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>
                    Answering: {revealed[modalBox]!.team}
                  </span>
                </div>
              )}

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
        .bs360-winner-btn:hover {
          background: rgba(250,204,21,0.18) !important;
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

function TeamChip({
  letter,
  name,
  color,
  won,
}: {
  letter: string;
  name: string;
  color: string;
  won: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 9,
        padding: '8px 14px',
        borderRadius: 999,
        background: `linear-gradient(180deg, ${color}22, ${color}0a)`,
        border: `1.5px solid ${won ? '#facc15' : color + '88'}`,
        boxShadow: won ? '0 0 20px -6px rgba(250,204,21,0.6)' : 'none',
      }}
    >
      <span
        style={{
          width: 24,
          height: 24,
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: color,
          color: '#04121a',
          fontWeight: 800,
          fontSize: 13,
        }}
      >
        {letter}
      </span>
      <span style={{ color: '#fff', fontSize: 13.5, fontWeight: 600 }}>{name}</span>
      {won && <span style={{ fontSize: 13 }}>🏆</span>}
    </div>
  );
}
