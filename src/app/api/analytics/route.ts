import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Attempt to extract geo-headers if deployed on a cloud provider like Vercel
    const vercelCountry = req.headers.get('x-vercel-ip-country')
    const vercelCity = req.headers.get('x-vercel-ip-country-region') || req.headers.get('x-vercel-ip-city')
    
    const country = vercelCountry || body.country || null
    const city = vercelCity || body.city || null
    
    const { error } = await supabaseAdmin.from('site_analytics').insert([{
      page: body.page,
      referrer: body.referrer || null,
      device: body.device,
      browser: body.browser,
      session_id: body.session_id,
      country: country,
      city: city
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
