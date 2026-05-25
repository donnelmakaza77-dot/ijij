import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-4">☕</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">BrewLoop</h1>
        <p className="text-gray-500 text-lg mb-8">
          White-labelled loyalty for independent coffee shops.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/admin"
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Admin Login
          </Link>
          <Link
            href="/superadmin"
            className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-gray-300 transition-colors"
          >
            Superadmin
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-8">
          Shops join at{' '}
          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
            /[shop-slug]
          </code>
        </p>
      </div>
    </main>
  )
}
