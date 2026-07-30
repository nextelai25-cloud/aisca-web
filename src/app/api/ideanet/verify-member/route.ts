import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/validate'

export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'verify-member', 15, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
  }

  const { digits } = await req.json()
  if (typeof digits !== 'string' || !/^\d{5}$/.test(digits)) {
    return NextResponse.json({ error: 'Enter exactly 5 digits' }, { status: 400 })
  }

  const membershipNumber = `AISCA-2026-${digits}`

  // Check associate_members table first
  const { data: associate } = await supabaseAdmin
    .from('associate_members')
    .select('full_name, school, membership_number')
    .eq('membership_number', membershipNumber)
    .eq('status', 'approved')
    .single()

  if (associate) {
    return NextResponse.json({
      valid: true,
      membership_number: associate.membership_number,
      name: associate.full_name,
      school: associate.school || ''
    })
  }

  return NextResponse.json({ error: 'Membership number not found or not approved' }, { status: 404 })
}
