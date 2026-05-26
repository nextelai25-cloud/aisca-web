import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AISCA Official Blazer Pin',
  description: 'Order the official AISCA Blazer Pin. Premium metal finish with AISCA emblem. Perfect for formal events and school blazers.',
  alternates: { canonical: 'https://aisca.lk/products/blazer-pin' }
}

export default function BlazerPinLayout({ children }: { children: React.ReactNode }) {
  return children
}
