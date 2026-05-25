import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[School API] Starting registration for:', body.school_name)
    
    // Filter payload to only include database-supported columns
    const cleanPayload = {
      school_name: body.school_name,
      province: body.province,
      district: body.district,
      commerce_society_name: body.commerce_society_name,
      commerce_society_email: body.commerce_society_email,
      master_in_charge_name: body.master_in_charge_name,
      master_in_charge_email: body.master_in_charge_email || '',
      master_in_charge_phone: body.master_in_charge_phone,
      student_president_name: body.student_president_name,
      student_president_email: body.student_president_email || '',
      student_president_phone: body.student_president_phone,
      status: 'pending'
    }
    
    const { data, error } = await supabaseAdmin
      .from('school_registrations')
      .insert([cleanPayload])
      .select()
      .single()
    
    if (error) {
      console.error("Database insert error in school registration:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Send Telegram notification
    console.log('[School API] Sending Telegram notification...')
    await sendTelegram(`🏫 *NEW SCHOOL REGISTRATION*\n\n🏫 School: ${body.school_name}\n📍 District: ${body.district}, ${body.province}\n🎓 Commerce Society: ${body.commerce_society_name}\n📧 Society Email: ${body.commerce_society_email}\n👨‍🏫 Master in Charge: ${body.master_in_charge_name}\n📱 Master Phone: ${body.master_in_charge_phone}\n👤 Student President: ${body.student_president_name}\n📧 President Email: ${body.student_president_email}\n📱 President Phone: ${body.student_president_phone}\n🕐 Time: ${new Date().toLocaleString('en-LK', {timeZone: 'Asia/Colombo'})}`)
    console.log('[School API] Telegram done')
    
    return NextResponse.json({ success: true, registrationId: data.id })
  } catch (err: any) {
    console.error("Internal server error in school route:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
