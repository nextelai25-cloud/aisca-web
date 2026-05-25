import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AISCA Wristband Black Edition | AISCA Store',
  description: 'Order the official AISCA Wristband...'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
