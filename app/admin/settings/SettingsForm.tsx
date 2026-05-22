'use client'

import { useState } from 'react'
import type { Shop } from '@/lib/supabase'

export default function SettingsForm({ shop }: { shop: Shop }) {
  const [form, setForm] = useState({
    name: shop.name,
    primary_color: shop.primary_color,
    stamps_required: shop.stamps_required,
    reward_description: shop.reward_description,
    make_webhook_url: shop.make_webhook_url || '',
    logo_url: shop.logo_url || '',
    staff_pin: shop.staff_pin,
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shop_id: shop.id, ...form }),
    })

    if (res.ok) {
      setMessage('Settings saved successfully.')
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to save')
    }
    setSaving(false)
  }

  function handleChange(field: keyof typeof form, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand colour</label>
          <div className="flex gap-2">
            <input
              type="color"
              value={form.primary_color}
              onChange={(e) => handleChange('primary_color', e.target.value)}
              className="w-12 h-10 border border-gray-200 rounded-xl cursor-pointer"
            />
            <input
              type="text"
              value={form.primary_color}
              onChange={(e) => handleChange('primary_color', e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none text-sm font-mono"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Stamps required</label>
          <input
            type="number"
            min={3}
            max={20}
            value={form.stamps_required}
            onChange={(e) => handleChange('stamps_required', parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Staff PIN</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4,8}"
            value={form.staff_pin}
            onChange={(e) => handleChange('staff_pin', e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none text-sm font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Reward description</label>
        <input
          type="text"
          value={form.reward_description}
          onChange={(e) => handleChange('reward_description', e.target.value)}
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL (optional)</label>
        <input
          type="url"
          value={form.logo_url}
          onChange={(e) => handleChange('logo_url', e.target.value)}
          placeholder="https://…"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Make.com webhook URL
        </label>
        <input
          type="url"
          value={form.make_webhook_url}
          onChange={(e) => handleChange('make_webhook_url', e.target.value)}
          placeholder="https://hook.eu1.make.com/…"
          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none text-sm"
        />
        <p className="text-xs text-gray-400 mt-1">
          All loyalty events (sign-ups, stamps, rewards) will be POSTed to this URL.
        </p>
      </div>

      {message && (
        <p className="text-green-600 text-sm bg-green-50 px-4 py-3 rounded-xl">{message}</p>
      )}
      {error && <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 disabled:opacity-60 transition-colors"
      >
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </form>
  )
}
