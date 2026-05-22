export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { triggerWebhook } from '@/lib/webhooks'

export async function POST(req: NextRequest) {
  try {
    const { customer_id, shop_id, pin, stamped_by } = await req.json()

    if (!customer_id || !shop_id || !pin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createServiceClient()

    // Verify PIN
    const { data: shop } = await supabase
      .from('shops')
      .select('id, name, staff_pin, stamps_required, reward_description')
      .eq('id', shop_id)
      .single()

    if (!shop || shop.staff_pin !== pin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    // Verify customer belongs to this shop
    const { data: customer } = await supabase
      .from('customers')
      .select('id, name, email, shop_id')
      .eq('id', customer_id)
      .eq('shop_id', shop_id)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    // Add stamp
    const { error: stampError } = await supabase.from('stamps').insert({
      customer_id,
      shop_id,
      stamped_by: stamped_by || 'staff',
    })

    if (stampError) {
      return NextResponse.json({ error: 'Failed to add stamp' }, { status: 500 })
    }

    // Get new total
    const { count: stampCount } = await supabase
      .from('stamps')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer_id)

    const total = stampCount || 0

    // Fire stamp_added webhook
    triggerWebhook(shop_id, 'stamp_added', {
      customer_name: customer.name,
      customer_email: customer.email,
      stamp_count: total,
      stamps_required: shop.stamps_required,
      shop_name: shop.name,
    })

    // Every 5 stamps → milestone webhook
    if (total > 0 && total % 5 === 0 && total < shop.stamps_required) {
      triggerWebhook(shop_id, 'milestone_reached', {
        customer_name: customer.name,
        customer_email: customer.email,
        stamp_count: total,
        shop_name: shop.name,
      })
    }

    // Reward unlocked
    if (total === shop.stamps_required) {
      await supabase.from('rewards').insert({ customer_id, shop_id })
      triggerWebhook(shop_id, 'reward_unlocked', {
        customer_name: customer.name,
        customer_email: customer.email,
        reward_description: shop.reward_description,
        shop_name: shop.name,
      })
    }

    return NextResponse.json({ success: true, stamp_count: total })
  } catch (err) {
    console.error('Stamp add error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
