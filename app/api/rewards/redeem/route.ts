export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { triggerWebhook } from '@/lib/webhooks'

export async function POST(req: NextRequest) {
  try {
    const { customer_id, shop_id, reward_id, pin } = await req.json()

    if (!customer_id || !shop_id || !pin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Verify PIN
    const { data: shop } = await supabase
      .from('shops')
      .select('id, name, staff_pin')
      .eq('id', shop_id)
      .single()

    if (!shop || shop.staff_pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('id, name, email')
      .eq('id', customer_id)
      .eq('shop_id', shop_id)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Find unclaimed reward
    const query = supabase
      .from('rewards')
      .select('id')
      .eq('customer_id', customer_id)
      .is('redeemed_at', null)

    if (reward_id) query.eq('id', reward_id)

    const { data: reward } = await query.limit(1).single()

    if (!reward) {
      return NextResponse.json({ error: 'No available reward to redeem' }, { status: 404 })
    }

    const redeemedAt = new Date().toISOString()

    await supabase
      .from('rewards')
      .update({ redeemed_at: redeemedAt })
      .eq('id', reward.id)

    triggerWebhook(shop_id, 'reward_redeemed', {
      customer_name: customer.name,
      customer_email: customer.email,
      shop_name: shop.name,
      redeemed_at: redeemedAt,
    })

    return NextResponse.json({ success: true, redeemed_at: redeemedAt })
  } catch (err) {
    console.error('Redeem error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
