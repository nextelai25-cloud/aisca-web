import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('contact_messages')
      .insert([{ name, email, subject, message }])
      .select()
      .single()

    if (error) {
      console.error('Database error in contact route:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send Telegram notification
    try {
      await sendTelegram(
        `📩 *NEW CONTACT MESSAGE*\n\n` +
        `👤 *Name*: ${name}\n` +
        `📧 *Email*: ${email}\n` +
        `📋 *Subject*: ${subject}\n` +
        `💬 *Message*: ${message}\n\n` +
        `🕐 *Time*: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`
      )
    } catch (tgErr) {
      console.error('Telegram notification failed in contact route:', tgErr)
    }

    return NextResponse.json({ success: true, messageId: data.id })
  } catch (err: any) {
    console.error('Internal server error in contact route:', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
