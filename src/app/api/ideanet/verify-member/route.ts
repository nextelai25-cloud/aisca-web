import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { digits } = await req.json()
  if (!digits || digits.length !== 5) {
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
