import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import SuperadminClient from './SuperadminClient'

export default async function SuperadminPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const service = createServiceClient()
  const { data: adminUser } = await service
    .from('admin_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!adminUser || adminUser.role !== 'superadmin') redirect('/admin/dashboard')

  // Fetch all shops with stats
  const { data: shops } = await service
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false })

  // Get customer counts per shop
  const { data: customerCounts } = await service
    .from('customers')
    .select('shop_id')

  const countMap: Record<string, number> = {}
  customerCounts?.forEach((c) => {
    countMap[c.shop_id] = (countMap[c.shop_id] || 0) + 1
  })

  const shopsWithStats = (shops || []).map((s) => ({
    ...s,
    customer_count: countMap[s.id] || 0,
  }))

  return <SuperadminClient shops={shopsWithStats} />
}
