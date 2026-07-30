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
    <div className="min-h-screen px-6 py-14 md:py-20 relative overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(56,189,248,0.10), transparent 70%)',
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        <Link
          href="/bs360quizgrid"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-10"
          style={{ fontSize: '13px' }}
        >
          ← All classrooms
        </Link>

        <div className="text-center mb-14">
          <p
            className="uppercase mb-3"
            style={{ fontSize: '11px', letterSpacing: '0.3em', color: 'rgba(56,189,248,0.7)' }}
          >
            Classroom {String(classroom).padStart(2, '0')}
          </p>
          <h1
            className="font-bold text-white"
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}
          >
            Select a Grid
          </h1>
          <p className="text-white/40 text-sm mt-3">
            6 grids · 16 questions each · Easy → Super Hard
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-5">
          {BS360_GRIDS.map((grid) => {
            const content = (
              <div
                className="relative rounded-[20px] p-6 md:p-8 text-center transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${grid.available ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'}`,
                  opacity: grid.available ? 1 : 0.5,
                }}
              >
                <p
                  className="mb-2"
                  style={{ fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.3)' }}
                >
                  GRID
                </p>
                <p
                  className="font-bold text-white"
                  style={{ fontFamily: 'var(--font-display)', fontSize: '2rem' }}
                >
                  {String(grid.id).padStart(2, '0')}
                </p>
                {!grid.available && (
                  <p
                    className="mt-2"
                    style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)' }}
                  >
                    COMING SOON
                  </p>
                )}
              </div>
            );

            if (!grid.available) {
              return (
                <div key={grid.id} className="cursor-not-allowed select-none">
                  {content}
                </div>
              );
            }

            return (
              <Link key={grid.id} href={`/bs360quizgrid/c/${classroom}/g/${grid.id}`} className="group block">
                <div className="transition-transform duration-300 group-hover:-translate-y-1">
                  {content}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
