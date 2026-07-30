import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'
import { cleanStr, optStr, isPhone, rateLimit } from '@/lib/validate'

// ── Server-side product catalog: prices can NOT be set by the client ──
const CATALOG: Record<string, { name: string; price: number; sizes?: string[] }> = {
  'aisca-tshirt-black': {
    name: 'AISCA Official T-Shirt Black Edition',
    price: 2500,
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  },
  'aisca-blazerpin': { name: 'AISCA Gold Blazer Pin', price: 1500 },
  'aisca-wristband': { name: 'AISCA Wristband Black Edition', price: 400 }
}

const DELIVERY_FEE = 350
const MAX_QUANTITY = 20

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(req, 'orders', 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many orders. Please try again later.' }, { status: 429 })
    }

    const body = await req.json()

    // ── Validate against server-side catalog ──
    const product = CATALOG[body.product_id]
    if (!product) {
      return NextResponse.json({ error: 'Unknown product.' }, { status: 400 })
    }

    const quantity = Number(body.quantity || 1)
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return NextResponse.json({ error: `Quantity must be between 1 and ${MAX_QUANTITY}.` }, { status: 400 })
    }

    const size = body.size ? cleanStr(body.size, 10) : null
    if (product.sizes && (!size || !product.sizes.includes(size))) {
      return NextResponse.json({ error: 'Please select a valid size.' }, { status: 400 })
    }

    if (body.delivery_method !== 'delivery' && body.delivery_method !== 'event_pickup') {
      return NextResponse.json({ error: 'Invalid delivery method.' }, { status: 400 })
    }

    const customer_name = cleanStr(body.customer_name, 120)
    if (!customer_name) {
      return NextResponse.json({ error: 'Please provide your name.' }, { status: 400 })
    }
    if (!isPhone(body.customer_phone)) {
      return NextResponse.json({ error: 'Please provide a valid phone number.' }, { status: 400 })
    }
    const customer_address = optStr(body.customer_address, 500)
    if (body.delivery_method === 'delivery' && !customer_address) {
      return NextResponse.json({ error: 'Please provide a delivery address.' }, { status: 400 })
    }

    // ── Server-computed pricing ──
    const orderNumber = `AISCA-ORD-${Date.now()}`
    const deliveryFee = body.delivery_method === 'delivery' ? DELIVERY_FEE : 0
    const totalAmount = product.price * quantity + deliveryFee

    const cleanPayload = {
      order_number: orderNumber,
      product_id: body.product_id,
      product_name: product.name,
      size: size || null,
      quantity,
      unit_price: product.price,
      delivery_method: body.delivery_method,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      customer_name,
      customer_address: customer_address || null,
      customer_phone: (body.customer_phone as string).trim(),
      notes: optStr(body.notes, 1000) || null
    }

    const { data, error } = await supabaseAdmin
      .from('product_orders')
      .insert([cleanPayload])
      .select()
      .single()

    if (error) {
      console.error('Database insert error in product orders:', error.message)
      return NextResponse.json({ error: 'Order could not be saved. Please try again.' }, { status: 500 })
    }

    // Send Telegram notification
    try {
      await sendTelegram(
        `🛍️ *NEW PRODUCT ORDER*\n\n` +
        `📦 *Order No*: ${orderNumber}\n` +
        `🛒 *Product*: ${product.name}\n` +
        `📏 *Size*: ${size || 'N/A'}\n` +
        `🔢 *Quantity*: ${quantity}\n` +
        `💰 *Total*: LKR ${totalAmount.toLocaleString()}\n` +
        `🚚 *Delivery*: ${body.delivery_method === 'delivery' ? `Home Delivery (+LKR ${DELIVERY_FEE})` : 'AISCA Event Pickup (Free)'}\n` +
        `👤 *Customer*: ${customer_name}\n` +
        `📱 *Phone*: ${cleanPayload.customer_phone}\n` +
        `📍 *Address*: ${customer_address || 'N/A'}\n` +
        `💳 *Payment*: Bank Transfer Pending\n` +
        `🕐 *Ordered*: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`
      )
    } catch (tgErr) {
      console.error('Telegram notification failed in orders route:', tgErr)
    }

    return NextResponse.json({ success: true, orderNumber, totalAmount })
  } catch (err: any) {
    console.error('Internal server error in orders route:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
