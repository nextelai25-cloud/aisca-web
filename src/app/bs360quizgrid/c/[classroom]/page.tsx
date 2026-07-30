import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BS360_GRIDS } from '@/data/bs360-grids';

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

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div
        style={{
          pointerEvents: 'none',
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(56,189,248,0.10), transparent 70%)',
        }}
      />

      <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto', padding: '48px 24px 64px' }}>
        <Link
          href="/bs360quizgrid"
          className="bs360-back-link"
          style={{ fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 36 }}
        >
          ← All classrooms
        </Link>

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p
            style={{
              textTransform: 'uppercase',
              marginBottom: 8,
              fontSize: 11,
              letterSpacing: '0.3em',
              color: 'rgba(56,189,248,0.75)',
              fontWeight: 600,
            }}
          >
            Classroom {String(classroom).padStart(2, '0')}
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              fontWeight: 800,
              color: '#fff',
              fontSize: 'clamp(1.5rem, 4.5vw, 2.2rem)',
              marginBottom: 10,
            }}
          >
            Select a Grid
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13.5 }}>
            6 grids · 16 questions each · Easy → Super Hard
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 14,
          }}
        >
          {BS360_GRIDS.map((grid) => {
            const tile = (
              <div
                className={grid.available ? 'bs360-tile' : 'bs360-tile bs360-tile-disabled'}
              >
                <p
                  style={{
                    marginBottom: 8,
                    fontSize: 10.5,
                    letterSpacing: '0.2em',
                    color: 'rgba(255,255,255,0.35)',
                    fontWeight: 600,
                  }}
                >
                  GRID
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '1.7rem',
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
                      color: 'rgba(255,255,255,0.4)',
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
      </div>

      <style>{`
        .bs360-back-link {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
          transition: color 0.2s;
        }
        .bs360-back-link:hover {
          color: rgba(255,255,255,0.8);
        }
        .bs360-tile {
          position: relative;
          border-radius: 16px;
          padding: 22px 14px;
          text-align: center;
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(255,255,255,0.08);
          transition: transform 0.25s cubic-bezier(.22,1,.36,1), border-color 0.25s, box-shadow 0.25s;
        }
        .bs360-tile:hover {
          transform: translateY(-4px);
          border-color: rgba(56,189,248,0.5);
          box-shadow: 0 10px 40px -12px rgba(56,189,248,0.4);
        }
        .bs360-tile-disabled {
          opacity: 0.45;
        }
        .bs360-tile-disabled:hover {
          transform: none;
          border-color: rgba(255,255,255,0.08);
          box-shadow: none;
        }
      `}</style>
    </div>
  );
}
