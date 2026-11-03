import type { Metadata } from 'next'
import QRCode from 'qrcode'
import { supabaseAdmin } from '@/lib/supabase'
import { MEMORA } from '@/lib/memora'
import TicketView from './TicketView'

// Online copy of a MEMORA '26 ticket, linked from the ticket email and SMS.
// The token in the URL is the same secret that is inside the QR, so this page
// is never indexed and never shows anything without a valid token.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Your MEMORA '26 ticket",
  robots: { index: false, follow: false },
}

export default async function MemoraTicketPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const clean = String(token || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 80)

  const { data: t } = clean.length >= 20
    ? await supabaseAdmin
        .from('memora_tickets')
        .select('ticket_number, full_name, school, status, checked_in_at')
        .eq('qr_token', clean)
        .maybeSingle()
    : { data: null }

  const help = { helpLabel: MEMORA.helpWhatsappLabel, helpNumber: MEMORA.helpWhatsapp }

  if (!t || t.status !== 'approved') {
    return <TicketView state={t ? 'inactive' : 'missing'} ticketNumber={t?.ticket_number || ''} {...help} />
  }

  const qr = await QRCode.toDataURL(`MEMORA26:${clean}`, {
    width: 720, margin: 1, errorCorrectionLevel: 'M',
    color: { dark: '#0B1230', light: '#FFFFFF' },
  })

  return (
    <TicketView
      state={t.checked_in_at ? 'used' : 'valid'}
      name={t.full_name}
      school={t.school}
      ticketNumber={t.ticket_number}
      qr={qr}
      usedAt={t.checked_in_at
        ? new Date(t.checked_in_at).toLocaleString('en-LK', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' })
        : undefined}
      {...help}
    />
  )
}
