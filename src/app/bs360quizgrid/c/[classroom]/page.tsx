import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BS360_GRIDS } from '@/data/bs360-grids';
import { teamsForClassroom, requiredMatchups } from '@/data/bs360-teams';
import Bs360Background from '../../Bs360Background';

export default async function ClassroomPage({
  params,
}: {
  params: Promise<{ classroom: string }>;
}) {
  const { classroom: classroomParam } = await params;
  const classroom = Number(classroomParam);

  if (!Number.isInteger(classroom) || classroom < 1 || classroom > 8) {
    notFound();
  }

  const teams = teamsForClassroom(classroom);
  const games = requiredMatchups(classroom);

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Bs360Background />

      <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto', padding: '48px 24px 64px' }}>
        <Link
          href="/bs360quizgrid"
          className="bs360-back-link"
          style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36 }}
        >
          ← All classrooms
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 40 }} className="bs360-fade-up">
          <p
            style={{
              textTransform: 'uppercase',
              marginBottom: 8,
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
              fontSize: 'clamp(1.5rem, 4.5vw, 2.3rem)',
              marginBottom: 10,
              background: 'linear-gradient(180deg, #ffffff, rgba(255,255,255,0.6))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Select a Grid
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13.5, fontWeight: 300 }}>
            {teams.length} teams · {games} matches to play · one grid per match
          </p>
        </div>

        {/* competing school teams in this classroom */}
        <div style={{ marginBottom: 34 }} className="bs360-fade-up">
          <p
            style={{
              textAlign: 'center',
              textTransform: 'uppercase',
              fontSize: 10.5,
              letterSpacing: '0.24em',
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 700,
              marginBottom: 14,
            }}
          >
            Competing Teams
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {teams.map((t) => (
              <div
                key={t}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 9,
                  padding: '9px 15px',
                  borderRadius: 999,
                  background: 'linear-gradient(180deg, rgba(56,189,248,0.12), rgba(99,102,241,0.06))',
                  border: '1px solid rgba(56,189,248,0.28)',
                }}
              >
                <span
                  style={{ display: 'inline-block', width: 7, height: 7, borderRadius: '50%', background: '#38bdf8' }}
                />
                <span style={{ color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: 500 }}>{t}</span>
              </div>
            ))}
          </div>
          <p
            style={{
              textAlign: 'center',
              marginTop: 16,
              fontSize: 12,
              color: 'rgba(255,255,255,0.4)',
              fontWeight: 300,
            }}
          >
            Open a grid to pick the two teams for that match.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
          }}
        >
          {BS360_GRIDS.map((grid) => {
            const tile = (
              <div className={grid.available ? 'bs360-tile' : 'bs360-tile bs360-tile-disabled'}>
                <p
                  style={{
                    marginBottom: 8,
                    fontSize: 10.5,
                    letterSpacing: '0.2em',
                    color: 'rgba(255,255,255,0.38)',
                    fontWeight: 600,
                  }}
                >
                  GRID
                </p>
                <p
                  className="bs360-tile-number"
                  style={{
                    fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '1.8rem',
                  }}
                >
                  {String(grid.id).padStart(2, '0')}
                </p>
                {!grid.available && (
                  <p
                    style={{
                      marginTop: 8,
                      fontSize: 10,
                      letterSpacing: '0.12em',
                      color: 'rgba(255,255,255,0.42)',
                      fontWeight: 600,
                    }}
                  >
                    COMING SOON
                  </p>
                )}
              </div>
            );

            if (!grid.available) {
              return (
                <div key={grid.id} style={{ cursor: 'not-allowed', userSelect: 'none' }}>
                  {tile}
                </div>
              );
            }

            return (
              <Link
                key={grid.id}
                href={`/bs360quizgrid/c/${classroom}/g/${grid.id}`}
                style={{ display: 'block', textDecoration: 'none' }}
              >
                {tile}
              </Link>
            );
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: 44 }}>
          <Link href="/bs360quizgrid/scoreboard" className="bs360-back-link" style={{ fontSize: 13 }}>
            View live scoreboard →
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes bs360-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .bs360-fade-up {
          animation: bs360-fade-up 0.6s cubic-bezier(.22,1,.36,1) both;
        }
        .bs360-back-link {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.25s;
        }
        .bs360-back-link:hover {
          color: #7dd3fc;
        }
        .bs360-tile {
          position: relative;
          border-radius: 18px;
          padding: 24px 14px;
          text-align: center;
          background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 10px 30px -18px rgba(0,0,0,0.6);
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), border-color 0.35s, box-shadow 0.35s;
          animation: bs360-fade-up 0.55s cubic-bezier(.22,1,.36,1) both;
        }
        .bs360-tile:nth-child(1) { animation-delay: 0.03s; }
        .bs360-tile:nth-child(2) { animation-delay: 0.08s; }
        .bs360-tile:nth-child(3) { animation-delay: 0.13s; }
        .bs360-tile:nth-child(4) { animation-delay: 0.18s; }
        .bs360-tile:nth-child(5) { animation-delay: 0.23s; }
        .bs360-tile:nth-child(6) { animation-delay: 0.28s; }
        .bs360-tile:hover {
          transform: translateY(-6px);
          border-color: rgba(56,189,248,0.55);
          box-shadow: 0 20px 50px -16px rgba(56,189,248,0.45);
        }
        .bs360-tile:hover .bs360-tile-number {
          color: #7dd3fc;
        }
        .bs360-tile-disabled {
          opacity: 0.42;
        }
        .bs360-tile-disabled:hover {
          transform: none;
          border-color: rgba(255,255,255,0.08);
          box-shadow: 0 10px 30px -18px rgba(0,0,0,0.6);
        }
        .bs360-tile-disabled:hover .bs360-tile-number {
          color: #fff;
        }
        .bs360-tile-number {
          transition: color 0.3s;
        }
      `}</style>
    </div>
  );
}
