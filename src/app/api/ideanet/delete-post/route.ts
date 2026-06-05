import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { post_id, membership_number } = await req.json()

  const { data: post } = await supabaseAdmin
    .from('ideanet_posts')
    .select('membership_number')
    .eq('id', post_id)
    .single()

  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (post.membership_number !== membership_number) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await supabaseAdmin.from('ideanet_posts').update({ status: 'deleted' }).eq('id', post_id)
  return NextResponse.json({ success: true })
}
