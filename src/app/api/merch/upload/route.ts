import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/validate'

// Payment receipt upload for merchandise orders.
// Accepts a single image or PDF, capped at 10 MB, stored in the existing
// `aisca-assets` bucket under merch-receipts/. Returns a public URL that the
// order submission then attaches to the order.
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'application/pdf': 'pdf',
}
const MAX_SIZE = 10 * 1024 * 1024 // 10 MB

export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'merch-upload', 600, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many uploads from this connection. Please wait a little and try again.' }, { status: 429 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

  const ext = ALLOWED[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Only JPG, PNG, WEBP, HEIC images or PDF files are allowed.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File must be smaller than 10 MB.' }, { status: 400 })
  }

  const fileName = `merch-receipts/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage
    .from('aisca-assets')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[merch/upload] storage error:', error.message)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage.from('aisca-assets').getPublicUrl(fileName)
  return NextResponse.json({ url: urlData.publicUrl, filename: file.name })
}
