import QuizHost from './QuizHost'

export const metadata = {
  title: 'AISCA QuizGame · Host',
  robots: { index: false, follow: false },
}

export default function QuizGameHostPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <QuizHost />
    </>
  )
}
