import { createClient, SupabaseClient } from '@supabase/supabase-js'

export interface Shop {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  stamps_required: number
  reward_description: string
  make_webhook_url: string | null
  staff_pin: string
  created_at: string
}

export interface Customer {
  id: string
  shop_id: string
  name: string
  email: string
  phone: string | null
  pass_serial: string | null
  created_at: string
}

export interface Stamp {
  id: string
  customer_id: string
  shop_id: string
  stamped_at: string
  stamped_by: string
}

export interface Reward {
  id: string
  customer_id: string
  shop_id: string
  redeemed_at: string | null
  created_at: string
}

export interface AdminUser {
  id: string
  shop_id: string | null
  role: 'owner' | 'staff' | 'superadmin'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any>

// Browser client — safe to use in client components
export function createBrowserClient(): AnyClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Service role client — server-side only, bypasses RLS
export function createServiceClient(): AnyClient {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// Resolve shop from slug using the service role client
export async function getShopBySlug(slug: string): Promise<Shop | null> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) return null
  return data as Shop
}
