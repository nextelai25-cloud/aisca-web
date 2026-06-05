import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function calcHotScore(upvotes: number, downvotes: number, createdAt: string): number {
  const score = upvotes - downvotes
  const order = Math.log10(Math.max(Math.abs(score), 1))
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0
  const seconds = (new Date(createdAt).getTime() - new Date('2026-01-01').getTime()) / 1000
  return sign * order + seconds / 45000
}

export async function POST(req: NextRequest) {
  const { post_id, membership_number, vote_type } = await req.json()

  // Check existing vote
  const { data: existing } = await supabaseAdmin
    .from('ideanet_votes')
    .select('*')
    .eq('post_id', post_id)
    .eq('membership_number', membership_number)
    .single()

  if (existing) {
    if (existing.vote_type === vote_type) {
      // Remove vote (toggle off)
      await supabaseAdmin.from('ideanet_votes').delete().eq('id', existing.id)
    } else {
      // Change vote
      await supabaseAdmin.from('ideanet_votes').update({ vote_type }).eq('id', existing.id)
    }
  } else {
    // New vote
    await supabaseAdmin.from('ideanet_votes').insert([{ post_id, membership_number, vote_type }])
  }

  // Recalculate counts
  const { data: votes } = await supabaseAdmin
    .from('ideanet_votes')
    .select('vote_type')
    .eq('post_id', post_id)

  const upvotes = votes?.filter(v => v.vote_type === 'up').length || 0
  const downvotes = votes?.filter(v => v.vote_type === 'down').length || 0

  // Get post created_at for hot score
  const { data: post } = await supabaseAdmin
    .from('ideanet_posts')
    .select('created_at')
    .eq('id', post_id)
    .single()

  const hotScore = calcHotScore(upvotes, downvotes, post?.created_at || new Date().toISOString())

  await supabaseAdmin
    .from('ideanet_posts')
    .update({ upvotes, downvotes, hot_score: hotScore })
    .eq('id', post_id)

  return NextResponse.json({ success: true, upvotes, downvotes })
}
