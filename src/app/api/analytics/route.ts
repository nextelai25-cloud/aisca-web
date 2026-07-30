import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { optStr, rateLimit } from '@/lib/validate'

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(req, 'analytics', 60, 10 * 60 * 1000)) {
      return NextResponse.json({ success: true }) // silently drop
    }

    const body = await req.json()
    
    // Attempt to extract geo-headers if deployed on a cloud provider like Vercel
    const vercelCountry = req.headers.get('x-vercel-ip-country')
    const vercelCity = req.headers.get('x-vercel-ip-country-region') || req.headers.get('x-vercel-ip-city')
    
    const country = vercelCountry || body.country || null
    const city = vercelCity || body.city || null
    
    const { error } = await supabaseAdmin.from('site_analytics').insert([{
      page: optStr(body.page, 200),
      referrer: optStr(body.referrer, 500) || null,
      device: optStr(body.device, 20),
      browser: optStr(body.browser, 40),
      session_id: optStr(body.session_id, 40),
      country: country ? String(country).slice(0, 60) : null,
      city: city ? String(city).slice(0, 60) : null
    }])
    
    if (error) {
      console.error("Database insert error in analytics tracker:", error.message);
      // We don't fail the request to not impact the client's page load experience
    }
    
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Internal error in analytics route:", err);
    return NextResponse.json({ error: err.message || 'Internal Error' }, { status: 500 })
  }
}
