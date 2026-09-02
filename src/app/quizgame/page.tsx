import QuizPlayer from './QuizPlayer'

export const metadata = {
  title: 'AISCA QuizGame',
  description: 'Join the live AISCA quiz.',
  robots: { index: false, follow: false },
}

export default function QuizGamePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <QuizPlayer />
    </>
  )
}
