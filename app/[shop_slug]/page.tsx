import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getShopBySlug } from '@/lib/supabase'
import JoinPageClient from './JoinPageClient'

interface Props {
  params: Promise<{ shop_slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { shop_slug } = await params
  const shop = await getShopBySlug(shop_slug)
  if (!shop) return { title: 'Not Found' }
  return {
    title: `${shop.name} — Loyalty Card`,
    description: `Join ${shop.name}'s loyalty scheme and earn free drinks.`,
  }
}

export default async function ShopJoinPage({ params }: Props) {
  const { shop_slug } = await params
  const shop = await getShopBySlug(shop_slug)
  if (!shop) notFound()

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-start pt-12 pb-20 px-4"
      style={{ '--brand': shop.primary_color } as React.CSSProperties}
    >
      {/* Header */}
      <div className="w-full max-w-sm text-center mb-8">
        {shop.logo_url ? (
          <div className="relative w-24 h-24 mx-auto mb-4">
            <Image
              src={shop.logo_url}
              alt={`${shop.name} logo`}
              fill
              className="object-contain rounded-2xl"
            />
          </div>
        ) : (
          <div
            className="w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center text-4xl text-white font-bold"
            style={{ backgroundColor: shop.primary_color }}
          >
            {shop.name.charAt(0)}
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
        <p className="text-gray-500 mt-1">Loyalty Card</p>
      </div>

      {/* Value prop */}
      <div
        className="w-full max-w-sm rounded-2xl p-5 mb-8 text-white text-center"
        style={{ backgroundColor: shop.primary_color }}
      >
        <p className="text-3xl font-bold mb-1">{shop.stamps_required} stamps</p>
        <p className="text-white/80 text-sm">then get</p>
        <p className="text-lg font-semibold mt-1">{shop.reward_description}</p>
      </div>

      {/* Join form */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Join our loyalty scheme</h2>
        <p className="text-gray-500 text-sm mb-5">
          Enter your details to get your digital stamp card, added straight to Apple Wallet.
        </p>
        <JoinPageClient shopSlug={shop_slug} primaryColor={shop.primary_color} />
      </div>
    </main>
  )
}
