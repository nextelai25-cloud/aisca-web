import type { Metadata } from 'next'
import QRCode from 'qrcode'
import { supabaseAdmin } from '@/lib/supabase'
import { RANGEELA } from '@/lib/rangeela'
import TicketView from './TicketView'

// Online copy of a RANGEELA '26 ticket, linked from the ticket email and SMS.
// The token in the URL is the same secret that is inside the QR, so this page
// is never indexed and never shows anything without a valid token.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Your RANGEELA '26 ticket",
  robots: { index: false, follow: false },
}

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

  if (!t || t.status !== 'approved') {
    return (
      <TicketView
        state={t ? 'inactive' : 'missing'}
        ticketNumber={t?.ticket_number || ''}
        helpLabel={RANGEELA.helpWhatsappLabel}
        helpNumber={RANGEELA.helpWhatsapp}
        whatsappGroup={RANGEELA.whatsappGroup}
      />
    )
  }

  const qr = await QRCode.toDataURL(`RANGEELA26:${clean}`, {
    width: 720, margin: 1, errorCorrectionLevel: 'M',
    color: { dark: '#241628', light: '#FFFFFF' },
  })

  return (
    <TicketView
      state={t.checked_in_at ? 'used' : 'valid'}
      name={t.full_name}
      school={t.school}
      ticketNumber={t.ticket_number}
      nic={t.nic}
      qr={qr}
      usedAt={t.checked_in_at
        ? new Date(t.checked_in_at).toLocaleString('en-LK', { timeZone: 'Asia/Colombo', dateStyle: 'medium', timeStyle: 'short' })
        : undefined}
      helpLabel={RANGEELA.helpWhatsappLabel}
      helpNumber={RANGEELA.helpWhatsapp}
      whatsappGroup={RANGEELA.whatsappGroup}
    />
  )
}
