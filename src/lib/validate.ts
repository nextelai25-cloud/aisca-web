/**
 * Shared server-side validation + rate limiting helpers for API routes.
 */
import { NextRequest } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(v: unknown): v is string {
  return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v)
}

/** Returns trimmed string if valid, otherwise null. */
export function cleanStr(v: unknown, maxLen: number, minLen = 1): string | null {
  if (typeof v !== 'string') return null
  const t = v.trim()
  if (t.length < minLen || t.length > maxLen) return null
  return t
}

/** Optional string: '' / undefined / null allowed, otherwise trimmed + length capped. */
export function optStr(v: unknown, maxLen: number): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, maxLen)
}

/** Sri Lankan-ish phone: digits/spaces/+, 9-15 digits. */
export function isPhone(v: unknown): v is string {
  if (typeof v !== 'string') return false
  const digits = v.replace(/\D/g, '')
  return digits.length >= 9 && digits.length <= 15
}

/* ── Simple in-memory rate limiter (per-IP, per-bucket) ──
 * Good enough for a single-VPS deployment. Resets on process restart.
 */
const hits = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(
  req: NextRequest,
  bucket: string,
  limit: number,
  windowMs: number
): boolean {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  const key = `${bucket}:${ip}`
  const now = Date.now()
  const entry = hits.get(key)

  // Opportunistic cleanup to avoid unbounded growth
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k)
  }

  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  entry.count++
  return entry.count <= limit
}
