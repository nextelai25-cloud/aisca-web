import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'

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
  const body = await req.json()
  const { membership_number, author_name, author_school, title, description, images } = body

  if (!membership_number || !author_name || !title || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

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
      membership_number,
      author_name,
      author_school: author_school || '',
      title,
      description,
      images: images || [],
      hot_score: hotScore,
      created_at: now
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Telegram notification
  await sendTelegram(`💡 *NEW IDEANET POST*\n\n📌 Title: ${title}\n👤 Author: ${author_name}\n🏫 School: ${author_school || 'N/A'}\n🆔 ${membership_number}\n\n${description.slice(0, 150)}${description.length > 150 ? '...' : ''}\n\n🌐 View: https://aisca.lk/ideanet`)

  return NextResponse.json({ success: true, post: data })
}
