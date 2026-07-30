import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become an Associate Member | AISCA',
  description: 'Register as an individual Associate Member. Connect with 2,000+ commerce students across Sri Lanka\'s 25 educational districts.',
  alternates: { canonical: 'https://aisca.lk/register/associate' }
}

export default function AssociateLayout({ children }: { children: React.ReactNode }) {
  return children
}
