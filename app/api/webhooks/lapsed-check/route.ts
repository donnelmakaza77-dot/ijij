export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { triggerWebhook } from '@/lib/webhooks'

// Vercel cron: runs daily at 09:00 UTC
// Add to vercel.json: { "crons": [{ "path": "/api/webhooks/lapsed-check", "schedule": "0 9 * * *" }] }

const LAPSED_DAYS = 14

export async function GET(req: NextRequest) {
  // Simple secret check to prevent unauthorised triggers
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - LAPSED_DAYS)

    // Find customers whose last stamp is older than LAPSED_DAYS or who have never stamped
    const { data: shops } = await supabase.from('shops').select('id, name')
    if (!shops) return NextResponse.json({ processed: 0 })

    let processed = 0

    for (const shop of shops) {
      // Get all customers for this shop
      const { data: customers } = await supabase
        .from('customers')
        .select('id, name, email, created_at')
        .eq('shop_id', shop.id)

      if (!customers) continue

      for (const customer of customers) {
        // Get most recent stamp
        const { data: lastStamp } = await supabase
          .from('stamps')
          .select('stamped_at')
          .eq('customer_id', customer.id)
          .order('stamped_at', { ascending: false })
          .limit(1)
          .single()

        const lastActivity = lastStamp?.stamped_at || customer.created_at
        const lastDate = new Date(lastActivity)
        const daysSince = Math.floor(
          (Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysSince >= LAPSED_DAYS) {
          triggerWebhook(shop.id, 'customer_lapsed', {
            customer_name: customer.name,
            customer_email: customer.email,
            days_since_visit: daysSince,
            shop_name: shop.name,
          })
          processed++
        }
      }
    }

    return NextResponse.json({ processed, cutoff: cutoff.toISOString() })
  } catch (err) {
    console.error('Lapsed check error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
