'use client'

import { useState } from 'react'
import { MEMORA } from '@/lib/memora'

// The MEMORA '26 ticket, drawn on the official ticket artwork with the
// guest's QR code, name and ticket number inside the white panel.
// Positions are in artwork pixels (874 x 1743) and turned into percentages,
// so it looks the same on every screen. "Save ticket" paints the same
// layout onto a canvas so guests can keep a copy in their photos.

const W = 874
const H = 1743
const NAVY = '#0B1230'
const GOLD = '#C8902E'
const DISPLAY = "'Cinzel', Georgia, serif"
const BODY = "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"

// White panel on the artwork: x 200 to 667, y 1114 to 1544
const L = {
  cx: 433.5,
  qrX: 284, qrY: 1130, qrSize: 300,
  nameY: 1470, nameMaxW: 430,
  numY: 1514,
}

type Props = {
  state: 'valid' | 'used' | 'inactive' | 'missing'
  name?: string
  school?: string
  ticketNumber: string
  qr?: string
  usedAt?: string
  helpLabel: string
  helpNumber: string
}

const pct = (v: number, of: number) => `${(v / of) * 100}%`

export default function TicketView(p: Props) {
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  async function save() {
    if (!p.qr) return
    setSaving(true); setSaveError('')
    try {
      await (document as Document & { fonts?: FontFaceSet }).fonts?.ready
      const load = (src: string) => new Promise<HTMLImageElement>((res, rej) => {
        const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src
      })
      const [bg, qr] = await Promise.all([load('/memora/ticket-bg.webp'), load(p.qr)])
      const s = 2
      const c = document.createElement('canvas')
      c.width = W * s; c.height = H * s
      const g = c.getContext('2d')!
      g.scale(s, s)
      g.drawImage(bg, 0, 0, W, H)
      g.drawImage(qr, L.qrX, L.qrY, L.qrSize, L.qrSize)
      g.textAlign = 'center'; g.textBaseline = 'middle'
      const name = (p.name || '').toUpperCase()
      g.fillStyle = NAVY
      g.font = `700 ${fit(g, name, 30, L.nameMaxW)}px ${DISPLAY}`
      g.fillText(name, L.cx, L.nameY)
      g.fillStyle = GOLD
      g.font = `800 24px ui-monospace, 'SF Mono', Menlo, monospace`
      g.fillText(p.ticketNumber, L.cx, L.numY)
      const url = c.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url; a.download = `MEMORA26-${p.ticketNumber}.png`
      document.body.appendChild(a); a.click(); a.remove()
    } catch {
      setSaveError('Could not save the image. Take a screenshot of the ticket instead.')
    } finally {
      setSaving(false)
    }
  }

  const missing = p.state === 'missing' || p.state === 'inactive'
  const nameSize = Math.min(3.45, 76 / Math.max(1, (p.name || '').length))

  return (
    <main className="mt-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      <div className="mt-bg" aria-hidden />

      <div className="mt-wrap">
        {missing ? (
          <div className="mt-glass mt-msg">
            <img src="/memora/cover-square.webp" alt="MEMORA '26" className="mt-msg-art" />
            <h1>{p.state === 'missing' ? 'Ticket not found' : 'This ticket is not active'}</h1>
            <p>
              {p.state === 'missing'
                ? "This link does not match any MEMORA '26 ticket. Please open the link from your ticket email or SMS again."
                : `Please WhatsApp ${p.helpLabel} with your reference ${p.ticketNumber}.`}
            </p>
            <a className="mt-btn mt-btn-wa" href={`https://wa.me/${p.helpNumber}`}>Message us on WhatsApp</a>
          </div>
        ) : (
          <>
            <div className="mt-ticket" role="img" aria-label={`MEMORA '26 ticket for ${p.name}, ${p.ticketNumber}`}>
              <img src="/memora/ticket-bg.webp" alt="" className="mt-art" />
              <div className="mt-qr" style={{ left: pct(L.qrX, W), top: pct(L.qrY, H), width: pct(L.qrSize, W) }}>
                {p.qr && <img src={p.qr} alt={`QR code for ${p.ticketNumber}`} />}
                {p.state === 'used' && <span className="mt-used">USED</span>}
              </div>
              <div className="mt-name" style={{ top: pct(L.nameY, H), fontSize: `${nameSize}cqw` }}>{p.name}</div>
              <div className="mt-num" style={{ top: pct(L.numY, H) }}>{p.ticketNumber}</div>
            </div>

            {p.state === 'used' ? (
              <div className="mt-glass mt-info mt-info-used">This ticket was scanned at the entrance on {p.usedAt}. It cannot be used again.</div>
            ) : (
              <div className="mt-glass mt-info">
                Show this QR code at the entrance and bring your NIC. Turn your screen brightness up for a quicker scan. Please do not share this ticket, the first scan uses your entry.
              </div>
            )}

            <div className="mt-actions">
              {p.state === 'valid' && (
                <button type="button" onClick={save} disabled={saving} className="mt-btn mt-btn-main">
                  {saving ? 'Preparing...' : 'Save ticket to photos'}
                </button>
              )}
              {MEMORA.whatsappGroup && <a className="mt-btn mt-btn-wa" href={MEMORA.whatsappGroup} target="_blank" rel="noopener noreferrer">Join the WhatsApp group</a>}
            </div>
            {saveError && <p className="mt-err">{saveError}</p>}
            {p.school && <p className="mt-foot">{p.name} · {p.school}</p>}
            <p className="mt-foot">{MEMORA.dateLabel} · {MEMORA.timeLabel} · {MEMORA.venue}</p>
          </>
        )}
      </div>

      <style>{`
        .mt-root { position: relative; min-height: 100vh; overflow: hidden; background: #050817; font-family: ${BODY}; color: #C5CAE0; -webkit-font-smoothing: antialiased; }
        .mt-root a, .mt-root button { min-height: 0; }
        .mt-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background: radial-gradient(90% 50% at 50% 105%, rgba(255,140,40,0.28), transparent 70%), radial-gradient(60% 40% at 50% 0%, rgba(60,90,200,0.25), transparent 70%), linear-gradient(180deg, #03050F, #0A1033 55%, #120C10); }
        .mt-wrap { position: relative; z-index: 1; max-width: 430px; margin: 0 auto; padding: 22px 16px 40px; }

        .mt-ticket { position: relative; width: 100%; aspect-ratio: ${W} / ${H}; container-type: inline-size; filter: drop-shadow(0 26px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 40px rgba(242,170,70,0.15)); }
        .mt-root img.mt-art { position: absolute; inset: 0; width: 100% !important; height: 100% !important; max-width: none !important; display: block; }
        .mt-qr { position: absolute; aspect-ratio: 1; }
        .mt-root .mt-qr img { display: block; width: 100% !important; height: 100% !important; max-width: none !important; image-rendering: pixelated; }
        .mt-used { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: ${DISPLAY}; font-weight: 700; font-size: 8cqw; color: #DC2626; background: rgba(255,255,255,0.75); letter-spacing: .08em; transform: rotate(-12deg); }
        .mt-name, .mt-num { position: absolute; left: 24%; right: 24%; transform: translateY(-50%); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .mt-name { font-family: ${DISPLAY}; font-weight: 700; color: ${NAVY}; text-transform: uppercase; letter-spacing: .02em; line-height: 1.1; }
        .mt-num { font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-weight: 800; font-size: 2.75cqw; color: ${GOLD}; }

        .mt-glass { background: linear-gradient(160deg, rgba(22,30,68,0.7), rgba(10,14,36,0.6)); border: 1px solid rgba(255,255,255,0.1); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); border-radius: 22px; }
        .mt-info { margin-top: 18px; padding: 14px 16px; font-size: 14px; line-height: 1.6; color: #C5CAE0; text-align: center; }
        .mt-info-used { color: #FCA5A5; font-weight: 600; }
        .mt-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
        .mt-btn { display: flex; align-items: center; justify-content: center; height: 52px; border-radius: 999px; font-size: 15px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; }
        .mt-btn:active { transform: scale(.98); }
        .mt-btn:disabled { opacity: .6; }
        .mt-btn-main { color: #1A1206; background: linear-gradient(100deg, #FFE3A1, #F2C14E 45%, #C8902E); box-shadow: 0 14px 30px -12px rgba(242,193,78,0.6); font-family: ${DISPLAY}; letter-spacing: .05em; }
        .mt-btn-wa { color: #fff; background: #25D366; }
        .mt-err { text-align: center; color: #FCA5A5; font-size: 13px; margin-top: 10px; }
        .mt-foot { text-align: center; font-size: 12.5px; color: #8C94B8; margin-top: 14px; }
        .mt-msg { margin-top: 8vh; padding: 22px 20px 26px; text-align: center; }
        .mt-root img.mt-msg-art { width: 100% !important; height: auto !important; border-radius: 16px; display: block; margin-bottom: 14px; }
        .mt-msg h1 { font-family: ${DISPLAY}; font-weight: 700; font-size: 22px; margin: 6px 0 8px; color: #F4F1E8; }
        .mt-msg p { font-size: 14.5px; line-height: 1.6; margin: 0 0 18px; }
      `}</style>
    </main>
  )
}

function fit(g: CanvasRenderingContext2D, text: string, size: number, maxW: number): number {
  let s = size
  g.font = `700 ${s}px ${DISPLAY}`
  while (s > 16 && g.measureText(text).width > maxW) { s -= 1; g.font = `700 ${s}px ${DISPLAY}` }
  return s
}
