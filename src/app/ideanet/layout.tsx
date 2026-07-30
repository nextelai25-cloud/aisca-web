import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IdeaNet | Student Commerce Project Network | AISCA',
  description: 'Share, explore, and vote on student commerce project ideas. IdeaNet connects AISCA associate members across Sri Lanka to collaborate on innovative projects.',
  openGraph: {
    title: 'IdeaNet | AISCA',
    description: 'Sri Lanka\'s student commerce project idea network. Share, explore, and vote on project ideas.',
    url: 'https://aisca.lk/ideanet'
  }
}

export default function IdeaNetLayout({ children }: { children: React.ReactNode }) {
  return children
}
