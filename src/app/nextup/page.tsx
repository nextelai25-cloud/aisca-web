import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'NextUp | AISCA × Business Advisor Junior',
  description:
    "NEXTUP 01, The Young Founders Edition, is out now. Read the e-magazine featuring thirteen young Sri Lankan founders, or apply to be featured in NEXTUP 02.",
  alternates: { canonical: 'https://aisca.lk/nextup' },
  openGraph: {
    type: 'website',
    url: 'https://aisca.lk/nextup',
    title: 'NEXTUP | AISCA × Business Advisor Junior',
    description: 'NEXTUP 01, The Young Founders Edition, is out now. Applications for NEXTUP 02 are open.',
    images: [{ url: 'https://aisca.lk/nextup01/og.jpg', width: 1200, height: 630, alt: 'NEXTUP 01 The Young Founders Edition' }],
  },
}

const RED = '#e11d2a'
const DISPLAY = "'Anton', system-ui, sans-serif"

export default function NextUpPage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <main className="nu-main">
        <div className="nu-glow nu-glow-a" />
        <div className="nu-glow nu-glow-b" />

        <div className="nu-wrap">
          {/* Logos row */}
          <div className="nu-logos">
            <Link href="/"><img src="/nextup/aisca.webp" alt="AISCA" className="nu-aisca" /></Link>
            <img src="/nextup/ba-junior.webp" alt="Business Advisor Junior" className="nu-ba" />
          </div>

          <div className="nu-grid">
            {/* Copy */}
            <div className="nu-copy">
              <img src="/nextup/nextup.webp" alt="NextUp" className="nu-logo" />
              <p className="nu-tag">EMPOWERING SRI LANKA&apos;S YOUNGEST MINDS</p>

              <div className="nu-closed">
                <span className="nu-dot" />
                NEXTUP 01 applications are closed
              </div>

              <p className="nu-intro">
                Thank you to every young founder who applied and every person who referred someone. Thirteen founders made it into the first edition, and their stories are now live in <b>NEXTUP 01, The Young Founders Edition</b>. Read it, share it, and if you are already building something real, apply for NEXTUP 02.
              </p>

              <div className="nu-ctas">
                <Link href="/nextup01" className="nu-btn nu-btn-red">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z" /></svg>
                  <span>
                    <small>Out now</small>
                    Read The Young Founders Edition
                  </span>
                </Link>
                <Link href="/nextup02" className="nu-btn nu-btn-ghost">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></svg>
                  <span>
                    <small>Applications open</small>
                    Apply for NEXTUP 02
                  </span>
                </Link>
              </div>
            </div>

            {/* Magazine cover */}
            <Link href="/nextup01" className="nu-cover" aria-label="Read NEXTUP 01 The Young Founders Edition">
              <span className="nu-cover-back nu-cover-back-2"><img src="/nextup01/thumbs/21.webp" alt="" /></span>
              <span className="nu-cover-back nu-cover-back-1"><img src="/nextup01/thumbs/06.webp" alt="" /></span>
              <span className="nu-cover-front">
                <img src="/nextup01/pages/01.webp" alt="NEXTUP 01 The Young Founders Edition cover" />
                <span className="nu-cover-shine" />
              </span>
              <span className="nu-cover-cta">
                Open the magazine
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </span>
            </Link>
          </div>
        </div>

        <style>{`
          .nu-main { position: relative; min-height: 100vh; background: #08080a; color: #fff; font-family: 'Inter', system-ui, -apple-system, sans-serif; overflow: hidden; }
          .nu-glow { position: absolute; border-radius: 50%; filter: blur(30px); pointer-events: none; }
          .nu-glow-a { top: -120px; left: -120px; width: 620px; height: 620px; background: radial-gradient(circle, rgba(225,29,42,0.28), transparent 62%); }
          .nu-glow-b { top: 380px; right: -160px; width: 560px; height: 560px; background: radial-gradient(circle, rgba(225,29,42,0.14), transparent 62%); }
          .nu-wrap { position: relative; z-index: 2; max-width: 1120px; margin: 0 auto; padding: 28px 22px 90px; }
          .nu-logos { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 40px; }
          .nu-aisca { height: 44px !important; width: auto !important; display: block; }
          .nu-ba { height: 74px !important; width: auto !important; display: block; }
          .nu-grid { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 56px; align-items: center; }
          .nu-copy { min-width: 0; }
          .nu-logo { width: 100%; max-width: 340px; height: auto; display: block; margin: 0 0 18px; }
          .nu-closed { text-align: left; }
          .nu-tag { font-family: ${DISPLAY}; font-size: clamp(1.4rem, 3.2vw, 2.1rem); color: ${RED}; letter-spacing: 0.01em; margin: 0 0 22px; }
          .nu-closed { display: inline-flex; align-items: center; gap: 10px; padding: 10px 18px; border-radius: 999px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.16); font-size: 12.5px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.9); }
          .nu-dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,0.35); }
          .nu-intro { font-size: 15px; line-height: 1.8; color: rgba(255,255,255,0.7); max-width: 560px; margin: 22px 0 0; }
          .nu-intro b { color: #fff; font-weight: 600; }
          .nu-ctas { display: flex; flex-direction: column; gap: 12px; margin-top: 30px; max-width: 460px; }
          .nu-btn { position: relative; display: flex; align-items: center; gap: 16px; min-height: 66px; padding: 12px 22px; border-radius: 16px; text-decoration: none; color: #fff; font-size: 15px; font-weight: 800; letter-spacing: 0.03em; text-transform: uppercase; transition: transform .25s, filter .25s, border-color .25s, background .25s; overflow: hidden; }
          .nu-btn span { display: flex; flex-direction: column; line-height: 1.2; }
          .nu-btn small { font-size: 10.5px; letter-spacing: 0.2em; font-weight: 700; opacity: 0.75; margin-bottom: 4px; }
          .nu-btn::after { content: ''; position: absolute; right: 22px; top: 50%; width: 9px; height: 9px; margin-top: -5px; border-top: 2.5px solid currentColor; border-right: 2.5px solid currentColor; transform: rotate(45deg); transition: right .25s; }
          .nu-btn:hover::after { right: 16px; }
          .nu-btn-red { background: ${RED}; box-shadow: 0 16px 44px -14px rgba(225,29,42,0.75); }
          .nu-btn-red:hover { filter: brightness(1.1); transform: translateY(-2px); }
          .nu-btn-red::before { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 40%; background: linear-gradient(100deg, transparent, rgba(255,255,255,0.28), transparent); transform: skewX(-20deg); animation: nuShine 3.2s ease-in-out infinite; }
          @keyframes nuShine { 0%, 60% { left: -60%; } 100% { left: 130%; } }
          .nu-btn-ghost { background: rgba(255,255,255,0.03); border: 1.5px solid rgba(255,255,255,0.18); }
          .nu-btn-ghost:hover { border-color: ${RED}; background: rgba(225,29,42,0.1); transform: translateY(-2px); }

          .nu-cover { position: relative; display: block; width: 100%; max-width: 400px; justify-self: center; aspect-ratio: 1060 / 1500; perspective: 1400px; text-decoration: none; }
          .nu-cover-front, .nu-cover-back { position: absolute; inset: 0; border-radius: 6px; overflow: hidden; box-shadow: 0 40px 80px -30px rgba(0,0,0,0.95); }
          .nu-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .nu-cover-front { transform: rotateY(-14deg) rotateX(4deg); transform-origin: left center; transition: transform .6s cubic-bezier(.22,1,.36,1); box-shadow: 0 50px 90px -30px rgba(0,0,0,0.95), 0 0 70px -10px rgba(225,29,42,0.45); }
          .nu-cover-back-1 { transform: translate(-9%, 3%) rotate(-7deg) scale(.92); opacity: .55; transition: transform .6s cubic-bezier(.22,1,.36,1); }
          .nu-cover-back-2 { transform: translate(10%, 4%) rotate(7deg) scale(.9); opacity: .4; transition: transform .6s cubic-bezier(.22,1,.36,1); }
          .nu-cover:hover .nu-cover-front { transform: rotateY(-26deg) rotateX(3deg) translateX(-2%); }
          .nu-cover:hover .nu-cover-back-1 { transform: translate(-15%, 2%) rotate(-10deg) scale(.92); }
          .nu-cover:hover .nu-cover-back-2 { transform: translate(16%, 3%) rotate(10deg) scale(.9); }
          .nu-cover-shine { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.14) 48%, transparent 60%); pointer-events: none; }
          .nu-cover-cta { position: absolute; left: 50%; bottom: -54px; transform: translateX(-50%); display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; font-weight: 700; color: rgba(255,255,255,0.85); }
          .nu-cover-cta svg { animation: nuNudge 1.6s ease-in-out infinite; }
          @keyframes nuNudge { 0%,100% { transform: translateX(0); } 50% { transform: translateX(5px); } }

          @media (max-width: 860px) {
            .nu-grid { grid-template-columns: 1fr; gap: 40px; }
            .nu-copy { text-align: center; }
            .nu-logo { margin: 0 auto 18px; max-width: 280px; }
            .nu-intro { margin-left: auto; margin-right: auto; }
            .nu-ctas { margin-left: auto; margin-right: auto; text-align: left; }
            .nu-cover { width: min(250px, 66vw); margin-bottom: 60px; }
            .nu-cover-front { transform: rotateY(-8deg) rotateX(2deg); }
            .nu-logo { max-width: 240px !important; }
          }
          @media (max-width: 767px) {
            .nu-aisca { height: 28px !important; }
            .nu-ba { height: 52px !important; }
            .nu-intro { font-size: 13.5px; line-height: 1.7; }
            .nu-btn { font-size: 13.5px; min-height: 60px; }
            .nu-closed { font-size: 11px; padding: 9px 14px; }
          }
        `}</style>
      </main>
    </>
  )
}
