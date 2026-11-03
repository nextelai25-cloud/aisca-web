import type { Metadata } from 'next'
import MemoraClient from './MemoraClient'

// Render fresh on every visit so "sales closed" and the countdown start from the real time.
export const dynamic = 'force-dynamic'

const DESC = "MEMORA '26 by AISCA. The most awaited night of the year. Sunday 15th November 2026, 4.00 PM onwards at Rock House, Piliyandala. Tickets LKR 3,500."

export const metadata: Metadata = {
  title: "MEMORA '26 | A Day to Remember",
  description: DESC,
  alternates: { canonical: 'https://aisca.lk/memora26' },
  openGraph: {
    type: 'website',
    url: 'https://aisca.lk/memora26',
    title: "MEMORA '26 | A Day to Remember",
    description: 'The date is locked, the vibe is matched. 15th November, 4.00 PM onwards, Rock House, Piliyandala. Tickets LKR 3,500.',
    images: [{ url: 'https://aisca.lk/memora/og.jpg', width: 1200, height: 630, alt: "MEMORA '26 A Day to Remember" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "MEMORA '26 | A Day to Remember",
    description: 'The date is locked, the vibe is matched. 15th November, Rock House, Piliyandala.',
    images: ['https://aisca.lk/memora/og.jpg'],
  },
}

// Server clock for the first paint of the countdown (the page is rendered per request).
const serverClock = () => Date.now()

export default function MemoraPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,500;1,500&family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <MemoraClient serverNow={serverClock()} />
    </>
  )
}
