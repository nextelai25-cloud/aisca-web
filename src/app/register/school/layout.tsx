import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register Your School',
  description: 'Register your school\'s commerce society with AISCA. Join 80+ schools in Sri Lanka\'s largest student commerce network.',
  alternates: { canonical: 'https://aisca.lk/register/school' }
}

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return children
}
