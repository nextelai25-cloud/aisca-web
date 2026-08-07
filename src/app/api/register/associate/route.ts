import { NextRequest, NextResponse } from 'next/server'
import { randomInt } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'
import { generateMembershipCard } from '@/lib/membership-card'
import { sendWelcomeEmail } from '@/lib/email'
import { isEmail, isPhone, cleanStr, optStr, rateLimit } from '@/lib/validate'

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(req, 'register-associate', 5, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()

    // ── Server-side validation ──
    const full_name = cleanStr(body.full_name, 120)
    const school = cleanStr(body.school, 160)
    const district = cleanStr(body.district, 60)
    const province = cleanStr(body.province, 60)
    const who_are_you = cleanStr(body.who_are_you, 120)
    const date_of_birth = cleanStr(body.date_of_birth, 40)

    if (!full_name || !school || !district || !province || !who_are_you || !date_of_birth) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 })
    }
    if (!isEmail(body.email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }
    if (!isPhone(body.whatsapp)) {
      return NextResponse.json({ error: 'Please provide a valid WhatsApp number.' }, { status: 400 })
    }
    const dob = new Date(date_of_birth)
    if (isNaN(dob.getTime()) || dob > new Date() || dob.getFullYear() < 1940) {
      return NextResponse.json({ error: 'Please provide a valid date of birth.' }, { status: 400 })
    }

    const payload = {
      full_name,
      email: (body.email as string).trim().toLowerCase(),
      whatsapp: (body.whatsapp as string).trim(),
      date_of_birth,
      school,
      district,
      province,
      who_are_you,
      commerce_stream: body.commerce_stream === true,
      actively_participate: body.actively_participate === true,
      how_heard: optStr(body.how_heard, 120),
      project_ideas: optStr(body.project_ideas, 2000),
      // Auto-approve so the digital card, email, and IdeaNet access work immediately.
      status: 'approved' as const
    }

    console.log('[Associate API] Starting registration for:', full_name)

    // ── Insert with collision-safe membership number (retry up to 3x) ──
    let data: any = null
    let membershipNumber = ''
    let lastError: string | null = null
    for (let attempt = 0; attempt < 3; attempt++) {
      membershipNumber = `AISCA-2026-${randomInt(10000, 100000)}`
      const res = await supabaseAdmin
        .from('associate_members')
        .insert([{ ...payload, membership_number: membershipNumber }])
        .select()
        .single()
      if (!res.error) {
        data = res.data
        lastError = null
        break
      }
      lastError = res.error.message
      // Retry only on unique-constraint collisions
      if (!/duplicate|unique/i.test(res.error.message)) break
    }

    if (!data) {
      console.error('Database insert error in associate registration:', lastError)
      return NextResponse.json({ error: 'Registration could not be saved. Please try again.' }, { status: 500 })
    }

    // ── Telegram notification (non-blocking failure) ──
    try {
      await sendTelegram(`🎓 *NEW ASSOCIATE REGISTRATION*\n\n👤 Name: ${full_name}\n🆔 ${membershipNumber}\n📧 Email: ${payload.email}\n📱 WhatsApp: ${payload.whatsapp}\n🏫 School: ${school}\n📍 District: ${district}, ${province}\n👥 Who: ${who_are_you}\n✅ Active: ${payload.actively_participate ? 'Yes' : 'No'}\n📣 Heard via: ${payload.how_heard || 'N/A'}\n🕐 Time: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`)
    } catch (tgErr) {
      console.error('[Associate API] Telegram failed:', tgErr)
    }

    // ── Membership card PDF ──
    let cardUrl: string | null = null
    let pdfBytes: Buffer | null = null
    try {
      const cardResult = await generateMembershipCard(data)
      if (cardResult) {
        cardUrl = cardResult.publicUrl
        pdfBytes = cardResult.pdfBytes
      }
    } catch (pdfErr) {
      console.error('PDF generation failed in associate route:', pdfErr)
    }

    // ── Welcome email with card attached ──
    try {
      const emailResult = await sendWelcomeEmail({
        to: payload.email,
        name: full_name,
        membershipNumber,
        cardUrl: cardUrl || null,
        pdfBytes: pdfBytes
      })
      console.log('Email result:', JSON.stringify(emailResult))
    } catch (emailErr) {
      console.error('Welcome email dispatch failed in associate route:', emailErr)
    }

    return NextResponse.json({ success: true, membershipNumber, memberId: data.id })
  } catch (err: any) {
    console.error('Internal server error in associate route:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
