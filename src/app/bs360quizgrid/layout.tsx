import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BS360 Quiz Grid',
  description: 'AISCA BS360 live quiz grid — internal event tool.',
  robots: { index: false, follow: false },
};

// Classroom pages are gated per-classroom (see c/[classroom]/layout.tsx).
// The landing page (classroom picker) and the public scoreboard are open.
export default function Bs360Layout({ children }: { children: React.ReactNode }) {
  return <div style={{ background: '#07070d', minHeight: '100vh' }}>{children}</div>;
}
