export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { generatePass, certsAvailable } from '@/lib/passkit'

export async function GET(req: NextRequest) {
  try {
    const customerId = req.nextUrl.searchParams.get('customer_id')
    if (!customerId) {
      return NextResponse.json({ error: 'Missing customer_id' }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: customer, error: custError } = await supabase
      .from('customers')
      .select('*, shops(*)')
      .eq('id', customerId)
      .single()

    if (custError || !customer) {
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
      .eq('customer_id', customerId)

    if (!certsAvailable()) {
      return NextResponse.json(
        {
          error:
            'Apple Wallet certificates not configured. See /certs directory and README for setup instructions.',
          setup_required: true,
        },
        { status: 503 }
      )
    }

    const passBuffer = await generatePass({
      serialNumber: customer.pass_serial || customerId,
      customerName: customer.name,
      shopName: shop.name,
      shopLogoUrl: shop.logo_url || undefined,
      stampCount: stampCount || 0,
      stampsRequired: shop.stamps_required,
      shopSlug: shop.slug,
      customerId: customer.id,
      primaryColor: shop.primary_color,
    })

    return new NextResponse(new Uint8Array(passBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="${shop.slug}-loyalty.pkpass"`,
      },
    })
  } catch (err) {
    console.error('Pass generation error:', err)
    return NextResponse.json({ error: 'Failed to generate pass' }, { status: 500 })
  }
}
