import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become an Associate | AISCA',
  description: 'Join the All Island Schools Commerce Association as an Individual Associate Member.'
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
