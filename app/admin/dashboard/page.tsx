import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminNav from '@/components/AdminNav'
import Dashboard from '@/components/Dashboard'

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const service = createServiceClient()

  // Get admin's shop
  const { data: adminUser } = await service
    .from('admin_users')
    .select('shop_id, role')
    .eq('id', user.id)
    .single()

  if (!adminUser) redirect('/admin')

  const shopId = adminUser.shop_id

  const { data: shop } = await service
    .from('shops')
    .select('name, primary_color')
    .eq('id', shopId!)
    .single()

  // Stats
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const [
    { count: totalCustomers },
    { count: stampsThisWeek },
    { count: rewardsRedeemed },
  ] = await Promise.all([
    service.from('customers').select('id', { count: 'exact', head: true }).eq('shop_id', shopId!),
    service
      .from('stamps')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId!)
      .gte('stamped_at', oneWeekAgo.toISOString()),
    service
      .from('rewards')
      .select('id', { count: 'exact', head: true })
      .eq('shop_id', shopId!)
      .not('redeemed_at', 'is', null),
  ])

  // Lapsed: no stamp in 14+ days
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const { data: lapsedData } = await service
    .from('stamps')
    .select('customer_id')
    .eq('shop_id', shopId!)
    .gte('stamped_at', twoWeeksAgo.toISOString())

  const activeCustomerIds = new Set(lapsedData?.map((s) => s.customer_id) || [])
  const lapsedCount = (totalCustomers || 0) - activeCustomerIds.size

  // Recent stamps
  const { data: recentStamps } = await service
    .from('stamps')
    .select('id, stamped_at, stamped_by, customers(name, email)')
    .eq('shop_id', shopId!)
    .order('stamped_at', { ascending: false })
    .limit(10)

  const stats = [
    { label: 'Total Customers', value: totalCustomers || 0 },
    { label: 'Stamps This Week', value: stampsThisWeek || 0 },
    { label: 'Rewards Redeemed', value: rewardsRedeemed || 0 },
    { label: 'Lapsed (14+ days)', value: Math.max(0, lapsedCount), sub: 'No recent visit' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav shopName={shop?.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Dashboard stats={stats} />

        {/* Recent activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Stamp Activity</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {recentStamps?.length === 0 && (
              <p className="px-6 py-8 text-gray-400 text-sm text-center">No stamps yet.</p>
            )}
            {recentStamps?.map((stamp) => {
              const customer = stamp.customers as unknown as { name: string; email: string } | null
              return (
                <div key={stamp.id} className="px-6 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{customer?.name || '—'}</p>
                    <p className="text-xs text-gray-400">{customer?.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(stamp.stamped_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-400">by {stamp.stamped_by}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
