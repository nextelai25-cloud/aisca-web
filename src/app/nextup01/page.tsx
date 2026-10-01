import type { Metadata } from 'next'
import Link from 'next/link'
import MagazineReader from './MagazineReader'

export const metadata: Metadata = {
  title: 'NEXTUP 01 | The Young Founders Edition',
  description:
    "Read NEXTUP 01, The Young Founders Edition: an AISCA × Business Advisor Junior e-magazine telling the real stories of thirteen young founders building Sri Lanka.",
  alternates: { canonical: 'https://aisca.lk/nextup01' },
  openGraph: {
    type: 'article',
    url: 'https://aisca.lk/nextup01',
    title: 'NEXTUP 01 | The Young Founders Edition',
    description: 'Real stories. Bold ideas. Young leaders building Sri Lanka. Read the e-magazine.',
    images: [{ url: 'https://aisca.lk/nextup01/og.jpg', width: 1200, height: 630, alt: 'NEXTUP 01 The Young Founders Edition' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NEXTUP 01 | The Young Founders Edition',
    description: 'Real stories. Bold ideas. Young leaders building Sri Lanka.',
    images: ['https://aisca.lk/nextup01/og.jpg'],
  },
}

const RED = '#e11d2a'

export default function NextUp01Page() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      <link rel="preload" as="image" href="/nextup01/pages/01.webp" />

      <main className="n1-main">
        <div className="n1-glow n1-glow-a" />
        <div className="n1-glow n1-glow-b" />

        {/* top bar */}
        <header className="n1-top">
          <Link href="/nextup" className="n1-back" aria-label="Back to NEXTUP">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            <img src="/nextup/aisca.webp" alt="AISCA" className="n1-aisca" />
          </Link>
          <div className="n1-title">
            <span className="n1-eyebrow">The Young Founders Edition</span>
            <span className="n1-name">NEXT<span style={{ color: RED }}>UP</span> 01</span>
          </div>
          <Link href="/nextup02" className="n1-apply">
            <span className="n1-apply-long">Apply for NEXTUP 02</span>
            <span className="n1-apply-short">Apply 02</span>
          </Link>
        </header>

        <MagazineReader />

        {/* after the magazine */}
        <div className="n1-after">
          <span className="n1-eyebrow" style={{ display: 'block', textAlign: 'center' }}>The next edition is open</span>
          <h2 className="n1-h2">Are you <span style={{ color: RED }}>NEXTUP 02?</span></h2>
          <p className="n1-p">
            If you are already building something real, a business, a project or a venture, we want to hear your story. Apply for yourself, or refer a young founder who deserves the spotlight.
          </p>
          <div className="n1-ctas">
            <Link href="/nextup02" className="n1-btn n1-btn-red">Apply for NEXTUP 02</Link>
            <Link href="/" className="n1-btn n1-btn-ghost">Back to aisca.lk</Link>
          </div>
          <div className="n1-logos">
            <img src="/nextup/aisca.webp" alt="AISCA" className="n1-logo-a" />
            <span className="n1-x">×</span>
            <img src="/nextup/ba-junior.webp" alt="Business Advisor Junior" className="n1-logo-b" />
          </div>
        </div>

        <style>{`
          .n1-main { position: relative; min-height: 100vh; background: #08080a; color: #fff; font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
          .n1-glow { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(30px); }
          .n1-glow-a { top: -160px; left: -160px; width: 640px; height: 640px; background: radial-gradient(circle, rgba(225,29,42,0.24), transparent 62%); }
          .n1-glow-b { top: 30vh; right: -220px; width: 620px; height: 620px; background: radial-gradient(circle, rgba(225,29,42,0.12), transparent 62%); }
          .n1-top { position: relative; z-index: 10; height: 76px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; padding: 0 22px; border-bottom: 1px solid rgba(255,255,255,0.06); }
          .n1-back { display: inline-flex; align-items: center; gap: 10px; color: rgba(255,255,255,0.7); text-decoration: none; justify-self: start; }
          .n1-back:hover { color: #fff; }
          .n1-aisca { height: 26px !important; width: auto !important; }
          .n1-logo-a { height: 30px !important; width: auto !important; }
          .n1-logo-b { height: 54px !important; width: auto !important; }
          .n1-title { display: flex; flex-direction: column; align-items: center; line-height: 1; }
          .n1-eyebrow { font-size: 10px; letter-spacing: 0.26em; text-transform: uppercase; color: ${RED}; font-weight: 700; margin-bottom: 6px; }
          .n1-name { font-family: 'Anton', system-ui, sans-serif; font-size: 26px; letter-spacing: 0.03em; }
          .n1-apply { min-height: 0; white-space: nowrap; justify-self: end; display: inline-flex; align-items: center; height: 38px; padding: 0 16px; border-radius: 999px; background: ${RED}; color: #fff; text-decoration: none; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; transition: filter .2s, transform .2s; }
          .n1-apply:hover { filter: brightness(1.1); transform: translateY(-1px); }
          .n1-apply-short { display: none; }
          .n1-after { position: relative; z-index: 2; max-width: 760px; margin: 0 auto; padding: 80px 22px 90px; text-align: center; }
          .n1-h2 { font-family: 'Anton', system-ui, sans-serif; font-weight: 400; font-size: clamp(2.4rem, 7vw, 4.2rem); line-height: 1; text-transform: uppercase; margin: 0 0 18px; }
          .n1-p { font-size: 15px; line-height: 1.75; color: rgba(255,255,255,0.68); max-width: 580px; margin: 0 auto; }
          .n1-ctas { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 30px; }
          .n1-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 0 26px; border-radius: 14px; font-size: 14px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; text-decoration: none; transition: filter .2s, transform .2s, border-color .2s; }
          .n1-btn-red { background: ${RED}; color: #fff; box-shadow: 0 12px 40px -12px rgba(225,29,42,0.7); }
          .n1-btn-red:hover { filter: brightness(1.1); transform: translateY(-2px); }
          .n1-btn-ghost { color: #fff; border: 1.5px solid rgba(255,255,255,0.2); }
          .n1-btn-ghost:hover { border-color: #fff; }
          .n1-logos { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 48px; opacity: 0.85; }
          .n1-logos img { width: auto; }
          .n1-x { color: rgba(255,255,255,0.4); font-size: 18px; }
          @media (max-height: 520px) and (min-width: 720px) {
            .n1-top { height: 52px; }
            .n1-eyebrow { display: none; }
            .n1-name { font-size: 20px; }
          }
          @media (max-width: 719px) {
            .n1-top { height: 64px; padding: 0 14px; grid-template-columns: auto 1fr auto; gap: 10px; }
            .n1-back { gap: 6px; }
            .n1-aisca { height: 16px !important; }
            .n1-eyebrow { font-size: 7.5px; letter-spacing: 0.14em; margin-bottom: 4px; white-space: nowrap; }
            .n1-name { font-size: 21px; }
            .n1-apply { height: 34px; padding: 0 12px; font-size: 11px; }
            .n1-apply-long { display: none; }
            .n1-apply-short { display: inline; }
            .n1-after { padding: 60px 20px 70px; }
          }
        `}</style>
      </main>
    </>
  )
}
