'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import StampCard from '@/components/StampCard'

interface CustomerData {
  id: string
  name: string
  email: string
  shop: {
    id: string
    name: string
    primary_color: string
    stamps_required: number
  }
  stamp_count: number
  has_reward: boolean
}

export default function StampPage() {
  const { shop_slug } = useParams<{ shop_slug: string }>()
  const searchParams = useSearchParams()
  const customerId = searchParams.get('customer_id')

  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pin, setPin] = useState('')
  const [pinVerified, setPinVerified] = useState(false)
  const [stamping, setStamping] = useState(false)
  const [stampSuccess, setStampSuccess] = useState(false)

  const fetchCustomer = useCallback(async () => {
    if (!customerId) return
    try {
      const res = await fetch(`/api/customers/info?customer_id=${customerId}&shop_slug=${shop_slug}`)
      if (!res.ok) {
        setError('Customer not found')
        return
      }
      const data = await res.json()
      setCustomer(data)
    } catch {
      setError('Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }, [customerId, shop_slug])

  useEffect(() => {
    fetchCustomer()
  }, [fetchCustomer])

  async function addStamp() {
    if (!customer || !pin) return
    setStamping(true)
    try {
      const res = await fetch('/api/stamps/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.id,
          shop_id: customer.shop.id,
          pin,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          setError('Incorrect PIN')
          setPinVerified(false)
          return
        }
        setError(data.error || 'Failed to add stamp')
        return
      }
      setStampSuccess(true)
      await fetchCustomer()
      setTimeout(() => setStampSuccess(false), 3000)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setStamping(false)
    }
  }

  if (!customerId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-gray-500">No customer ID provided.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-amber-800 rounded-full animate-spin" />
      </div>
    )
  }

  if (error && !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <p className="text-gray-400 text-sm mt-2">Check the QR code and try again.</p>
        </div>
      </div>
    )
  }

  if (!customer) return null

  const primaryColor = customer.shop.primary_color

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 pb-20 px-4">
      <div className="w-full max-w-sm space-y-5">
        {/* Header */}
        <div className="text-center">
          <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">
            {customer.shop.name}
          </p>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">{customer.name}</h1>
          <p className="text-gray-500 text-sm">{customer.email}</p>
        </div>

        {/* Stamp card */}
        <StampCard
          stampCount={customer.stamp_count}
          stampsRequired={customer.shop.stamps_required}
          primaryColor={primaryColor}
        />

        {/* Reward banner */}
        {customer.has_reward && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-semibold">🎉 Reward available!</p>
            <p className="text-green-600 text-sm mt-1">
              This customer has a free drink waiting.
            </p>
          </div>
        )}

        {/* PIN entry + stamp button */}
        {!pinVerified ? (
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">Staff PIN</p>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={8}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value)
                setError('')
              }}
              placeholder="Enter PIN"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-2xl tracking-widest focus:outline-none focus:ring-2"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              onClick={() => pin.length > 0 && setPinVerified(true)}
              className="mt-3 w-full py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: primaryColor }}
            >
              Confirm PIN
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 space-y-3">
            {stampSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <p className="text-green-700 font-semibold text-sm">✓ Stamp added!</p>
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              onClick={addStamp}
              disabled={stamping}
              className="w-full py-4 rounded-xl text-white font-semibold text-lg disabled:opacity-60 transition-opacity"
              style={{ backgroundColor: primaryColor }}
            >
              {stamping ? 'Adding stamp…' : '+ Add Stamp'}
            </button>
            <button
              onClick={() => {
                setPinVerified(false)
                setPin('')
              }}
              className="w-full py-2 text-sm text-gray-400 hover:text-gray-600"
            >
              Change PIN
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
