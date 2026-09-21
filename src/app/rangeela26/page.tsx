import type { Metadata } from 'next'
import RangeelaClient from './RangeelaClient'

export const metadata: Metadata = {
  title: "RANGEELA '26 | A Celebration of Hues",
  description:
    "RANGEELA '26 by AISCA. One canvas, a thousand hues. Saturday 17th October 2026, 3.00 PM onwards at Hyde Park Grounds. Tickets LKR 1,200. Get yours online with a bank transfer.",
  alternates: { canonical: 'https://aisca.lk/rangeela26' },
  openGraph: {
    type: 'website',
    url: 'https://aisca.lk/rangeela26',
    title: "RANGEELA '26 | A Celebration of Hues",
    description: 'The colours are calling. 17th October, Hyde Park Grounds, 3.00 PM onwards. Tickets LKR 1,200.',
    images: [{ url: 'https://aisca.lk/rangeela/og.jpg', width: 1200, height: 630, alt: "RANGEELA '26 A Celebration of Hues" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "RANGEELA '26 | A Celebration of Hues",
    description: 'The colours are calling. 17th October, Hyde Park Grounds. Tickets LKR 1,200.',
    images: ['https://aisca.lk/rangeela/og.jpg'],
  },
}

export default function RangeelaPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <RangeelaClient />
    </>
  )
}
