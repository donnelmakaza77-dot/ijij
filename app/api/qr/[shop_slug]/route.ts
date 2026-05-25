export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getShopBySlug } from '@/lib/supabase'
import { generateQRCodePNG } from '@/lib/qr'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shop_slug: string }> }
) {
  try {
    const { shop_slug } = await params
    const shop = await getShopBySlug(shop_slug)
    if (!shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.get('host')}`
    const url = `${baseUrl}/${shop_slug}`
    const qrBuffer = await generateQRCodePNG(url)

    return new NextResponse(new Uint8Array(qrBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Content-Disposition': `inline; filename="${shop_slug}-qr.png"`,
      },
    })
  } catch (err) {
    console.error('QR generation error:', err)
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 })
  }
}
