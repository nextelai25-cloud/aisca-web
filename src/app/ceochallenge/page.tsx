import type { Metadata } from 'next'
import CeoChallenge from './CeoChallenge'
import './ceo.css'

export const metadata: Metadata = {
  title: 'CEO Challenge | COMMERCE 360°',
  description:
    'Five businesses are about to fail. Pick one, make 15 decisions as its CEO, and build the most valuable company in the AISCA CEO Challenge, part of COMMERCE 360°.',
  alternates: { canonical: 'https://aisca.lk/ceochallenge' },
  openGraph: {
    type: 'website',
    url: 'https://aisca.lk/ceochallenge',
    title: 'CEO Challenge | COMMERCE 360°',
    description: 'Five businesses are about to fail. Pick one. Make 15 decisions. Build the most valuable company.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CEO Challenge | COMMERCE 360°',
    description: 'Five businesses are about to fail. Pick one. Make 15 decisions. Build the most valuable company.',
  },
}

export default function CeoChallengePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
      <CeoChallenge />
    </>
  )
}
