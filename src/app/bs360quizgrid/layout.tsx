import type { Metadata } from 'next';
import Bs360Gate from './Bs360Gate';

export const metadata: Metadata = {
  title: 'BS360 Quiz Grid',
  description: 'AISCA BS360 live quiz grid — internal event tool.',
  robots: { index: false, follow: false },
};

export default function Bs360Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: '#07070d', minHeight: '100vh' }}>
      <Bs360Gate>{children}</Bs360Gate>
    </div>
  );
}
