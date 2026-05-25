import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register Your School | AISCA',
  description: 'Register your school commerce society with AISCA.'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
