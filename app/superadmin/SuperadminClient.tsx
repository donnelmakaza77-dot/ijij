'use client'

import { useState } from 'react'
import Link from 'next/link'

interface ShopWithStats {
  id: string
  name: string
  slug: string
  primary_color: string
  stamps_required: number
  reward_description: string
  make_webhook_url: string | null
  logo_url: string | null
  staff_pin: string
  created_at: string
  customer_count: number
}

interface Props {
  shops: ShopWithStats[]
}

export default function SuperadminClient({ shops: initialShops }: Props) {
  const [shops, setShops] = useState(initialShops)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    primary_color: '#6B3F1A',
    stamps_required: 9,
    reward_description: 'Free coffee of your choice',
  })
  const [error, setError] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setError('')

    const res = await fetch('/api/superadmin/shops', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to create shop')
    } else {
      setShops((prev) => [{ ...data.shop, customer_count: 0 }, ...prev])
      setShowForm(false)
      setForm({ name: '', slug: '', primary_color: '#6B3F1A', stamps_required: 9, reward_description: 'Free coffee of your choice' })
    }
    setCreating(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-900 text-white h-16 flex items-center px-8">
        <span className="font-bold text-lg">☕ BrewLoop Superadmin</span>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            All Shops <span className="text-gray-400 font-normal text-lg">({shops.length})</span>
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800"
          >
            {showForm ? 'Cancel' : '+ New Shop'}
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4"
          >
            <h2 className="font-semibold text-gray-900">Create New Shop</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug (URL identifier)
                </label>
                <input
                  required
                  pattern="[a-z0-9\-]+"
                  value={form.slug}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))
                  }
                  placeholder="my-coffee-shop"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brand colour</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
                    className="w-12 h-10 border border-gray-200 rounded-xl"
                  />
                  <input
                    value={form.primary_color}
                    onChange={(e) => setForm((f) => ({ ...f, primary_color: e.target.value }))}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stamps required
                </label>
                <input
                  type="number"
                  min={3}
                  max={20}
                  value={form.stamps_required}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, stamps_required: parseInt(e.target.value) }))
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reward description
              </label>
              <input
                value={form.reward_description}
                onChange={(e) => setForm((f) => ({ ...f, reward_description: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"
              />
            </div>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-60"
            >
              {creating ? 'Creating…' : 'Create Shop'}
            </button>
          </form>
        )}

        {/* Shops list */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 font-medium text-gray-500">Shop</th>
                <th className="text-left px-6 py-3 font-medium text-gray-500 hidden sm:table-cell">Slug</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Customers</th>
                <th className="text-center px-6 py-3 font-medium text-gray-500">Stamps</th>
                <th className="text-right px-6 py-3 font-medium text-gray-500">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {shops.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                    No shops yet.
                  </td>
                </tr>
              )}
              {shops.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50">
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: shop.primary_color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{shop.name}</p>
                        <Link
                          href={`/${shop.slug}`}
                          className="text-xs text-blue-500 hover:underline"
                          target="_blank"
                        >
                          View page
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 text-gray-500 font-mono hidden sm:table-cell">
                    {shop.slug}
                  </td>
                  <td className="px-6 py-3 text-center text-gray-700">{shop.customer_count}</td>
                  <td className="px-6 py-3 text-center text-gray-500">{shop.stamps_required}</td>
                  <td className="px-6 py-3 text-right text-gray-400">
                    {new Date(shop.created_at).toLocaleDateString('en-GB')}
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
