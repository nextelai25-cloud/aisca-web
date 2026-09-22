import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'
import { isEmail, isPhone, optStr, rateLimit } from '@/lib/validate'
import { RANGEELA, AL_BATCHES, salesOpen, normaliseId, looksLikeNic } from '@/lib/rangeela'
import { sendRangeelaReceivedEmail } from '@/lib/rangeela-email'

// POST /api/rangeela/register
// One form = one ticket request. It is saved as "pending" until an organiser
// checks the bank receipt in the admin dashboard. The QR ticket is only
// emailed after that approval (see aisca-admin /api/rangeela/approve).
export async function POST(req: NextRequest) {
  try {
    // Many students share one school or mobile IP, so keep this generous.
    if (!rateLimit(req, 'rangeela-register', 300, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many requests from this connection. Please wait a little and try again.' }, { status: 429 })
    }
    if (!salesOpen()) {
      return NextResponse.json({ error: 'Online ticket sales for RANGEELA 26 are now closed.' }, { status: 400 })
    }

    const b = await req.json()

    const full_name = String(b.full_name ?? '').trim().slice(0, 200)
    if (!full_name) return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 })

    const email = String(b.email ?? '').trim().toLowerCase()
    const email_confirm = String(b.email_confirm ?? '').trim().toLowerCase()
    if (!isEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    if (email !== email_confirm) {
      return NextResponse.json({ error: 'The two email addresses do not match. Your ticket is sent to this email, so please check it again.' }, { status: 400 })
    }

    if (!isPhone(b.whatsapp)) return NextResponse.json({ error: 'Please enter a valid WhatsApp number.' }, { status: 400 })
    const whatsapp = String(b.whatsapp).trim().slice(0, 30)

    const school = String(b.school ?? '').trim().slice(0, 200)
    if (!school) return NextResponse.json({ error: 'Please enter your school.' }, { status: 400 })

    const al_batch = String(b.al_batch ?? '').trim()
    if (!(AL_BATCHES as readonly string[]).includes(al_batch)) {
      return NextResponse.json({ error: 'Please choose your A/L batch.' }, { status: 400 })
    }

    const nic = String(b.nic ?? '').trim().toUpperCase().slice(0, 30)
    const nic_norm = normaliseId(nic)
    if (!looksLikeNic(nic)) {
      return NextResponse.json({ error: 'Please enter a valid NIC number (12 digits, or 9 digits followed by V or X).' }, { status: 400 })
    }
    const nic_is_nic = looksLikeNic(nic)

    // Receipt must be a file we stored ourselves.
    const receipt_url = optStr(b.receipt_url, 600)
    const base = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/aisca-assets/rangeela-receipts/`
    if (!receipt_url || !receipt_url.startsWith(base)) {
      return NextResponse.json({ error: 'Please upload your bank receipt before submitting.' }, { status: 400 })
    }
    const receipt_filename = optStr(b.receipt_filename, 200) || null

    if (b.agree !== true) {
      return NextResponse.json({ error: 'Please tick the box to confirm the ticket terms.' }, { status: 400 })
    }

    // One live ticket per NIC (a rejected request does not block a new one).
    if (nic_is_nic) {
      const { data: dup } = await supabaseAdmin
        .from('rangeela_tickets')
        .select('ticket_number, status')
        .eq('nic_norm', nic_norm)
        .eq('nic_is_nic', true)
        .neq('status', 'rejected')
        .limit(1)
        .maybeSingle()
      if (dup) {
        return NextResponse.json({
          error: `A ticket request already exists for this NIC (${dup.ticket_number}, ${dup.status === 'approved' ? 'already approved' : 'waiting for verification'}). If you think this is a mistake, message us on WhatsApp.`,
        }, { status: 409 })
      }
    }

    const payload = {
      full_name, email, whatsapp, school, al_batch, nic, nic_norm, nic_is_nic,
      payment_method: 'bank', amount: RANGEELA.price, source: 'online',
      receipt_url, receipt_filename,
      notes: optStr(b.notes, 500) || null,
      status: 'pending',
    }

    // Collision safe ticket number (retry on the unique constraint).
    let ticket_number = ''
    let saved = false
    for (let attempt = 0; attempt < 5 && !saved; attempt++) {
      ticket_number = `RG26-${randomInt(10000, 100000)}`
      const { error } = await supabaseAdmin.from('rangeela_tickets').insert([{ ...payload, ticket_number }])
      if (!error) { saved = true; break }
      if (error.code === '23505' && /nic/i.test(error.message)) {
        return NextResponse.json({ error: 'A ticket request already exists for this NIC.' }, { status: 409 })
      }
      if (error.code !== '23505') {
        console.error('[rangeela/register] insert error:', error.message)
        return NextResponse.json({ error: 'Could not submit. Please try again.' }, { status: 500 })
      }
    }
    if (!saved) return NextResponse.json({ error: 'Could not submit. Please try again.' }, { status: 500 })

    await sendRangeelaReceivedEmail({ to: email, name: full_name, ticketNumber: ticket_number })

    try {
      await sendTelegram(
        `🎨 *RANGEELA 26 TICKET REQUEST*\n\n` +
        `🎟️ *Ref*: ${ticket_number}\n` +
        `👤 *Name*: ${full_name}\n` +
        `🏫 *School*: ${school} (${al_batch})\n` +
        `🪪 *NIC*: ${nic}\n` +
        `📱 *WhatsApp*: ${whatsapp}\n` +
        `📧 *Email*: ${email}\n` +
        `🧾 *Receipt*: ${receipt_url}\n` +
        `⏳ Waiting for payment verification in the admin dashboard\n` +
        `🕐 ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`
      )
    } catch {}

    return NextResponse.json({ success: true, ticketNumber: ticket_number })
  } catch (err) {
    console.error('[rangeela/register] internal error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
