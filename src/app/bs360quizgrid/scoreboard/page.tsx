'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Bs360Background from '../Bs360Background';

interface Standing {
  team: string;
  played: number;
  won: number;
  lost: number;
  points: number;
}
interface MatchRow {
  grid: number;
  teamA: string;
  teamB: string;
  winner: string | null;
}
interface ClassroomBoard {
  classroom: number;
  teams: string[];
  standings: Standing[];
  matches: MatchRow[];
  requiredGames: number;
  decidedGames: number;
  complete: boolean;
  champion: string | null;
}

const POLL_MS = 6000;

export default function ScoreboardPage() {
  const [boards, setBoards] = useState<ClassroomBoard[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const fetchBoard = useCallback(async () => {
    try {
      const res = await fetch('/api/bs360/scoreboard', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      setBoards(data.classrooms || []);
      setUpdatedAt(data.updatedAt || null);
    } catch {
      // silent retry on next poll
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchBoard]);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Bs360Background />

      <div style={{ position: 'relative', maxWidth: 1080, margin: '0 auto', padding: '40px 18px 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <img
            src="/bs360-logo.png"
            alt="BS360"
            style={{ display: 'block', margin: '0 auto 16px', width: '100%', maxWidth: 110, height: 'auto', filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.3))' }}
          />
          <p style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.32em', color: '#7dd3fc', fontWeight: 600, marginBottom: 8 }}>
            Live Scoreboard
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(1.7rem, 5vw, 2.6rem)',
              background: 'linear-gradient(180deg, #ffffff, rgba(255,255,255,0.6))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            BS360 Standings
          </h1>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399', animation: 'bs360-pulse 1.6s ease-in-out infinite' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12.5 }}>
              Live · updates automatically{updatedAt ? ` · ${new Date(updatedAt).toLocaleTimeString()}` : ''}
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Link href="/bs360quizgrid" className="bs360-back-link" style={{ fontSize: 13 }}>
            ← Back to quiz grid
          </Link>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.12)', borderTopColor: '#38bdf8', animation: 'bs360-spin 0.7s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {boards.map((b, i) => (
              <ClassroomCard key={b.classroom} board={b} delay={i * 0.05} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes bs360-spin { to { transform: rotate(360deg); } }
        @keyframes bs360-pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        .bs360-back-link { color: rgba(255,255,255,0.45); text-decoration: none; transition: color 0.25s; }
        .bs360-back-link:hover { color: #7dd3fc; }
      `}</style>
    </div>
  );
}

function ClassroomCard({ board, delay }: { board: ClassroomBoard; delay: number }) {
  const progress = board.requiredGames > 0 ? Math.min(1, board.decidedGames / board.requiredGames) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        borderRadius: 20,
        padding: '20px 18px',
        background: 'linear-gradient(180deg, rgba(23,37,84,0.55), rgba(10,14,30,0.75))',
        border: '1px solid rgba(56,189,248,0.18)',
        boxShadow: '0 20px 60px -30px rgba(0,0,0,0.8)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
            fontWeight: 800,
            fontSize: 18,
            color: '#fff',
          }}
        >
          Classroom {String(board.classroom).padStart(2, '0')}
        </h2>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            letterSpacing: '0.06em',
            padding: '4px 10px',
            borderRadius: 999,
            textTransform: 'uppercase',
            color: board.complete ? '#04121a' : '#7dd3fc',
            background: board.complete ? '#facc15' : 'rgba(56,189,248,0.15)',
            border: board.complete ? 'none' : '1px solid rgba(56,189,248,0.3)',
          }}
        >
          {board.complete ? 'Complete' : 'In progress'}
        </span>
      </div>

      <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>
        {board.decidedGames} / {board.requiredGames} matches decided
      </p>

      {/* progress bar */}
      <div style={{ height: 5, borderRadius: 999, background: 'rgba(255,255,255,0.08)', marginBottom: 16, overflow: 'hidden' }}>
        <div style={{ width: `${progress * 100}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #38bdf8, #6366f1)', transition: 'width 0.6s' }} />
      </div>

      {board.champion && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 14,
            padding: '9px 13px',
            borderRadius: 12,
            background: 'linear-gradient(180deg, rgba(250,204,21,0.16), rgba(250,204,21,0.04))',
            border: '1px solid rgba(250,204,21,0.4)',
          }}
        >
          <span style={{ fontSize: 15 }}>🏆</span>
          <span style={{ color: '#fde68a', fontSize: 13, fontWeight: 700 }}>{board.champion}</span>
        </div>
      )}

      {/* standings table */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '22px 1fr 26px 26px 26px 32px', gap: 4, padding: '0 4px 8px', fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.04em' }}>
          <span>#</span>
          <span>TEAM</span>
          <span style={{ textAlign: 'center' }}>P</span>
          <span style={{ textAlign: 'center' }}>W</span>
          <span style={{ textAlign: 'center' }}>L</span>
          <span style={{ textAlign: 'center' }}>PTS</span>
        </div>
        {board.standings.map((s, idx) => {
          const isLeader = idx === 0 && s.won > 0;
          return (
            <div
              key={s.team}
              style={{
                display: 'grid',
                gridTemplateColumns: '22px 1fr 26px 26px 26px 32px',
                gap: 4,
                alignItems: 'center',
                padding: '9px 4px',
                borderRadius: 9,
                background: isLeader ? 'rgba(250,204,21,0.08)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: isLeader ? '#facc15' : 'rgba(255,255,255,0.5)' }}>
                {idx + 1}
              </span>
              <span style={{ fontSize: 12.5, color: '#fff', fontWeight: isLeader ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.team}
              </span>
              <span style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{s.played}</span>
              <span style={{ textAlign: 'center', fontSize: 12, color: '#34d399', fontWeight: 700 }}>{s.won}</span>
              <span style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{s.lost}</span>
              <span style={{ textAlign: 'center', fontSize: 12.5, color: '#fff', fontWeight: 800 }}>{s.points}</span>
            </div>
          );
        })}
      </div>

      {/* match results */}
      <p style={{ fontSize: 10, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 8 }}>
        MATCHES
      </p>
      {board.matches.length === 0 ? (
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>No matches started yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {board.matches.map((m) => (
            <div
              key={m.grid}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 11px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                fontSize: 11.5,
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 700, fontSize: 10 }}>
                G{String(m.grid).padStart(2, '0')}
              </span>
              <span style={{ flex: 1, textAlign: 'right', color: m.winner === m.teamA ? '#34d399' : 'rgba(255,255,255,0.75)', fontWeight: m.winner === m.teamA ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.winner === m.teamA && '✓ '}{m.teamA}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700 }}>vs</span>
              <span style={{ flex: 1, color: m.winner === m.teamB ? '#34d399' : 'rgba(255,255,255,0.75)', fontWeight: m.winner === m.teamB ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {m.teamB}{m.winner === m.teamB && ' ✓'}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
