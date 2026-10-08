import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cleanStr, isEmail, isPhone, optStr, rateLimit } from '@/lib/validate'
import { ceoIsOpen } from '@/lib/ceo/config'

// Register for the official CEO Challenge, or resume on a new device (same email + phone).
export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'ceo-register', 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please wait a few minutes.' }, { status: 429 })
  }
  if (!ceoIsOpen()) return NextResponse.json({ error: 'Registrations are closed.' }, { status: 403 })

  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const phone = typeof body.phone === 'string' ? body.phone.replace(/[^\d+]/g, '') : ''
  if (!isEmail(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  if (!isPhone(phone)) return NextResponse.json({ error: 'Please enter a valid mobile number.' }, { status: 400 })

  // Resume: same email and same phone returns the existing player.
  const { data: existing } = await supabaseAdmin
    .from('ceo_players').select('token, phone, full_name').ilike('email', email).maybeSingle()
  if (existing) {
    const digits = (v: string) => v.replace(/\D/g, '').slice(-9)
    if (digits(existing.phone) !== digits(phone)) {
      return NextResponse.json({ error: 'This email is already registered with a different mobile number.' }, { status: 409 })
    }
    return NextResponse.json({ token: existing.token, name: existing.full_name, resumed: true })
  }

  if (body.resumeOnly) {
    return NextResponse.json({ error: 'We couldn’t find a registration with that email.' }, { status: 404 })
  }

  const fullName = cleanStr(body.fullName, 80, 3)
  const school = cleanStr(body.school, 120, 3)
  const grade = optStr(body.grade, 20)
  if (!fullName) return NextResponse.json({ error: 'Please enter your full name.' }, { status: 400 })
  if (!school) return NextResponse.json({ error: 'Please enter your school.' }, { status: 400 })
  if (body.consent !== true) return NextResponse.json({ error: 'Please accept the competition terms.' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('ceo_players')
    .insert({ full_name: fullName, school, grade: grade || null, email, phone })
    .select('token')
    .single()
  if (error || !data) {
    console.error('ceo register:', error?.message)
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 })
  }
  return NextResponse.json({ token: data.token, name: fullName, resumed: false })
}
