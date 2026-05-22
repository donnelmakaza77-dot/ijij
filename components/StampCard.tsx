'use client'

interface StampCardProps {
  stampCount: number
  stampsRequired: number
  primaryColor: string
}

export default function StampCard({ stampCount, stampsRequired, primaryColor }: StampCardProps) {
  const stamps = Array.from({ length: stampsRequired }, (_, i) => i < stampCount)

  return (
    <div className="rounded-2xl p-6 shadow-lg" style={{ backgroundColor: primaryColor }}>
      <p className="text-white/80 text-sm font-medium mb-3 uppercase tracking-wider">
        Your Stamps
      </p>
      <div className="flex flex-wrap gap-2">
        {stamps.map((filled, i) => (
          <div
            key={i}
            className={`w-10 h-10 rounded-full border-2 border-white/60 flex items-center justify-center transition-all ${
              filled ? 'bg-white' : 'bg-white/20'
            }`}
          >
            {filled && (
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8" fill={primaryColor} />
                <path
                  d="M6 10l3 3 5-5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
        ))}
      </div>
      <p className="text-white mt-4 text-lg font-semibold">
        {stampCount} / {stampsRequired} stamps
      </p>
      {stampCount >= stampsRequired && (
        <p className="text-white mt-1 text-sm font-medium bg-white/20 rounded-full px-3 py-1 inline-block">
          🎉 Free drink ready!
        </p>
      )}
    </div>
  )
}
