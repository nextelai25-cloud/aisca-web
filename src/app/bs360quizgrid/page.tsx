import Link from 'next/link';
import { CLASSROOMS } from '@/data/bs360-grids';
import LockButton from './LockButton';

export default function Bs360Home() {
  return (
    <div className="min-h-screen px-6 py-16 md:py-20 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(56,189,248,0.10), transparent 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <img
            src="/bs360-logo.png"
            alt="BS360"
            className="mx-auto mb-6 w-full max-w-[160px] h-auto"
          />
          <p
            className="uppercase mb-3"
            style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'rgba(56,189,248,0.7)' }}
          >
            AISCA · Quiz Grid
          </p>
          <h1
            className="font-bold text-white"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}
          >
            Select Your Classroom
          </h1>
          <p className="text-white/40 text-sm mt-3 max-w-md mx-auto">
            Each classroom plays independently — opening a box here never affects any other classroom.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
          {CLASSROOMS.map((n) => (
            <Link key={n} href={`/bs360quizgrid/c/${n}`} className="group block">
              <div
                className="relative rounded-[20px] p-6 md:p-8 text-center transition-all duration-300 group-hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div
                  className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ boxShadow: '0 0 40px -8px rgba(56,189,248,0.5)' }}
                />
                <p
                  className="mb-2"
                  style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}
                >
                  CLASSROOM
                </p>
                <p
                  className="font-bold text-white group-hover:text-[#7dd3fc] transition-colors"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '2.25rem' }}
                >
                  {String(n).padStart(2, '0')}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-16">
          <LockButton />
        </div>
      </div>
    </div>
  );
}
