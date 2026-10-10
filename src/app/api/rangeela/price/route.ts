import { NextResponse } from 'next/server'
import { getRangeelaPrices } from '@/lib/rangeela-prices'

export const dynamic = 'force-dynamic'

// GET /api/rangeela/price → { standard, gate }. Public, read only.
export async function GET() {
  const p = await getRangeelaPrices()
  return NextResponse.json(p, { headers: { 'Cache-Control': 'no-store' } })
}
