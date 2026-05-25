export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, getShopBySlug } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const customerId = req.nextUrl.searchParams.get('customer_id')
    const shopSlug = req.nextUrl.searchParams.get('shop_slug')

    if (!customerId || !shopSlug) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 })
    }

    const shop = await getShopBySlug(shopSlug)
    if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 })

    const supabase = createServiceClient()

    const { data: customer } = await supabase
      .from('customers')
      .select('id, name, email')
      .eq('id', customerId)
      .eq('shop_id', shop.id)
      .single()

    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 })

    const { count: stampCount } = await supabase
      .from('stamps')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId)

    const { data: rewards } = await supabase
      .from('rewards')
      .select('id, created_at')
      .eq('customer_id', customerId)
      .is('redeemed_at', null)

    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      shop: {
        id: shop.id,
        name: shop.name,
        primary_color: shop.primary_color,
        stamps_required: shop.stamps_required,
        reward_description: shop.reward_description,
      },
      stamp_count: stampCount || 0,
      has_reward: (rewards?.length || 0) > 0,
      available_rewards: rewards || [],
    })
  } catch (err) {
    console.error('Customer info error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
