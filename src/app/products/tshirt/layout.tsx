import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AISCA Official T-Shirt Black Edition | AISCA Store',
  description: 'Order the official AISCA T-Shirt...'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
