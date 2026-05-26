import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become an Associate Member',
  description: 'Join AISCA as an Individual Associate Member. Connect with 2,000+ commerce students across Sri Lanka. Register now.',
  alternates: { canonical: 'https://aisca.lk/register/associate' }
}

export default function AssociateLayout({ children }: { children: React.ReactNode }) {
  return children
}
