interface Stat {
  label: string
  value: string | number
  sub?: string
}

interface DashboardProps {
  stats: Stat[]
}

export default function Dashboard({ stats }: DashboardProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
          {stat.sub && <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>}
        </div>
      ))}
    </div>
  )
}
