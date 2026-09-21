import type { Metadata } from 'next'
import QRCode from 'qrcode'
import { supabaseAdmin } from '@/lib/supabase'
import { RANGEELA } from '@/lib/rangeela'

// Online copy of a RANGEELA '26 ticket, linked from the ticket email.
// Handy if the email images do not load at the gate. The token in the URL
// is the same secret that is inside the QR, so this page is never indexed.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Your RANGEELA '26 ticket",
  robots: { index: false, follow: false },
}

const INK = '#2B1B2E'
const MUTED = '#8A7A86'
const RAINBOW = 'linear-gradient(90deg, #E6007E, #FF4D2E, #FF7A00, #FFC300, #0FB5AE, #2F6BFF, #7B2FF7)'

export default async function TicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const clean = String(token || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 80)

  const { data: t } = clean.length >= 20
    ? await supabaseAdmin
        .from('rangeela_tickets')
        .select('ticket_number, full_name, school, nic, status, checked_in_at')
        .eq('qr_token', clean)
        .maybeSingle()
    : { data: null }

  const valid = !!t && t.status === 'approved'
  const svg = valid ? await QRCode.toString(`RANGEELA26:${clean}`, { type: 'svg', margin: 1, width: 280, errorCorrectionLevel: 'M' }) : ''

  return (
    <main style={{ minHeight: '100vh', background: '#FFF8F3', fontFamily: "'Inter', system-ui, sans-serif", color: '#5B4A58', padding: '28px 16px 60px' }}>
      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', border: '1px solid #F3E3F0', boxShadow: '0 24px 60px -30px rgba(123,47,247,0.45)' }}>
          <div style={{ height: 6, background: RAINBOW }} />
          <div style={{ padding: '24px 22px 10px', textAlign: 'center' }}>
            <img src="/rangeela/logo.webp" alt="RANGEELA '26" style={{ width: '78%', height: 'auto', margin: '0 auto', display: 'block' }} />
          </div>

          {!t ? (
            <div style={{ padding: '10px 24px 30px', textAlign: 'center' }}>
              <h1 style={{ fontSize: 20, color: INK, margin: '10px 0 8px' }}>Ticket not found</h1>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>This link does not match any RANGEELA &apos;26 ticket. Please open the link from your ticket email again.</p>
            </div>
          ) : !valid ? (
            <div style={{ padding: '10px 24px 30px', textAlign: 'center' }}>
              <h1 style={{ fontSize: 20, color: INK, margin: '10px 0 8px' }}>This ticket is not active</h1>
              <p style={{ fontSize: 14, lineHeight: 1.6 }}>Please message AISCA on WhatsApp ({RANGEELA.helpWhatsappLabel}) with your reference {t.ticket_number}.</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '6px 24px 0', textAlign: 'center' }}>
                <div style={{ fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase', color: MUTED, fontWeight: 700 }}>Admit one</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: INK, marginTop: 4, lineHeight: 1.2 }}>{t.full_name}</div>
                <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>{t.school}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '18px 18px 0' }}>
                {[['Date', RANGEELA.dateShort, '#E0561B'], ['Time', '3.00 PM', '#E6007E'], ['Venue', 'Hyde Park', '#2F6BFF']].map(([k, v, c]) => (
                  <div key={k} style={{ textAlign: 'center', background: '#FFF7F2', borderRadius: 12, padding: '10px 4px' }}>
                    <div style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, fontWeight: 700 }}>{k}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: c, marginTop: 3 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ margin: '20px 18px 0', borderTop: '2px dashed #EBD9E6' }} />
              <div style={{ padding: '20px 24px 8px', textAlign: 'center' }}>
                {t.checked_in_at ? (
                  <div style={{ padding: '16px', borderRadius: 14, background: '#FFF4E5', color: '#9A3412', fontSize: 14, fontWeight: 600 }}>
                    This ticket was already used at the entrance on{' '}
                    {new Date(t.checked_in_at).toLocaleString('en-LK', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' })}.
                  </div>
                ) : (
                  <div style={{ display: 'inline-block', padding: 10, borderRadius: 16, border: '1px solid #EFE3EC', background: '#fff', lineHeight: 0 }}
                    dangerouslySetInnerHTML={{ __html: svg }} />
                )}
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: 18, fontWeight: 800, color: '#7B2FF7', marginTop: 12 }}>{t.ticket_number}</div>
                <p style={{ fontSize: 12.5, lineHeight: 1.6, color: MUTED, margin: '8px 0 0' }}>
                  Show this QR code at the entrance. It works for one entry only. Please bring your NIC or school ID.
                </p>
              </div>
              <div style={{ padding: '16px 24px 24px', textAlign: 'center' }}>
                <a href={RANGEELA.whatsappGroup} style={{ display: 'inline-block', background: '#25D366', color: '#fff', padding: '10px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                  Join the WhatsApp group
                </a>
              </div>
            </>
          )}
          <div style={{ height: 6, background: RAINBOW }} />
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: MUTED, marginTop: 16 }}>
          {RANGEELA.dateLabel} · {RANGEELA.timeLabel} · {RANGEELA.venue}
        </p>
      </div>
    </main>
  )
}
