import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyApprovedMember } from '@/lib/member'
import { rateLimit } from '@/lib/validate'

const ALLOWED_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif'
}
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'ideanet-upload', 20, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File
  const membershipNumber = formData.get('membership_number')

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  // ── Only verified members may upload ──
  const member = await verifyApprovedMember(membershipNumber)
  if (!member) {
    return NextResponse.json({ error: 'Invalid or unapproved membership number' }, { status: 403 })
  }

  // ── Images only, size capped, extension derived from MIME (not the filename) ──
  const ext = ALLOWED_TYPES[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Only JPG, PNG, WEBP, or GIF images are allowed.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Image must be smaller than 5 MB.' }, { status: 400 })
  }

  const fileName = `ideanet/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { error } = await supabaseAdmin.storage
    .from('aisca-assets')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error('IdeaNet upload error:', error.message)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage.from('aisca-assets').getPublicUrl(fileName)
  return NextResponse.json({ url: urlData.publicUrl })
}
