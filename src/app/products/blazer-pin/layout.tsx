import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AISCA Gold Blazer Pin | AISCA Store',
  description: 'Order the official AISCA Gold Blazer Pin...'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
