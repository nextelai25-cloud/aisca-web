'use client'

import { useState } from 'react'

// The RANGEELA '26 ticket, drawn on the official ticket artwork with the
// student's own QR code, name and ticket number in the empty space.
// Positions are percentages of the artwork (802 x 1564) so it looks the
// same on every screen, and "Save ticket" paints the same layout onto a
// canvas so students can keep a copy in their photos.

const W = 802
const H = 1564
const INK = '#241628'
const ORANGE = '#D9480F'
const VIOLET = '#7B2FF7'
const DISPLAY = "'Baloo 2', 'Inter', system-ui, sans-serif"
const BODY = "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"

// Layout on the artwork, in artwork pixels
const L = {
  nameY: 948,
  schoolY: 992,
  qrX: 214, qrY: 1020, qrSize: 374, qrPad: 20,
  pillY: 1432,
  noteY: 1482,
}

type Props = {
  state: 'valid' | 'used' | 'inactive' | 'missing'
  name?: string
  school?: string
  ticketNumber: string
  nic?: string
  qr?: string
  usedAt?: string
  helpLabel: string
  helpNumber: string
  whatsappGroup: string
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
      const [bg, qr] = await Promise.all([load('/rangeela/ticket-bg.webp'), load(p.qr)])
      const s = 2
      const c = document.createElement('canvas')
      c.width = W * s; c.height = H * s
      const g = c.getContext('2d')!
      g.scale(s, s)
      g.fillStyle = '#FFF6F1'
      g.fillRect(0, 0, W, H)
      g.drawImage(bg, 0, 0, W, H)
      g.textAlign = 'center'; g.textBaseline = 'middle'
      g.fillStyle = ORANGE
      g.font = `800 ${fit(g, (p.name || '').toUpperCase(), 44, 620)}px ${DISPLAY}`
      g.fillText((p.name || '').toUpperCase(), W / 2, L.nameY)
      g.fillStyle = INK; g.globalAlpha = 0.72
      g.font = `600 21px ${BODY}`
      g.fillText(clip(p.school || '', 48), W / 2, L.schoolY)
      g.globalAlpha = 1
      // QR card
      g.shadowColor = 'rgba(60,20,80,0.22)'; g.shadowBlur = 24; g.shadowOffsetY = 8
      g.fillStyle = '#FFFFFF'
      round(g, L.qrX, L.qrY, L.qrSize, L.qrSize, 26); g.fill()
      g.shadowColor = 'transparent'
      g.drawImage(qr, L.qrX + L.qrPad, L.qrY + L.qrPad, L.qrSize - L.qrPad * 2, L.qrSize - L.qrPad * 2)
      // ticket number pill
      g.font = `800 30px ui-monospace, 'SF Mono', Menlo, monospace`
      const tw = g.measureText(p.ticketNumber).width + 56
      g.fillStyle = 'rgba(255,255,255,0.88)'
      round(g, W / 2 - tw / 2, L.pillY - 27, tw, 54, 27); g.fill()
      g.fillStyle = VIOLET
      g.fillText(p.ticketNumber, W / 2, L.pillY + 1)
      g.fillStyle = INK; g.globalAlpha = 0.7
      g.font = `700 17px ${BODY}`
      g.fillText('ADMIT ONE  ·  VALID FOR ONE ENTRY', W / 2, L.noteY)
      g.globalAlpha = 1
      const url = c.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = url; a.download = `RANGEELA26-${p.ticketNumber}.png`
      document.body.appendChild(a); a.click(); a.remove()
    } catch {
      setSaveError('Could not save the image. Take a screenshot of the ticket instead.')
    } finally {
      setSaving(false)
    }
  }

  const missing = p.state === 'missing' || p.state === 'inactive'

  return (
    <main className="tk-root">
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700;800&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      <div className="tk-bg" aria-hidden><span className="b1" /><span className="b2" /><span className="b3" /></div>

      <div className="tk-wrap">
        {missing ? (
          <div className="tk-glass tk-msg">
            <img src="/rangeela/logo.webp" alt="RANGEELA '26" className="tk-msg-logo" />
            <h1>{p.state === 'missing' ? 'Ticket not found' : 'This ticket is not active'}</h1>
            <p>
              {p.state === 'missing'
                ? "This link does not match any RANGEELA '26 ticket. Please open the link from your ticket email or SMS again."
                : `Please message AISCA on WhatsApp (${p.helpLabel}) with your reference ${p.ticketNumber}.`}
            </p>
            <a className="tk-btn tk-btn-wa" href={`https://wa.me/${p.helpNumber}`}>Message AISCA</a>
          </div>
        ) : (
          <>
            <div className="tk-ticket" role="img" aria-label={`RANGEELA '26 ticket for ${p.name}, ${p.ticketNumber}`}>
              <img src="/rangeela/ticket-bg.webp" alt="" className="tk-art" />
              <div className="tk-name" style={{ top: pct(L.nameY, H), fontSize: `${Math.min(5.4, 118 / Math.max(1, (p.name || '').length))}cqw` }}>{p.name}</div>
              <div className="tk-school" style={{ top: pct(L.schoolY, H) }}>{p.school}</div>
              <div className="tk-qr" style={{ left: pct(L.qrX, W), top: pct(L.qrY, H), width: pct(L.qrSize, W) }}>
                {p.qr && <img src={p.qr} alt={`QR code for ${p.ticketNumber}`} />}
                {p.state === 'used' && <span className="tk-used">USED</span>}
              </div>
              <div className="tk-pill" style={{ top: pct(L.pillY, H) }}>{p.ticketNumber}</div>
              <div className="tk-note" style={{ top: pct(L.noteY, H) }}>Admit one · Valid for one entry</div>
            </div>

            {p.state === 'used' ? (
              <div className="tk-glass tk-info tk-info-used">
                This ticket was scanned at the entrance on {p.usedAt}. It cannot be used again.
              </div>
            ) : (
              <div className="tk-glass tk-info">
                Show this QR code at the entrance and bring your NIC. Turn your screen brightness up for a quicker scan. Please do not share this ticket, the first scan uses your entry.
              </div>
            )}

            <div className="tk-actions">
              {p.state === 'valid' && (
                <button type="button" onClick={save} disabled={saving} className="tk-btn tk-btn-main">
                  {saving ? 'Preparing...' : 'Save ticket to photos'}
                </button>
              )}
              <a className="tk-btn tk-btn-wa" href={p.whatsappGroup} target="_blank" rel="noopener noreferrer">Join the WhatsApp group</a>
            </div>
            {saveError && <p className="tk-err">{saveError}</p>}
            <p className="tk-foot">Saturday, 17th October 2026 · 3.00 PM onwards · Hyde Park Grounds</p>
          </>
        )}
      </div>

      <style>{`
        .tk-root { position: relative; min-height: 100vh; overflow: hidden; background: #FFF6F1; font-family: ${BODY}; color: ${INK}; -webkit-font-smoothing: antialiased; }
        .tk-root a, .tk-root button { min-height: 0; }
        .tk-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .tk-bg span { position: absolute; border-radius: 50%; filter: blur(70px); opacity: .5; }
        .tk-bg .b1 { width: 60vmax; height: 60vmax; left: -20vmax; top: -18vmax; background: #FF79BE; }
        .tk-bg .b2 { width: 50vmax; height: 50vmax; right: -18vmax; top: 20vmax; background: #7FD3FF; }
        .tk-bg .b3 { width: 44vmax; height: 44vmax; left: 10vmax; bottom: -20vmax; background: #FFD46B; }
        .tk-wrap { position: relative; z-index: 1; max-width: 430px; margin: 0 auto; padding: 22px 16px 40px; }

        .tk-ticket { position: relative; width: 100%; aspect-ratio: ${W} / ${H}; container-type: inline-size; filter: drop-shadow(0 24px 40px rgba(70,20,90,0.28)); }
        .tk-root img.tk-art { position: absolute; inset: 0; width: 100% !important; height: 100% !important; max-width: none !important; display: block; }
        .tk-name, .tk-school, .tk-pill, .tk-note { position: absolute; left: 6%; right: 6%; transform: translateY(-50%); text-align: center; }
        .tk-name { font-family: ${DISPLAY}; font-weight: 800; font-size: 5.4cqw; line-height: 1.05; color: ${ORANGE}; text-transform: uppercase; letter-spacing: .01em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tk-school { font-size: 2.6cqw; font-weight: 600; color: ${INK}; opacity: .72; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .tk-qr { position: absolute; aspect-ratio: 1; background: #fff; border-radius: 3.2cqw; padding: 2.25cqw; box-shadow: 0 1.2cqw 3cqw rgba(60,20,80,0.22); }
        .tk-root .tk-qr img { display: block; width: 100% !important; height: 100% !important; max-width: none !important; image-rendering: pixelated; }
        .tk-used { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: ${DISPLAY}; font-weight: 800; font-size: 9cqw; color: #DC2626; background: rgba(255,255,255,0.72); border-radius: inherit; letter-spacing: .08em; transform: rotate(-12deg); }
        .tk-pill { left: 50%; right: auto; transform: translate(-50%, -50%); padding: 1cqw 3.5cqw; border-radius: 999px; background: rgba(255,255,255,0.88); color: ${VIOLET}; font-family: ui-monospace, 'SF Mono', Menlo, monospace; font-weight: 800; font-size: 3.75cqw; white-space: nowrap; box-shadow: inset 0 1px 0 #fff; }
        .tk-note { font-size: 2.1cqw; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; color: ${INK}; opacity: .7; }

        .tk-glass { background: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.8); -webkit-backdrop-filter: blur(22px) saturate(170%); backdrop-filter: blur(22px) saturate(170%); box-shadow: 0 10px 30px -14px rgba(60,20,80,0.25), inset 0 1px 0 rgba(255,255,255,0.95); border-radius: 22px; }
        .tk-info { margin-top: 18px; padding: 14px 16px; font-size: 14px; line-height: 1.6; color: #4E3E4B; text-align: center; }
        .tk-info-used { color: #B42318; font-weight: 600; }
        .tk-actions { display: flex; flex-direction: column; gap: 10px; margin-top: 14px; }
        .tk-btn { display: flex; align-items: center; justify-content: center; height: 52px; border-radius: 999px; font-size: 15.5px; font-weight: 700; text-decoration: none; border: none; cursor: pointer; }
        .tk-btn:active { transform: scale(.98); }
        .tk-btn:disabled { opacity: .6; }
        .tk-btn-main { color: #fff; background: linear-gradient(100deg, #E6007E, #FF7A00 55%, #7B2FF7); box-shadow: 0 14px 30px -12px rgba(230,0,126,0.55); font-family: ${DISPLAY}; font-size: 17px; font-weight: 800; }
        .tk-btn-wa { color: #fff; background: #25D366; box-shadow: 0 10px 22px -10px rgba(37,211,102,0.8); }
        .tk-err { text-align: center; color: #B42318; font-size: 13px; margin-top: 10px; }
        .tk-foot { text-align: center; font-size: 12.5px; color: #7D6D79; margin-top: 18px; }
        .tk-msg { margin-top: 12vh; padding: 28px 22px; text-align: center; }
        .tk-root img.tk-msg-logo { width: 70% !important; height: auto !important; margin: 0 auto 10px; display: block; }
        .tk-msg h1 { font-family: ${DISPLAY}; font-weight: 800; font-size: 24px; margin: 6px 0 8px; color: ${INK}; }
        .tk-msg p { font-size: 14.5px; line-height: 1.6; color: #4E3E4B; margin: 0 0 18px; }
      `}</style>
    </main>
  )
}

function fit(g: CanvasRenderingContext2D, text: string, size: number, maxW: number): number {
  let s = size
  g.font = `800 ${s}px ${DISPLAY}`
  while (s > 22 && g.measureText(text).width > maxW) { s -= 2; g.font = `800 ${s}px ${DISPLAY}` }
  return s
}

function clip(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

function round(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}
