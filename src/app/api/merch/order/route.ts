import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'
import { cleanStr, optStr, isPhone, isEmail, rateLimit } from '@/lib/validate'

// ── Server-authoritative catalog: the client can NEVER set prices ──
const CATALOG: Record<string, { name: string; price: number; sized?: boolean }> = {
  'aisca-tshirt-black': { name: 'AISCA T-Shirt — Black Edition', price: 2500, sized: true },
  'aisca-wristband': { name: 'AISCA Wrist Band', price: 300 },
  'aisca-blazerpin': { name: 'AISCA Blazer Pin', price: 1600 },
}
const SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL']
const DELIVERY_FEE = 250
const MAX_QTY_PER_ITEM = 50
const MAX_LINES = 12

interface LineIn { product_id?: string; size?: string; quantity?: unknown }

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(req, 'merch-order', 12, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many orders from this connection. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()

    // ── Items ──
    const rawItems: LineIn[] = Array.isArray(body.items) ? body.items : []
    if (rawItems.length === 0) {
      return NextResponse.json({ error: 'Please add at least one product to your order.' }, { status: 400 })
    }
    if (rawItems.length > MAX_LINES) {
      return NextResponse.json({ error: 'Too many line items in one order.' }, { status: 400 })
    }

    const items: {
      product_id: string; name: string; size: string | null
      quantity: number; unit_price: number; line_total: number
    }[] = []
    let itemsTotal = 0

    for (const raw of rawItems) {
      const product = raw.product_id ? CATALOG[raw.product_id] : undefined
      if (!product || !raw.product_id) {
        return NextResponse.json({ error: 'Your order contains an unknown product.' }, { status: 400 })
      }
      const quantity = Number(raw.quantity ?? 1)
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY_PER_ITEM) {
        return NextResponse.json({ error: `Quantity for ${product.name} must be between 1 and ${MAX_QTY_PER_ITEM}.` }, { status: 400 })
      }
      let size: string | null = null
      if (product.sized) {
        size = typeof raw.size === 'string' ? raw.size.toUpperCase() : ''
        if (!size || !SIZES.includes(size)) {
          return NextResponse.json({ error: `Please choose a valid size for the ${product.name}.` }, { status: 400 })
        }
      }
      const line_total = product.price * quantity
      itemsTotal += line_total
      items.push({ product_id: raw.product_id, name: product.name, size, quantity, unit_price: product.price, line_total })
    }

    // ── Customer ──
    const customer_name = cleanStr(body.customer_name, 120)
    if (!customer_name) return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 })

    if (!isPhone(body.customer_phone)) {
      return NextResponse.json({ error: 'Please provide a valid WhatsApp number.' }, { status: 400 })
    }
    const customer_address = cleanStr(body.customer_address, 500)
    if (!customer_address) return NextResponse.json({ error: 'Please provide a delivery address.' }, { status: 400 })

    const customer_email = optStr(body.customer_email, 254)
    if (customer_email && !isEmail(customer_email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 })
    }
    const school_name = optStr(body.school_name, 160) || null
    const delivery_contact = optStr(body.delivery_contact, 60) || null
    const notes = optStr(body.notes, 1000) || null

    // ── Receipt (required — payment must be uploaded) ──
    const receipt_url = optStr(body.receipt_url, 600)
    if (!receipt_url || !/^https?:\/\//.test(receipt_url)) {
      return NextResponse.json({ error: 'Please upload your payment receipt before submitting.' }, { status: 400 })
    }
    const receipt_filename = optStr(body.receipt_filename, 200) || null

    // ── Totals (server-computed) ──
    const total_amount = itemsTotal + DELIVERY_FEE
    const order_number = `AISCA-MRC-${Date.now()}`

    const payload = {
      order_number,
      customer_name,
      customer_email: customer_email || null,
      school_name,
      customer_phone: (body.customer_phone as string).trim(),
      delivery_contact,
      customer_address,
      items,
      items_total: itemsTotal,
      delivery_fee: DELIVERY_FEE,
      total_amount,
      receipt_url,
      receipt_filename,
      notes,
    }

    const { error } = await supabaseAdmin.from('merch_orders').insert([payload])
    if (error) {
      console.error('[merch/order] insert error:', error.message)
      return NextResponse.json({ error: 'Order could not be saved. Please try again.' }, { status: 500 })
    }

    // Telegram notify (best-effort)
    try {
      const itemLines = items.map(i => `   • ${i.name}${i.size ? ` (${i.size})` : ''} ×${i.quantity} = LKR ${i.line_total.toLocaleString()}`).join('\n')
      await sendTelegram(
        `🛍️ *NEW MERCHANDISE ORDER*\n\n` +
        `📦 *Order*: ${order_number}\n` +
        `${itemLines}\n` +
        `🚚 *Delivery*: LKR ${DELIVERY_FEE}\n` +
        `💰 *Total*: LKR ${total_amount.toLocaleString()}\n\n` +
        `👤 *Name*: ${customer_name}\n` +
        `🏫 *School*: ${school_name || 'N/A'}\n` +
        `📱 *WhatsApp*: ${payload.customer_phone}\n` +
        `📍 *Address*: ${customer_address}\n` +
        `🧾 *Receipt*: ${receipt_url}\n` +
        `🕐 ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`
      )
    } catch (tgErr) {
      console.error('[merch/order] telegram failed:', tgErr)
    }

    return NextResponse.json({ success: true, orderNumber: order_number, totalAmount: total_amount })
  } catch (err) {
    console.error('[merch/order] internal error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
