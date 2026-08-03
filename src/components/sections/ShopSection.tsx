'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Trash2, Upload, CheckCircle2, X, Ruler } from 'lucide-react'

// Display catalog (prices are re-verified server-side on submit)
const PRODUCTS = [
  { id: 'aisca-tshirt-black', name: 'AISCA T-Shirt', sub: 'Black Edition', price: 2500, image: '/shop/tshirt-1.webp', image2: '/shop/tshirt-2.webp', sized: true },
  { id: 'aisca-blazerpin', name: 'AISCA Blazer Pin', sub: 'Gold Finish', price: 1600, image: '/shop/blazer-pin.webp', sized: false },
  { id: 'aisca-wristband', name: 'AISCA Wrist Band', sub: 'Black Edition', price: 300, image: '/shop/wristband.webp', sized: false },
] as const

const SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
const DELIVERY_FEE = 250
const GOLD = '#ffffff' // monochrome accent (site has no colour accent)
const MUTED = 'rgba(255,255,255,0.45)'

const BANK = {
  account: '1069 6100 6902',
  name: 'ALL ISLAND SCHOOLS COMMERCE ASSOCIATION',
  bank: 'SAMPATH BANK',
  branch: 'HOMAGAMA',
}
const CONTACTS = [
  { name: 'Risandu', phone: '+94 76 282 5357' },
  { name: 'Ranuth', phone: '+94 71 887 4008' },
]

const money = (n: number) => `Rs. ${n.toLocaleString()}`

// Shorten long receipt filenames (they overflow the row on mobile otherwise),
// keeping the extension visible.
function shortName(name: string, max = 26): string {
  if (!name) return 'Receipt uploaded'
  if (name.length <= max) return name
  const dot = name.lastIndexOf('.')
  const ext = dot > 0 ? name.slice(dot) : ''
  const base = dot > 0 ? name.slice(0, dot) : name
  const keep = Math.max(6, max - ext.length - 1)
  return base.slice(0, keep) + '…' + ext
}

// Tell Lenis smooth-scroll to recompute after the page height changes,
// otherwise (on mobile) the scroll limit goes stale and the page looks
// cut off / unscrollable. We call Lenis.resize() directly (a plain resize
// event is not always enough) a few times across paints to be safe.
function nudgeScroll() {
  const run = () => {
    try {
      const lenis = (window as unknown as { __lenis?: { resize: () => void } }).__lenis
      lenis?.resize()
      window.dispatchEvent(new Event('resize'))
    } catch {}
  }
  requestAnimationFrame(run)
  setTimeout(run, 150)
  setTimeout(run, 450)
}

export default function ShopSection() {
  const [teeSize, setTeeSize] = useState('M')
  const [qty, setQty] = useState<Record<string, number>>({ 'aisca-tshirt-black': 0, 'aisca-blazerpin': 0, 'aisca-wristband': 0 })

  // customer
  const [form, setForm] = useState({
    customer_name: '', customer_email: '', school_name: '',
    customer_address: '', customer_phone: '', delivery_contact: '', notes: '',
  })

  // receipt
  const [receiptUrl, setReceiptUrl] = useState('')
  const [receiptName, setReceiptName] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // ui
  const [sizeChartOpen, setSizeChartOpen] = useState(false)
  const [gallery, setGallery] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState<{ orderNumber: string; total: number } | null>(null)

  const setField = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  const bump = (id: string, d: number) => setQty(q => ({ ...q, [id]: Math.max(0, Math.min(50, (q[id] || 0) + d)) }))

  // Build order lines
  const lines = useMemo(() => {
    const out: { product_id: string; name: string; size: string | null; quantity: number; unit_price: number; line_total: number }[] = []
    for (const p of PRODUCTS) {
      const n = qty[p.id] || 0
      if (n <= 0) continue
      out.push({
        product_id: p.id,
        name: p.sized ? 'AISCA T-Shirt (Black Edition)' : p.name,
        size: p.sized ? teeSize : null,
        quantity: n,
        unit_price: p.price,
        line_total: p.price * n,
      })
    }
    return out
  }, [qty, teeSize])

  const itemsTotal = lines.reduce((s, l) => s + l.line_total, 0)
  const hasItems = lines.length > 0
  const total = itemsTotal + (hasItems ? DELIVERY_FEE : 0)

  // Recompute the smooth-scroll height whenever the page grows or shrinks
  // (items added/removed, receipt uploaded, error shown).
  useEffect(() => { nudgeScroll() }, [lines.length, receiptUrl, error, done])

  async function handleReceipt(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/merch/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok && data.url) {
        setReceiptUrl(data.url)
        setReceiptName(data.filename || file.name)
        nudgeScroll()
      } else {
        setError(data.error || 'Receipt upload failed.')
      }
    } catch {
      setError('Receipt upload failed. Check your connection.')
    } finally {
      setUploading(false)
    }
  }

  async function submit() {
    setError('')
    if (!hasItems) { setError('Please add at least one item to your order.'); return }
    if (!form.customer_name.trim()) { setError('Please enter your name.'); return }
    if (form.customer_phone.replace(/\D/g, '').length < 9) { setError('Please enter a valid WhatsApp number.'); return }
    if (!form.customer_address.trim()) { setError('Please enter your delivery address.'); return }
    if (!receiptUrl) { setError('Please upload your payment receipt.'); return }

    setSubmitting(true)
    try {
      const res = await fetch('/api/merch/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: lines.map(l => ({ product_id: l.product_id, size: l.size, quantity: l.quantity })),
          receipt_url: receiptUrl,
          receipt_filename: receiptName,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setDone({ orderNumber: data.orderNumber, total: data.totalAmount })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setError(data.error || 'Could not place order. Please try again.')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <section style={{ background: '#050505', padding: '40px 0 110px' }}>
        <div style={{ maxWidth: 620, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            style={{ borderRadius: 24, padding: 'clamp(28px,5vw,48px)', background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.3)`, backdropFilter: 'blur(20px)' }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
              <CheckCircle2 size={30} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Order Received</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
              Thank you! Your order has been submitted with your payment receipt. It will be confirmed after our team verifies the payment. You&apos;ll be contacted on WhatsApp.
            </p>
            <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, padding: '14px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.08)', border: `1px solid rgba(255,255,255,0.3)`, marginBottom: 22 }}>
              <span style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUTED, fontWeight: 700 }}>Order Number</span>
              <span style={{ fontFamily: 'monospace', fontSize: 18, color: '#fff', fontWeight: 700 }}>{done.orderNumber}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Total Paid: {money(done.total)}</span>
            </div>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>
              Questions? {CONTACTS.map((c, i) => <span key={c.name}>{c.name} {c.phone}{i < CONTACTS.length - 1 ? ' · ' : ''}</span>)}
            </p>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section style={{ background: '#050505', padding: '64px 0 110px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 200, right: '18%', width: 500, height: 500, background: 'rgba(255,255,255,0.02)', borderRadius: '50%', filter: 'blur(110px)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 10 }}>
        {/* header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: MUTED, marginBottom: 14 }}>Official Merchandise</span>
          <h1 style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 'clamp(2rem, 5vw, 3.4rem)', fontWeight: 800, textTransform: 'uppercase', color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 14 }}>
            AISCA Merchandise Collection
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', maxWidth: 620, margin: '0 auto', lineHeight: 1.7 }}>
            The official merchandise order form of the All Island Schools Commerce Association. Choose your items, pay by bank transfer, and upload your receipt, all in one place.
          </p>
        </div>

        {/* info strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 44 }}>
          {[
            { label: 'Order Closing Date', value: 'Orders close after 25th August' },
            { label: 'Estimated Delivery', value: 'Delivered within September' },
            { label: 'Need Help?', value: CONTACTS.map(c => `${c.name} ${c.phone}`).join('  ·  ') },
          ].map((c) => (
            <div key={c.label} style={{ padding: '16px 18px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, fontWeight: 700, marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.55 }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* products */}
        <h2 style={sectionTitle}>1 · Choose your items</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 44 }}>
          {PRODUCTS.map((p) => {
            const imgs = [p.image, ...(('image2' in p && p.image2) ? [p.image2] : [])]
            const gi = gallery[p.id] || 0
            return (
              <div key={p.id} style={{ borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', aspectRatio: '1', background: '#0c0c0c' }}>
                  <img src={imgs[gi]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {imgs.length > 1 && (
                    <button onClick={() => setGallery(g => ({ ...g, [p.id]: (gi + 1) % imgs.length }))}
                      style={{ position: 'absolute', bottom: 10, right: 10, padding: '5px 10px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: '#fff', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>
                      {gi + 1}/{imgs.length} · VIEW
                    </button>
                  )}
                </div>
                <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)', fontSize: 16, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 2 }}>{p.sub}</div>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: GOLD }}>{money(p.price)}</div>

                  {p.sized && (
                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <button onClick={() => setSizeChartOpen(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start', fontSize: 11, color: '#fff', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', padding: '7px 13px', borderRadius: 999, cursor: 'pointer', fontWeight: 700 }}>
                        <Ruler size={13} /> View size chart
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>Size</span>
                        <select value={teeSize} onChange={e => setTeeSize(e.target.value)} className="shop-input" style={{ flex: 1 }}>
                          {SIZES.map(s => <option key={s} value={s} style={{ background: '#111' }}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: p.sized ? 0 : 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '8px 10px' }}>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Quantity</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button onClick={() => bump(p.id, -1)} style={stepBtn}><Minus size={14} /></button>
                      <span style={{ minWidth: 22, textAlign: 'center', color: '#fff', fontSize: 15, fontWeight: 700 }}>{qty[p.id] || 0}</span>
                      <button onClick={() => bump(p.id, 1)} style={stepBtn}><Plus size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ marginBottom: 44 }} />

        {/* two-column: summary + details */}
        <div className="shop-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 28, alignItems: 'start' }}>
          {/* LEFT: order summary */}
          <div>
            <h2 style={sectionTitle}>2 · Your order</h2>
            <div style={{ borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: 20 }}>
              {!hasItems ? (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '18px 0' }}>No items yet. Set a quantity above to begin.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {lines.map((l) => (
                    <div key={l.product_id} style={rowStyle}>
                      <div>
                        <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 600 }}>{l.name}</div>
                        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.45)' }}>{l.size ? `Size ${l.size} · ` : ''}Qty {l.quantity}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ color: '#fff', fontSize: 13 }}>{money(l.line_total)}</span>
                        <button onClick={() => setQty(q => ({ ...q, [l.product_id]: 0 }))} style={delBtn}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}

                  <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
                    <span>Items subtotal</span><span>{money(itemsTotal)}</span>
                  </div>
                  {/* highlighted delivery row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#fff', fontWeight: 600, padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
                    <span>Delivery charge <span style={{ color: 'rgba(255,255,255,0.5)', fontWeight: 400, fontSize: 11.5 }}>(within September)</span></span>
                    <span>{money(DELIVERY_FEE)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 800, color: GOLD, marginTop: 4 }}>
                    <span>Total Payable</span><span>{money(total)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* bank details */}
            <h2 style={{ ...sectionTitle, marginTop: 32 }}>3 · Pay by bank transfer</h2>
            <div style={{ borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: 20 }}>
              <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 14 }}>
                Deposit or transfer the <strong style={{ color: '#fff' }}>total payable amount</strong> to the account below, then upload your receipt in the next step.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 16, borderRadius: 14, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.25)' }}>
                {[['Account No', BANK.account], ['Account Name', BANK.name], ['Bank', BANK.bank], ['Branch', BANK.branch]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: MUTED, fontWeight: 700 }}>{k}</span>
                    <span style={{ fontSize: k === 'Account No' ? 17 : 13, color: '#fff', fontWeight: k === 'Account No' ? 800 : 500, fontFamily: k === 'Account No' ? 'monospace' : 'inherit' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: details + receipt + submit */}
          <div>
            <h2 style={sectionTitle}>4 · Delivery details</h2>
            <div style={{ borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: 'clamp(18px,3vw,26px)', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <Field label="Full Name" required><input className="shop-input" value={form.customer_name} onChange={e => setField('customer_name', e.target.value)} placeholder="Your full name" /></Field>
                <Field label="Email"><input className="shop-input" type="email" value={form.customer_email} onChange={e => setField('customer_email', e.target.value)} placeholder="you@email.com" /></Field>
              </div>
              <Field label="School Name"><input className="shop-input" value={form.school_name} onChange={e => setField('school_name', e.target.value)} placeholder="Your school / society" /></Field>
              <Field label="Delivery Address" required><textarea className="shop-input" rows={2} style={{ resize: 'none' }} value={form.customer_address} onChange={e => setField('customer_address', e.target.value)} placeholder="Full delivery address" /></Field>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <Field label="WhatsApp Number" required><input className="shop-input" value={form.customer_phone} onChange={e => setField('customer_phone', e.target.value)} placeholder="+94 7X XXX XXXX" /></Field>
                <Field label="Delivery Contact (to call)"><input className="shop-input" value={form.delivery_contact} onChange={e => setField('delivery_contact', e.target.value)} placeholder="Number to call on delivery" /></Field>
              </div>
              <Field label="Notes (optional)"><textarea className="shop-input" rows={2} style={{ resize: 'none' }} value={form.notes} onChange={e => setField('notes', e.target.value)} placeholder="Group order details, sizes per person, anything else…" /></Field>
            </div>

            {/* receipt */}
            <h2 style={{ ...sectionTitle, marginTop: 32 }}>5 · Upload payment receipt</h2>
            <div style={{ borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: 20 }}>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleReceipt} style={{ display: 'none' }} />
              {!receiptUrl ? (
                <button onClick={() => fileRef.current?.click()} disabled={uploading}
                  style={{ width: '100%', padding: '22px', borderRadius: 14, border: '1.5px dashed rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', color: GOLD, cursor: uploading ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <Upload size={22} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{uploading ? 'Uploading…' : 'Upload bank slip / screenshot'}</span>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Image or PDF, up to 10 MB</span>
                </button>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '14px 16px', borderRadius: 12, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)', minWidth: 0, maxWidth: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <CheckCircle2 size={18} style={{ color: '#22c55e', flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{shortName(receiptName)}</span>
                  </div>
                  <button onClick={() => { setReceiptUrl(''); setReceiptName(''); nudgeScroll() }} style={{ ...delBtn }}><X size={15} /></button>
                </div>
              )}
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.4)', marginTop: 12, lineHeight: 1.6 }}>
                Orders are confirmed only after successful payment verification.
              </p>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: MUTED, fontWeight: 700, marginBottom: 8 }}>
                  Need help? Contact
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {CONTACTS.map((c) => (
                    <a key={c.name} href={`tel:${c.phone.replace(/\s/g, '')}`}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', textDecoration: 'none' }}>
                      <span style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>{c.name}</span>
                      <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{c.phone}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {error && <p style={{ color: '#f87171', fontSize: 13, textAlign: 'center', marginTop: 16 }}>⚠️ {error}</p>}

            <button onClick={submit} disabled={submitting} className="shop-submit">
              {submitting ? 'Placing order…' : `Confirm order · ${money(total)}`}
            </button>
          </div>
        </div>
      </div>

      {/* size chart modal */}
      <AnimatePresence>
        {sizeChartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSizeChartOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
              onClick={e => e.stopPropagation()} style={{ maxWidth: 620, width: '100%', background: '#0d0d0d', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>T-Shirt Size Chart</span>
                <button onClick={() => setSizeChartOpen(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}><X size={18} /></button>
              </div>
              <img src="/shop/tshirt-size-chart.webp" alt="Size chart" style={{ width: '100%', display: 'block', background: '#fff' }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .shop-grid > div { min-width: 0; }
        @media (min-width: 980px) { .shop-grid { grid-template-columns: 5fr 6fr; gap: 40px; } }
        .shop-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 11px 13px;
          font-size: 14px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          font-family: inherit;
        }
        .shop-input::placeholder { color: rgba(255,255,255,0.3); }
        .shop-input:focus { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.06); }
        .shop-submit {
          width: 100%; margin-top: 20px; min-height: 54px; border: none; border-radius: 14px;
          background: #ffffff; color: #000; font-weight: 800; font-size: 14px; letter-spacing: 0.04em;
          text-transform: uppercase; cursor: pointer; transition: background 0.2s, transform 0.2s;
        }
        .shop-submit:hover:not(:disabled) { background: #ececec; transform: translateY(-1px); }
        .shop-submit:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </section>
  )
}

const sectionTitle: React.CSSProperties = {
  fontFamily: 'var(--font-display, "Space Grotesk", sans-serif)',
  fontSize: 15, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
  color: '#fff', marginBottom: 16,
}
const stepBtn: React.CSSProperties = {
  width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer',
}
const delBtn: React.CSSProperties = {
  width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', flexShrink: 0,
}
const rowStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  padding: '10px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)',
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginBottom: 8 }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
    </div>
  )
}
