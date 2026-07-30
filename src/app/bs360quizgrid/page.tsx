import Link from 'next/link';
import { CLASSROOMS } from '@/data/bs360-grids';
import LockButton from './LockButton';

export default function Bs360Home() {
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

      <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto', padding: '56px 24px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <img
            src="/bs360-logo.png"
            alt="BS360"
            style={{ display: 'block', margin: '0 auto 20px', width: '100%', maxWidth: 140, height: 'auto' }}
          />
          <p
            style={{
              textTransform: 'uppercase',
              marginBottom: 10,
              fontSize: 11,
              letterSpacing: '0.3em',
              color: 'rgba(56,189,248,0.75)',
              fontWeight: 600,
            }}
          >
            AISCA · Quiz Grid
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              fontWeight: 800,
              color: '#fff',
              fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
              marginBottom: 10,
            }}
          >
            Select Your Classroom
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, maxWidth: 420, margin: '0 auto' }}>
            Each classroom plays independently — opening a box here never affects any other classroom.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 14,
          }}
        >
          {CLASSROOMS.map((n) => (
            <Link key={n} href={`/bs360quizgrid/c/${n}`} style={{ display: 'block', textDecoration: 'none' }}>
              <div className="bs360-tile">
                <p
                  style={{
                    marginBottom: 8,
                    fontSize: 10.5,
                    letterSpacing: '0.2em',
                    color: 'rgba(255,255,255,0.35)',
                    fontWeight: 600,
                  }}
                >
                  CLASSROOM
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '1.9rem',
                  }}
                >
                  {String(n).padStart(2, '0')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <LockButton />
        </div>
      </div>

      <style>{`
        .bs360-tile {
          position: relative;
          border-radius: 16px;
          padding: 24px 16px;
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
        .bs360-tile:hover p:last-child {
          color: #7dd3fc;
        }
      `}</style>
    </div>
  );
}
