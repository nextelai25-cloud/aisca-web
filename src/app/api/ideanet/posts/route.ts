import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'
import { verifyApprovedMember } from '@/lib/member'
import { cleanStr, rateLimit } from '@/lib/validate'

function calcHotScore(upvotes: number, downvotes: number, createdAt: string): number {
  const score = upvotes - downvotes
  const order = Math.log10(Math.max(Math.abs(score), 1))
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0
  const seconds = (new Date(createdAt).getTime() - new Date('2026-01-01').getTime()) / 1000
  return sign * order + seconds / 45000
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sort = searchParams.get('sort') || 'top'
  const page = parseInt(searchParams.get('page') || '0')
  const PER_PAGE = 20

  const orderCol = sort === 'new' ? 'created_at' : 'hot_score'

  const { data, error } = await supabaseAdmin
    .from('ideanet_posts')
    .select('*')
    .eq('status', 'active')
    .order(orderCol, { ascending: false })
    .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ posts: data })
}

export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'ideanet-post', 10, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many posts. Please try again later.' }, { status: 429 })
  }

  const body = await req.json()

  const title = cleanStr(body.title, 200)
  const description = cleanStr(body.description, 5000)
  if (!title || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // ── Verify membership server-side: identity comes from the DB, not the client ──
  const member = await verifyApprovedMember(body.membership_number)
  if (!member) {
    return NextResponse.json({ error: 'Invalid or unapproved membership number' }, { status: 403 })
  }

  // Only allow images uploaded to our own Supabase storage
  const images = Array.isArray(body.images)
    ? body.images
        .filter((u: unknown) => typeof u === 'string' && u.startsWith(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/`))
        .slice(0, 4)
    : []

  // Server-side validation for emojis and dashes
  const blockedRegex = /[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{1F300}-\u{1F9FF}\u2014\u2013]/gu
  if (blockedRegex.test(title) || blockedRegex.test(description)) {
    return NextResponse.json({ error: 'Emojis and dashes (—, –) are not allowed by AISCA rules' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const hotScore = calcHotScore(0, 0, now)

  const { data, error } = await supabaseAdmin
    .from('ideanet_posts')
    .insert([{
      membership_number: member.membership_number,
      author_name: member.full_name,
      author_school: member.school,
      title,
      description,
      images,
      hot_score: hotScore,
      created_at: now
    }])
    .select()
    .single()

  if (error) {
    console.error('IdeaNet post insert error:', error.message)
    return NextResponse.json({ error: 'Could not create post. Please try again.' }, { status: 500 })
  }

  // Telegram notification (non-blocking failure)
  try {
    await sendTelegram(`💡 *NEW IDEANET POST*\n\n📌 Title: ${title}\n👤 Author: ${member.full_name}\n🏫 School: ${member.school || 'N/A'}\n🆔 ${member.membership_number}\n\n${description.slice(0, 150)}${description.length > 150 ? '...' : ''}\n\n🌐 View: https://aisca.lk/ideanet`)
  } catch (tgErr) {
    console.error('IdeaNet post Telegram failed:', tgErr)
  }

  return NextResponse.json({ success: true, post: data })
}
