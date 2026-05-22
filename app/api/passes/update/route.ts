export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generatePass, certsAvailable } from '@/lib/passkit'

export async function POST(req: NextRequest) {
  try {
    const { customer_id } = await req.json()
    if (!customer_id) {
      return NextResponse.json({ error: 'Missing customer_id' }, { status: 400 })
    }

    if (!certsAvailable()) {
      return NextResponse.json({ error: 'Certs not configured', setup_required: true }, { status: 503 })
    }

    const supabase = createServiceClient()

    const { data: customer } = await supabase
      .from('customers')
      .select('*, shops(*)')
      .eq('id', customer_id)
      .single()

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const shop = (customer as { shops: Record<string, unknown> }).shops as {
      id: string
      name: string
      slug: string
      logo_url: string | null
      primary_color: string
      stamps_required: number
    }

    const { count: stampCount } = await supabase
      .from('stamps')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customer_id)

    const passBuffer = await generatePass({
      serialNumber: customer.pass_serial || customer_id,
      customerName: customer.name,
      shopName: shop.name,
      stampCount: stampCount || 0,
      stampsRequired: shop.stamps_required,
      shopSlug: shop.slug,
      customerId: customer.id,
      primaryColor: shop.primary_color,
    })

    return new NextResponse(new Uint8Array(passBuffer), {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${shop.slug}-loyalty.pkpass"`,
      },
    })
  } catch (err) {
    console.error('Pass update error:', err)
    return NextResponse.json({ error: 'Failed to update pass' }, { status: 500 })
  }
}
