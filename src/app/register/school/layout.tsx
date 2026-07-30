import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register Your School Commerce Society | AISCA',
  description: 'Affiliate your school\'s commerce society with AISCA. Join 80+ schools across all 25 educational districts of Sri Lanka.',
  alternates: { canonical: 'https://aisca.lk/register/school' }
}

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return children
}
