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
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminUser || adminUser.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, slug, primary_color, stamps_required, reward_description } = await req.json()

    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 })
    }

    const { data: shop, error } = await service
      .from('shops')
      .insert({
        name,
        slug,
        primary_color: primary_color || '#6B3F1A',
        stamps_required: stamps_required || 9,
        reward_description: reward_description || 'Free coffee of your choice',
        staff_pin: '1234',
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'A shop with this slug already exists' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ shop }, { status: 201 })
  } catch (err) {
    console.error('Create shop error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
