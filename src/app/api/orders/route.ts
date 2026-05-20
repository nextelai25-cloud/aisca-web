import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendTelegram } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    const orderNumber = `AISCA-ORD-${Date.now()}`
    const deliveryFee = body.delivery_method === 'delivery' ? 350 : 0
    const totalAmount = (Number(body.unit_price) * Number(body.quantity || 1)) + deliveryFee
    
    // Filter payload to database-supported columns
    const cleanPayload = {
      order_number: orderNumber,
      product_id: body.product_id,
      product_name: body.product_name,
      size: body.size || null,
      quantity: Number(body.quantity || 1),
      unit_price: Number(body.unit_price),
      delivery_method: body.delivery_method,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      customer_name: body.customer_name,
      customer_address: body.customer_address || null,
      customer_phone: body.customer_phone,
      notes: body.notes || null
    }
    
    const { data, error } = await supabaseAdmin
      .from('product_orders')
      .insert([cleanPayload])
      .select()
      .single()
    
    if (error) {
      console.error("Database insert error in product orders:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    // Send Telegram notification
    try {
      await sendTelegram(
        `🛍️ *NEW PRODUCT ORDER*\n\n` +
        `📦 *Order No*: ${orderNumber}\n` +
        `🛒 *Product*: ${body.product_name}\n` +
        `📏 *Size*: ${body.size || 'N/A'}\n` +
        `🔢 *Quantity*: ${body.quantity || 1}\n` +
        `💰 *Total*: LKR ${totalAmount.toLocaleString()}\n` +
        `🚚 *Delivery*: ${body.delivery_method === 'delivery' ? 'Home Delivery (+LKR 350)' : 'AISCA Event Pickup (Free)'}\n` +
        `👤 *Customer*: ${body.customer_name}\n` +
        `📱 *Phone*: ${body.customer_phone}\n` +
        `📍 *Address*: ${body.customer_address || 'N/A'}\n` +
        `💳 *Payment*: Bank Transfer Pending\n` +
        `🕐 *Ordered*: ${new Date().toLocaleString('en-LK', { timeZone: 'Asia/Colombo' })}`
      )
    } catch (tgErr) {
      console.error("Telegram notification failed in orders route:", tgErr);
    }
    
    return NextResponse.json({ success: true, orderNumber, totalAmount })
  } catch (err: any) {
    console.error("Internal server error in orders route:", err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
