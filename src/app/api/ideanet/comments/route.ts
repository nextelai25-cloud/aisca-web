import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const post_id = searchParams.get('post_id')

  const { data, error } = await supabaseAdmin
    .from('ideanet_comments')
    .select('*')
    .eq('post_id', post_id)
    .eq('status', 'active')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comments: data })
}

export async function POST(req: NextRequest) {
  const { post_id, parent_id, membership_number, author_name, author_school, content } = await req.json()

  const { data, error } = await supabaseAdmin
    .from('ideanet_comments')
    .insert([{ post_id, parent_id: parent_id || null, membership_number, author_name, author_school, content }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

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

  // Only allow delete by owner
  const { data: comment } = await supabaseAdmin
    .from('ideanet_comments')
    .select('membership_number')
    .eq('id', comment_id)
    .single()

  if (!comment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (comment.membership_number !== membership_number) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  await supabaseAdmin.from('ideanet_comments').update({ status: 'deleted' }).eq('id', comment_id)
  return NextResponse.json({ success: true })
}
