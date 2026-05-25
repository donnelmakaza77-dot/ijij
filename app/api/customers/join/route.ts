export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, getShopBySlug } from '@/lib/supabase'
import { triggerWebhook } from '@/lib/webhooks'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, shopSlug } = await req.json()

    if (!name || !email || !shopSlug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const shop = await getShopBySlug(shopSlug)
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    const supabase = createServiceClient()

    // Check for existing customer
    const { data: existing } = await supabase
      .from('customers')
      .select('id, pass_serial')
      .eq('shop_id', shop.id)
      .eq('email', email)
      .single()

    if (existing) {
      const passUrl = existing.pass_serial
        ? `/api/passes/generate?customer_id=${existing.id}`
        : null
      return NextResponse.json({
        customerId: existing.id,
        passUrl,
        existing: true,
        message: 'Welcome back! You already have a loyalty card with us.',
      })
    }

    const passSerial = uuidv4()

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({ shop_id: shop.id, name, email, phone: phone || null, pass_serial: passSerial })
      .select()
      .single()

    if (customerError || !customer) {
      console.error('Customer insert error:', customerError)
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
    }

    // Trigger welcome webhook (non-blocking)
    triggerWebhook(shop.id, 'customer_signup', {
      customer_name: name,
      customer_email: email,
      shop_name: shop.name,
    })

    const passUrl = `/api/passes/generate?customer_id=${customer.id}`

    return NextResponse.json({ customerId: customer.id, passUrl, existing: false })
  } catch (err) {
    console.error('Join error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
