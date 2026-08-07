import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'
import { isEmail, rateLimit } from '@/lib/validate'

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(req, 'contact', 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many messages. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()

    // Truncate long input instead of rejecting it, so a long message never
    // gets falsely flagged as "all fields are required".
    const name = String(body.name ?? '').trim().slice(0, 200)
    const subject = String(body.subject ?? '').trim().slice(0, 300)
    const message = String(body.message ?? '').trim().slice(0, 20000)

    if (!name || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }
    if (!isEmail(body.email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }
    const email = (body.email as string).trim().toLowerCase()

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert([{ name, email, subject, message }])
      .select()
      .single()

    if (error) {
      console.error('Database error in contact route:', error.message)
      return NextResponse.json({ error: 'Message could not be saved. Please try again.' }, { status: 500 })
    }

    // Send Telegram notification
    try {
      await sendTelegram(
        `📩 *NEW CONTACT MESSAGE*\n\n` +
        `👤 *Name*: ${name}\n` +
        `📧 *Email*: ${email}\n` +
        `📋 *Subject*: ${subject}\n` +
        `💬 *Message*: ${message.slice(0, 1500)}\n\n` +
        `🕐 *Time*: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`
      )
    } catch (tgErr) {
      console.error('Telegram notification failed in contact route:', tgErr)
    }

    return NextResponse.json({ success: true, messageId: data.id })
  } catch (err: any) {
    console.error('Internal server error in contact route:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
