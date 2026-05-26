import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AISCA Official Wristband',
  description: 'Order the official AISCA Wristband. Show your membership pride with the premium silicone wristband.',
  alternates: { canonical: 'https://aisca.lk/products/wristband' }
}

export default function WristbandLayout({ children }: { children: React.ReactNode }) {
  return children
}
