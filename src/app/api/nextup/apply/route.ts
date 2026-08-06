import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'
import { sendNextUpReceivedEmail } from '@/lib/nextup-email'
import { cleanStr, optStr, isPhone, isEmail, rateLimit } from '@/lib/validate'

interface Upload { url?: string; filename?: string }

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(req, 'nextup-apply', 15, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many submissions. Please try again later.' }, { status: 429 })
    }

    const b = await req.json()
    const type = b.application_type === 'referral' ? 'referral' : b.application_type === 'self' ? 'self' : null
    if (!type) return NextResponse.json({ error: 'Please choose whether you are applying or referring.' }, { status: 400 })

    // ─────────────────────────── Referral path ───────────────────────────
    if (type === 'referral') {
      const referrer_name = cleanStr(b.referrer_name, 120)
      if (!referrer_name) return NextResponse.json({ error: 'Please tell us your name.' }, { status: 400 })
      if (!isPhone(b.referrer_phone)) return NextResponse.json({ error: 'Please provide your contact number.' }, { status: 400 })
      const referred_founder_name = cleanStr(b.referred_founder_name, 120)
      if (!referred_founder_name) return NextResponse.json({ error: "Please provide the founder's name." }, { status: 400 })
      if (!isPhone(b.referred_founder_phone)) return NextResponse.json({ error: "Please provide the founder's contact number." }, { status: 400 })

      const payload = {
        application_type: 'referral',
        referrer_name,
        referrer_phone: (b.referrer_phone as string).trim(),
        referrer_relationship: optStr(b.referrer_relationship, 300) || null,
        referred_founder_name,
        referred_founder_phone: (b.referred_founder_phone as string).trim(),
        uploads: [],
      }

      const { error } = await supabaseAdmin.from('nextup_applications').insert([payload])
      if (error) {
        console.error('[nextup/apply referral] insert error:', error.message)
        return NextResponse.json({ error: 'Could not submit. Please try again.' }, { status: 500 })
      }

      try {
        await sendTelegram(
          `⭐ *NEXTUP REFERRAL*\n\n` +
          `🙋 *Referrer*: ${referrer_name} (${payload.referrer_phone})\n` +
          `🤝 *Relationship*: ${payload.referrer_relationship || 'N/A'}\n` +
          `🚀 *Founder*: ${referred_founder_name} (${payload.referred_founder_phone})\n` +
          `🕐 ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`
        )
      } catch {}

      return NextResponse.json({ success: true })
    }

    // ──────────────────────────── Self path ──────────────────────────────
    const full_name = cleanStr(b.full_name, 120)
    if (!full_name) return NextResponse.json({ error: 'Please provide your full name.' }, { status: 400 })
    const age = cleanStr(b.age, 40)
    if (!age) return NextResponse.json({ error: 'Please tell us your age.' }, { status: 400 })
    const school = cleanStr(b.school, 160)
    if (!school) return NextResponse.json({ error: 'Please tell us which school you attend.' }, { status: 400 })
    const district = cleanStr(b.district, 80)
    if (!district) return NextResponse.json({ error: 'Please tell us your district.' }, { status: 400 })
    if (!isPhone(b.whatsapp)) return NextResponse.json({ error: 'Please provide a valid WhatsApp number.' }, { status: 400 })
    const email = optStr(b.email, 254)
    if (!email || !isEmail(email)) return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    const venture_name = cleanStr(b.venture_name, 160)
    if (!venture_name) return NextResponse.json({ error: 'Please name your business, project, or venture.' }, { status: 400 })
    const venture_description = cleanStr(b.venture_description, 600)
    if (!venture_description) return NextResponse.json({ error: 'Please tell us what it does.' }, { status: 400 })
    const story = cleanStr(b.story, 3000)
    if (!story) return NextResponse.json({ error: 'Please share your story — this is the part we care about most.' }, { status: 400 })
    if (b.consent !== true) return NextResponse.json({ error: 'Please confirm the information is true and give permission to feature your story.' }, { status: 400 })

    const uploads: Upload[] = Array.isArray(b.uploads) ? b.uploads : []
    const cleanUploads = uploads
      .filter((u) => u && typeof u.url === 'string' && /^https?:\/\//.test(u.url))
      .slice(0, 8)
      .map((u) => ({ url: u.url as string, filename: optStr(u.filename, 200) }))
    if (cleanUploads.length === 0) {
      return NextResponse.json({ error: 'Please upload at least one photo of yourself and your work.' }, { status: 400 })
    }

    const payload = {
      application_type: 'self',
      full_name,
      age,
      school,
      district,
      whatsapp: (b.whatsapp as string).trim(),
      email,
      social_handle: optStr(b.social_handle, 200) || null,
      venture_name,
      venture_description,
      venture_start: optStr(b.venture_start, 120) || null,
      venture_stage: optStr(b.venture_stage, 800) || null,
      role: optStr(b.role, 300) || null,
      proud_achievement: optStr(b.proud_achievement, 800) || null,
      story,
      work_links: optStr(b.work_links, 1000) || null,
      willing_podcast: b.willing_podcast === true,
      consent: true,
      guardian_consent: b.guardian_consent === true,
      uploads: cleanUploads,
    }

    const { error } = await supabaseAdmin.from('nextup_applications').insert([payload])
    if (error) {
      console.error('[nextup/apply self] insert error:', error.message)
      return NextResponse.json({ error: 'Could not submit. Please try again.' }, { status: 500 })
    }

    // Confirmation email (best-effort) + Telegram
    await sendNextUpReceivedEmail({ to: email, name: full_name })
    try {
      await sendTelegram(
        `⭐ *NEXTUP APPLICATION*\n\n` +
        `👤 *Name*: ${full_name} (age ${age})\n` +
        `🏫 *School*: ${school} · ${district}\n` +
        `📱 *WhatsApp*: ${payload.whatsapp}\n` +
        `📧 *Email*: ${email}\n` +
        `🚀 *Venture*: ${venture_name}\n` +
        `📎 *Files*: ${cleanUploads.length}\n` +
        `🎙️ *Podcast*: ${payload.willing_podcast ? 'Yes' : 'No'}\n` +
        `🕐 ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`
      )
    } catch {}

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[nextup/apply] internal error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
