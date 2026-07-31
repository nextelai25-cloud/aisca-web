import Link from 'next/link';
import { CLASSROOMS } from '@/data/bs360-grids';
import LockButton from './LockButton';
import Bs360Background from './Bs360Background';

export default function Bs360Home() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Bs360Background />

      <div style={{ position: 'relative', maxWidth: 780, margin: '0 auto', padding: '64px 24px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }} className="bs360-fade-up">
          <img
            src="/bs360-logo.png"
            alt="BS360"
            style={{
              display: 'block',
              margin: '0 auto 22px',
              width: '100%',
              maxWidth: 130,
              height: 'auto',
              filter: 'drop-shadow(0 0 20px rgba(56,189,248,0.3))',
            }}
          />
          <p
            style={{
              textTransform: 'uppercase',
              marginBottom: 12,
              fontSize: 11,
              letterSpacing: '0.32em',
              color: '#7dd3fc',
              fontWeight: 600,
            }}
          >
            AISCA · Quiz Grid
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontSize: 'clamp(1.7rem, 5vw, 2.6rem)',
              marginBottom: 12,
              background: 'linear-gradient(180deg, #ffffff, rgba(255,255,255,0.6))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Select Your Classroom
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: 13.5, maxWidth: 420, margin: '0 auto', fontWeight: 300 }}>
            Each classroom plays independently — opening a box here never affects any other classroom.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: 16,
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
                    color: 'rgba(255,255,255,0.38)',
                    fontWeight: 600,
                  }}
                >
                  CLASSROOM
                </p>
                <p
                  className="bs360-tile-number"
                  style={{
                    fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
                    fontWeight: 800,
                    color: '#fff',
                    fontSize: '2rem',
                  }}
                >
                  {String(n).padStart(2, '0')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 52 }}>
          <LockButton />
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
        .bs360-tile {
          position: relative;
          border-radius: 20px;
          padding: 26px 16px;
          text-align: center;
          background: linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.02));
          border: 1px solid rgba(255,255,255,0.08);
          box-shadow: 0 10px 30px -18px rgba(0,0,0,0.6);
          transition: transform 0.35s cubic-bezier(.22,1,.36,1), border-color 0.35s, box-shadow 0.35s;
          animation: bs360-fade-up 0.55s cubic-bezier(.22,1,.36,1) both;
        }
        .bs360-tile:nth-child(1) { animation-delay: 0.03s; }
        .bs360-tile:nth-child(2) { animation-delay: 0.07s; }
        .bs360-tile:nth-child(3) { animation-delay: 0.11s; }
        .bs360-tile:nth-child(4) { animation-delay: 0.15s; }
        .bs360-tile:nth-child(5) { animation-delay: 0.19s; }
        .bs360-tile:nth-child(6) { animation-delay: 0.23s; }
        .bs360-tile:nth-child(7) { animation-delay: 0.27s; }
        .bs360-tile:nth-child(8) { animation-delay: 0.31s; }
        .bs360-tile:hover {
          transform: translateY(-6px);
          border-color: rgba(56,189,248,0.55);
          box-shadow: 0 20px 50px -16px rgba(56,189,248,0.45);
        }
        .bs360-tile:hover .bs360-tile-number {
          color: #7dd3fc;
        }
        .bs360-tile-number {
          transition: color 0.3s;
        }
      `}</style>
    </div>
  );
}
