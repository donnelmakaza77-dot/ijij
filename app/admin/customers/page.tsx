import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminNav from '@/components/AdminNav'

export default async function AdminCustomers({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; filter?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const service = createServiceClient()
  const { data: adminUser } = await service
    .from('admin_users')
    .select('shop_id')
    .eq('id', user.id)
    .single()
  if (!adminUser) redirect('/admin')

  const shopId = adminUser.shop_id!
  const { search, filter } = await searchParams

  const { data: shop } = await service.from('shops').select('name').eq('id', shopId).single()

  // Build query
  let query = service
    .from('customers')
    .select('id, name, email, phone, created_at')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: customers } = await query

  // Get stamp counts for all customers
  const customerIds = customers?.map((c) => c.id) || []
  const { data: stampCounts } = await service
    .from('stamps')
    .select('customer_id')
    .in('customer_id', customerIds)

  const stampMap: Record<string, number> = {}
  stampCounts?.forEach((s) => {
    stampMap[s.customer_id] = (stampMap[s.customer_id] || 0) + 1
  })

  // Get last stamp for each customer (for lapsed detection)
  const twoWeeksAgo = new Date()
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

  const { data: recentStamps } = await service
    .from('stamps')
    .select('customer_id, stamped_at')
    .in('customer_id', customerIds)
    .gte('stamped_at', twoWeeksAgo.toISOString())

  const activeIds = new Set(recentStamps?.map((s) => s.customer_id) || [])

  let displayCustomers = customers || []
  if (filter === 'lapsed') {
    displayCustomers = displayCustomers.filter((c) => !activeIds.has(c.id))
  } else if (filter === 'active') {
    displayCustomers = displayCustomers.filter((c) => activeIds.has(c.id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav shopName={shop?.name} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <span className="text-sm text-gray-500">{displayCustomers.length} shown</span>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <form className="flex-1">
            <input
              name="search"
              defaultValue={search}
              placeholder="Search by name or email…"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm"
            />
          </form>
          <div className="flex gap-2">
            {(['all', 'active', 'lapsed'] as const).map((f) => (
              <Link
                key={f}
                href={`/admin/customers?${search ? `search=${search}&` : ''}filter=${f === 'all' ? '' : f}`}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  (filter || 'all') === f
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Link>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Customer</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 hidden sm:table-cell">Email</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Stamps</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayCustomers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No customers found.
                  </td>
                </tr>
              )}
              {displayCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-3 text-gray-500 hidden sm:table-cell">{c.email}</td>
                  <td className="px-6 py-3 text-center text-gray-700">{stampMap[c.id] || 0}</td>
                  <td className="px-6 py-3 text-center">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        activeIds.has(c.id)
                          ? 'bg-green-100 text-green-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {activeIds.has(c.id) ? 'Active' : 'Lapsed'}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-right text-gray-400">
                    {new Date(c.created_at).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
