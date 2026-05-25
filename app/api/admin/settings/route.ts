export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data: adminUser } = await service
      .from('admin_users')
      .select('shop_id, role')
      .eq('id', user.id)
      .single()

    if (!adminUser || !['owner', 'superadmin'].includes(adminUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { shop_id, name, primary_color, stamps_required, reward_description, make_webhook_url, logo_url, staff_pin } = body

    // Ensure the admin owns this shop
    if (adminUser.role !== 'superadmin' && adminUser.shop_id !== shop_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { error } = await service
      .from('shops')
      .update({
        name,
        primary_color,
        stamps_required,
        reward_description,
        make_webhook_url: make_webhook_url || null,
        logo_url: logo_url || null,
        staff_pin,
      })
      .eq('id', shop_id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Settings update error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
