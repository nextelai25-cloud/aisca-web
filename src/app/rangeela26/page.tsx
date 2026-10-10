import type { Metadata } from 'next'
import RangeelaClient from './RangeelaClient'
import { getRangeelaPrices } from '@/lib/rangeela-prices'

// The price is set live by the chairman in the admin dashboard, so render this page fresh on every visit.
export const dynamic = 'force-dynamic'

const lkr = (n: number) => `LKR ${n.toLocaleString('en-US')}`

export async function generateMetadata(): Promise<Metadata> {
  const p = await getRangeelaPrices()
  const priceLine = `Tickets ${lkr(p.standard)} online, ${lkr(p.gate)} at the gate.`
  return {
  title: "RANGEELA '26 | A Celebration of Hues",
  description:
    `RANGEELA '26 by AISCA. One canvas, a thousand hues. Saturday 17th October 2026, 2.00 PM onwards at Nawinna Grounds, Maharagama. ${priceLine}`,
  alternates: { canonical: 'https://aisca.lk/rangeela26' },
  openGraph: {
    type: 'website',
    url: 'https://aisca.lk/rangeela26',
    title: "RANGEELA '26 | A Celebration of Hues",
    description: `The colours are calling. 17th October, Nawinna Grounds, Maharagama, 2.00 PM onwards. ${priceLine}`,
    images: [{ url: 'https://aisca.lk/rangeela/og.jpg', width: 1200, height: 630, alt: "RANGEELA '26 A Celebration of Hues" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "RANGEELA '26 | A Celebration of Hues",
    description: `The colours are calling. 17th October, Nawinna Grounds, Maharagama. ${priceLine}`,
    images: ['https://aisca.lk/rangeela/og.jpg'],
  },
  }
}

export default async function RangeelaPage() {
  const prices = await getRangeelaPrices()
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <RangeelaClient serverNow={Date.now()} prices={prices} />
    </>
  )
}
