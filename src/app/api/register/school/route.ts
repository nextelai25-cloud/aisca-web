import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'
import { isEmail, isPhone, cleanStr, optStr, rateLimit } from '@/lib/validate'

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(req, 'register-school', 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()

    // ── Server-side validation ──
    const school_name = cleanStr(body.school_name, 160)
    const province = cleanStr(body.province, 60)
    const district = cleanStr(body.district, 60)
    const commerce_society_name = cleanStr(body.commerce_society_name, 160)
    const master_in_charge_name = cleanStr(body.master_in_charge_name, 120)
    const student_president_name = cleanStr(body.student_president_name, 120)

    if (!school_name || !province || !district || !commerce_society_name || !master_in_charge_name || !student_president_name) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
    }
    if (!isEmail(body.commerce_society_email)) {
      return NextResponse.json({ error: 'Please provide a valid society email address.' }, { status: 400 })
    }
    if (!isPhone(body.master_in_charge_phone) || !isPhone(body.student_president_phone)) {
      return NextResponse.json({ error: 'Please provide valid contact numbers.' }, { status: 400 })
    }
    if (body.student_president_email && !isEmail(body.student_president_email)) {
      return NextResponse.json({ error: 'Please provide a valid president email address.' }, { status: 400 })
    }

    console.log('[School API] Starting registration for:', school_name)

    const cleanPayload = {
      school_name,
      province,
      district,
      commerce_society_name,
      commerce_society_email: (body.commerce_society_email as string).trim().toLowerCase(),
      master_in_charge_name,
      master_in_charge_email: optStr(body.master_in_charge_email, 254),
      master_in_charge_phone: (body.master_in_charge_phone as string).trim(),
      student_president_name,
      student_president_email: optStr(body.student_president_email, 254),
      student_president_phone: (body.student_president_phone as string).trim(),
      status: 'pending'
    }

    const { data, error } = await supabaseAdmin
      .from('school_registrations')
      .insert([cleanPayload])
      .select()
      .single()

    if (error) {
      console.error('Database insert error in school registration:', error.message)
      return NextResponse.json({ error: 'Registration could not be saved. Please try again.' }, { status: 500 })
    }

    // Extra (non-stored) details from the form, forwarded to Telegram so nothing is lost
    const secretaryInfo = body.secretary_name
      ? `\n👤 Secretary: ${optStr(body.secretary_name, 120)}\n📱 Secretary Phone: ${optStr(body.secretary_phone, 20)}\n🎓 Secretary Batch: ${optStr(body.secretary_batch, 10)}\n📅 Board Valid Till: ${optStr(body.board_year, 10)}`
      : ''

    try {
      await sendTelegram(`🏫 *NEW SCHOOL REGISTRATION*\n\n🏫 School: ${school_name}\n📍 District: ${district}, ${province}\n🎓 Commerce Society: ${commerce_society_name}\n📧 Society Email: ${cleanPayload.commerce_society_email}\n👨‍🏫 Master in Charge: ${master_in_charge_name}\n📱 Master Phone: ${cleanPayload.master_in_charge_phone}\n👤 Student President: ${student_president_name}\n📧 President Email: ${cleanPayload.student_president_email || 'N/A'}\n📱 President Phone: ${cleanPayload.student_president_phone}${secretaryInfo}\n🕐 Time: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`)
    } catch (tgErr) {
      console.error('[School API] Telegram failed:', tgErr)
    }

    return NextResponse.json({ success: true, registrationId: data.id })
  } catch (err: any) {
    console.error('Internal server error in school route:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
