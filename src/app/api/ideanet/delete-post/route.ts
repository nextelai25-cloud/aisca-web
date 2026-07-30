import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyApprovedMember } from '@/lib/member'

export async function POST(req: NextRequest) {
  const { post_id, membership_number } = await req.json()

  // Membership must be real, and the post must belong to it
  const member = await verifyApprovedMember(membership_number)
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

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
