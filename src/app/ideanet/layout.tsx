import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IdeaNet | Sri Lanka\'s Student Commerce Project Idea Network',
  description: 'Share, discover, and vote on student commerce project ideas. IdeaNet connects AISCA associates across Sri Lanka to collaborate and innovate together.',
  openGraph: {
    title: 'IdeaNet | AISCA',
    description: 'Sri Lanka\'s student commerce project idea network. Share and vote on project ideas.',
    url: 'https://aisca.lk/ideanet'
  }
}

export default function IdeaNetLayout({ children }: { children: React.ReactNode }) {
  return children
}
