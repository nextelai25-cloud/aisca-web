import { redirect } from 'next/navigation'

// Short ticket link used in SMS: aisca.lk/r/<token> opens the full ticket.
export default async function ShortTicketLink({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const clean = String(token || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 80)
  redirect(`/rangeela26/ticket/${clean}`)
}
