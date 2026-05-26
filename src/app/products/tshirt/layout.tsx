import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AISCA Official T-Shirt Black Edition',
  description: 'Order the official AISCA T-Shirt. Premium heavyweight cotton blend with embroidered AISCA crest. Sizes XS-XXXL. Pre-order available.',
  alternates: { canonical: 'https://aisca.lk/products/tshirt' }
}

export default function TshirtLayout({ children }: { children: React.ReactNode }) {
  return children
}
