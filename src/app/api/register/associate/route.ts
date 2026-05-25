import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'
import { generateMembershipCard } from '@/lib/membership-card'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[Associate API] Starting registration for:', body.full_name)
    
    // Generate random membership number
    const randomNum = Math.floor(10000 + Math.random() * 90000)
    const membershipNumber = `AISCA-2026-${randomNum}`
    
    const { data, error } = await supabaseAdmin
      .from('associate_members')
      .insert([{ ...body, membership_number: membershipNumber }])
      .select()
      .single()
    
    if (error) {
      console.error("Database insert error in associate registration:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Send Telegram notification
    console.log('[Associate API] Sending Telegram notification...')
    await sendTelegram(`🎓 *NEW ASSOCIATE REGISTRATION*\n\n👤 Name: ${body.full_name}\n📧 Email: ${body.email}\n📱 WhatsApp: ${body.whatsapp}\n🏫 School: ${body.school}\n📍 District: ${body.district}, ${body.province}\n👥 Who: ${body.who_are_you}\n✅ Active: ${body.actively_participate ? 'Yes' : 'No'}\n📣 Heard via: ${body.how_heard || 'N/A'}\n🕐 Time: ${new Date().toLocaleString('en-LK', {timeZone: 'Asia/Colombo'})}`)
    console.log('[Associate API] Telegram done')
    
    // Generate membership card PDF asynchronously
    let cardUrl: string | null = null
    let pdfBytes: Buffer | null = null
    try {
      const cardResult = await generateMembershipCard(data)
      if (cardResult) {
        cardUrl = cardResult.publicUrl
        pdfBytes = cardResult.pdfBytes
      }
    } catch (pdfErr) {
      console.error("PDF generation failed in associate route:", pdfErr);
    }

    // Send Welcome Email via Resend
    console.log('Sending welcome email to:', body.email)
    try {
      const emailResult = await sendWelcomeEmail({
        to: body.email,
        name: body.full_name,
        membershipNumber,
        cardUrl: cardUrl || null,
        pdfBytes: pdfBytes
      })
      console.log('Email result:', JSON.stringify(emailResult))
    } catch (emailErr) {
      console.error("Welcome email dispatch failed in associate route:", emailErr);
    }
    
    return NextResponse.json({ success: true, membershipNumber, memberId: data.id })
  } catch (err: any) {
    console.error("Internal server error in associate route:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
