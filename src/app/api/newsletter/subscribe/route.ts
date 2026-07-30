import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { isEmail, optStr, rateLimit } from '@/lib/validate'

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(req, 'newsletter', 5, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()

    if (!isEmail(body.email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert([{ email: (body.email as string).trim().toLowerCase(), name: optStr(body.name, 120) }], { onConflict: 'email' })

    if (error) {
      console.error('Newsletter subscribe error:', error.message)
      return NextResponse.json({ error: 'Subscription failed. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Internal error in newsletter route:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
