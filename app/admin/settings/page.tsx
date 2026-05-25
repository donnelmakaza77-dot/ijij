import { redirect } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AdminNav from '@/components/AdminNav'
import SettingsForm from './SettingsForm'

export default async function AdminSettings() {
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

  const { data: shop } = await service
    .from('shops')
    .select('*')
    .eq('id', adminUser.shop_id!)
    .single()

  if (!shop) redirect('/admin')

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav shopName={shop.name} />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shop Settings</h1>
        <SettingsForm shop={shop} />

        {/* QR Code section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
          <h2 className="font-semibold text-gray-900 mb-3">Counter QR Code</h2>
          <p className="text-sm text-gray-500 mb-4">
            Print this QR code and place it on your counter. Customers scan it to join your loyalty
            scheme.
          </p>
          <a
            href={`/api/qr/${shop.slug}`}
            download={`${shop.slug}-qr.png`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Download QR Code
          </a>
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/qr/${shop.slug}`}
              alt="Shop QR code"
              className="w-40 h-40 border border-gray-100 rounded-xl"
            />
          </div>
        </div>
      </main>
    </div>
  )
}
