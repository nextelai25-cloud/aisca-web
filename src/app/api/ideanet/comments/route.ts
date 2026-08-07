import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyApprovedMember } from '@/lib/member'
import { rateLimit } from '@/lib/validate'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const post_id = searchParams.get('post_id')
  if (!post_id) return NextResponse.json({ error: 'Missing post_id' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('ideanet_comments')
    .select('*')
    .eq('post_id', post_id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('IdeaNet comments fetch error:', error.message)
    return NextResponse.json({ error: 'Could not load comments.' }, { status: 500 })
  }
  return NextResponse.json({ comments: data })
}

export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'ideanet-comment', 30, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many comments. Please try again later.' }, { status: 429 })
  }

  const body = await req.json()
  const { post_id, parent_id } = body

  const content = String(body.content ?? '').trim().slice(0, 6000)
  if (!post_id || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // ── Verify membership server-side: identity comes from the DB, not the client ──
  const member = await verifyApprovedMember(body.membership_number)
  if (!member) {
    return NextResponse.json({ error: 'Invalid or unapproved membership number' }, { status: 403 })
  }

  const { data, error } = await supabaseAdmin
    .from('ideanet_comments')
    .insert([{
      post_id,
      parent_id: parent_id || null,
      membership_number: member.membership_number,
      author_name: member.full_name,
      author_school: member.school,
      content
    }])
    .select()
    .single()

  if (error) {
    console.error('IdeaNet comment insert error:', error.message)
    return NextResponse.json({ error: 'Could not post comment. Please try again.' }, { status: 500 })
  }

  // Update comment count
  const { count } = await supabaseAdmin
    .from('ideanet_comments')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', post_id)
    .eq('status', 'active')

  await supabaseAdmin.from('ideanet_posts').update({ comment_count: count || 0 }).eq('id', post_id)

  return NextResponse.json({ success: true, comment: data })
}

export async function DELETE(req: NextRequest) {
  const { comment_id, membership_number } = await req.json()

  // Membership must be real, and the comment must belong to it
  const member = await verifyApprovedMember(membership_number)
  if (!member) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { data: comment } = await supabaseAdmin
    .from('ideanet_comments')
    .select('membership_number')
    .eq('id', comment_id)
    .single()

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (comment.membership_number !== member.membership_number) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await supabaseAdmin.from('ideanet_comments').update({ status: 'deleted' }).eq('id', comment_id)
  return NextResponse.json({ success: true })
}
