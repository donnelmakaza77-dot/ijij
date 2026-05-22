'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'

interface CustomerData {
  id: string
  name: string
  email: string
  shop: {
    id: string
    name: string
    primary_color: string
    reward_description: string
  }
  stamp_count: number
  available_rewards: Array<{ id: string; created_at: string }>
}

export default function RedeemPage() {
  const { shop_slug } = useParams<{ shop_slug: string }>()
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customer_id')

  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pin, setPin] = useState('')
  const [pinVerified, setPinVerified] = useState(false)
  const [redeeming, setRedeeming] = useState(false)
  const [redeemSuccess, setRedeemSuccess] = useState(false)

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return
    const res = await fetch(`/api/customers/info?customer_id=${customerId}&shop_slug=${shop_slug}`)
    if (res.ok) {
      setCustomer(await res.json())
    } else {
      setError('Customer not found')
    }
    setLoading(false)
  }, [customerId, shop_slug])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  async function handleRedeem() {
    if (!customer) return
    setRedeeming(true)
    const reward = customer.available_rewards[0]
    const res = await fetch('/api/rewards/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_id: customer.id,
        shop_id: customer.shop.id,
        reward_id: reward?.id,
        pin,
      }),
    })
    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to redeem')
      if (res.status === 401) setPinVerified(false)
    } else {
      setRedeemSuccess(true)
      await fetchCustomer()
    }
    setRedeeming(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-600">{error || 'Customer not found'}</p>
      </div>
    )
  }

  const primaryColor = customer.shop.primary_color
  const hasReward = customer.available_rewards.length > 0

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 pb-20 px-4">
      <div className="w-full max-w-sm space-y-5">
        <div className="text-center">
          <p className="text-sm text-gray-400 uppercase tracking-wider">{customer.shop.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{customer.name}</h1>
        </div>

        {redeemSuccess ? (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
            <div className="text-5xl mb-3">✅</div>
            <h2 className="text-xl font-bold text-gray-900">Reward redeemed!</h2>
            <p className="text-gray-500 text-sm mt-2">
              Enjoy your {customer.shop.reward_description.toLowerCase()}.
            </p>
          </div>
        ) : hasReward ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 space-y-4">
            <div
              className="rounded-xl p-5 text-center text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <p className="text-4xl mb-2">🎉</p>
              <p className="font-bold text-lg">Free reward available</p>
              <p className="text-white/80 text-sm mt-1">{customer.shop.reward_description}</p>
            </div>

            {!pinVerified ? (
              <>
                <p className="text-sm font-medium text-gray-700">Staff PIN to confirm redemption</p>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter PIN"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:outline-none"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  onClick={() => pin.length > 0 && setPinVerified(true)}
                  className="w-full py-3 rounded-xl text-white font-semibold"
                  style={{ backgroundColor: primaryColor }}
                >
                  Confirm PIN
                </button>
              </>
            ) : (
              <>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  onClick={handleRedeem}
                  disabled={redeeming}
                  className="w-full py-4 rounded-xl text-white font-bold text-lg disabled:opacity-60"
                  style={{ backgroundColor: primaryColor }}
                >
                  {redeeming ? 'Redeeming…' : 'Mark as Redeemed'}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
            <p className="text-gray-400 text-4xl mb-3">☕</p>
            <p className="text-gray-700 font-medium">No reward available yet</p>
            <p className="text-gray-400 text-sm mt-1">
              {customer.stamp_count} stamps collected so far.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
