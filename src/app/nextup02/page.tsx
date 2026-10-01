import type { Metadata } from 'next'
import NextUpForm from './NextUpForm'

export const metadata: Metadata = {
  title: 'Apply for NEXTUP 02 | AISCA × Business Advisor Junior',
  description:
    "Applications are open for NEXTUP 02. A national initiative by AISCA in partnership with Business Advisor Junior, spotlighting Sri Lanka's boldest young entrepreneurs, changemakers, and innovators. Apply to be featured.",
  alternates: { canonical: 'https://aisca.lk/nextup02' },
  openGraph: {
    type: 'website',
    url: 'https://aisca.lk/nextup02',
    title: 'Apply for NEXTUP 02',
    description: 'Already building something real? Apply to be featured in NEXTUP 02 by AISCA × Business Advisor Junior.',
    images: [{ url: 'https://aisca.lk/nextup01/og.jpg', width: 1200, height: 630, alt: 'NEXTUP by AISCA × Business Advisor Junior' }],
  },
}

export default function NextUp02Page() {
  return (
    <>
      {/* Poster-style heading font, loaded only for this page */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <NextUpForm edition="02" />
    </>
  )
}
