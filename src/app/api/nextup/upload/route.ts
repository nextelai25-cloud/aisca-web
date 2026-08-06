import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { rateLimit } from '@/lib/validate'

// Photo / document upload for NextUp applications.
// One file per request; the client uploads each selected file and collects
// the returned URLs. Images or PDFs, up to 10 MB, stored under nextup/.
const ALLOWED: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'application/pdf': 'pdf',
}
const MAX_SIZE = 10 * 1024 * 1024

export async function POST(req: NextRequest) {
  if (!rateLimit(req, 'nextup-upload', 60, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many uploads. Please try again later.' }, { status: 429 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 })

  const ext = ALLOWED[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Only JPG, PNG, WEBP, HEIC images or PDF files are allowed.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Each file must be smaller than 10 MB.' }, { status: 400 })
  }

  const fileName = `nextup/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage
    .from('aisca-assets')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) {
    console.error('[nextup/upload] storage error:', error.message)
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 })
  }

  const { data: urlData } = supabaseAdmin.storage.from('aisca-assets').getPublicUrl(fileName)
  return NextResponse.json({ url: urlData.publicUrl, filename: file.name })
}
