import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  AlertTriangle,
  Receipt,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { getDashboardMetrics, getBelowMinItems, getRecentTransactions, type BelowMinItem, type RecentTransaction } from '@/services/dashboard'

const categoryLabels: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  hardware: 'Hardware',
  paint: 'Paint',
  lighting: 'Lighting',
  safety: 'Safety',
  hvac: 'HVAC',
  appliance_parts: 'Appliance Parts',
  flooring: 'Flooring',
  cleaning: 'Cleaning',
  doors_locks: 'Doors & Locks',
  windows: 'Windows',
  other: 'Other',
}

export function Dashboard() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalCatalogItems: 0,
    belowMinCount: 0,
    transactionsToday: 0,
    spendThisWeek: 0,
    spendThisMonth: 0,
  })
  const [belowMinItems, setBelowMinItems] = useState<BelowMinItem[]>([])
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      const [metricsData, belowMin, recent] = await Promise.all([
        getDashboardMetrics(),
        getBelowMinItems(),
        getRecentTransactions(),
      ])

      setMetrics(metricsData)
      setBelowMinItems(belowMin)
      setRecentTransactions(recent)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of truck inventory and transactions</p>
      </div>

      {/* Metric Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            icon={Package}
            label="Total Items in Catalog"
            value={metrics.totalCatalogItems.toString()}
            color="blue"
          />
          <MetricCard
            icon={AlertTriangle}
            label="Items Below Minimum"
            value={metrics.belowMinCount.toString()}
            color={metrics.belowMinCount > 0 ? 'red' : 'green'}
            onClick={metrics.belowMinCount > 0 ? () => navigate('/inventory/restock') : undefined}
          />
          <MetricCard
            icon={Receipt}
            label="Transactions Today"
            value={metrics.transactionsToday.toString()}
            color="purple"
          />
          <MetricCard
            icon={DollarSign}
            label="Spend This Week"
            value={`$${metrics.spendThisWeek.toFixed(2)}`}
            color="amber"
          />
          <MetricCard
            icon={TrendingUp}
            label="Spend This Month"
            value={`$${metrics.spendThisMonth.toFixed(2)}`}
            color="green"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Below Minimum Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Below Minimum Items
            </h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : belowMinItems.length === 0 ? (
              <div className="text-center py-8">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✓</span>
                </div>
                <p className="text-gray-600 font-medium">All items above minimum</p>
                <p className="text-sm text-gray-500 mt-1">Stock levels are healthy</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="pb-3">Item</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3 text-center">Current</th>
                      <th className="pb-3 text-center">Min</th>
                      <th className="pb-3 text-center">Reorder</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {belowMinItems.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {categoryLabels[item.category] || item.category}
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.current_quantity}
                          </span>
                        </td>
                        <td className="py-3 text-center text-gray-600">
                          {item.min_quantity}
                        </td>
                        <td className="py-3 text-center font-medium text-amber-600">
                          {item.reorder_quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-500" />
              Recent Transactions
            </h2>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No transactions yet</p>
                <p className="text-sm text-gray-500 mt-1">Transactions will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <th className="pb-3">Time</th>
                      <th className="pb-3">Tech</th>
                      <th className="pb-3">Building</th>
                      <th className="pb-3">Unit</th>
                      <th className="pb-3 text-right">Total</th>
                      <th className="pb-3 text-center">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {recentTransactions.map((t) => (
                      <tr
                        key={t.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate('/inventory/transactions')}
                      >
                        <td className="py-3 text-sm text-gray-600">
                          {new Date(t.transaction_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-medium text-gray-900">{t.technician_name}</td>
                        <td className="py-3 text-sm text-gray-600 truncate max-w-[150px]">
                          {t.property_name || 'N/A'}
                        </td>
                        <td className="py-3 text-sm text-gray-600">{t.unit_number || '-'}</td>
                        <td className={`py-3 text-right font-medium ${t.transaction_type === 'return' ? 'text-amber-600' : 'text-gray-900'}`}>
                          {t.transaction_type === 'return' ? '-' : ''}${Math.abs(t.total_amount).toFixed(2)}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            t.transaction_type === 'checkout'
                              ? 'bg-blue-100 text-blue-800'
                              : t.transaction_type === 'return'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {t.transaction_type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  icon: React.ElementType
  label: string
  value: string
  color: 'blue' | 'red' | 'green' | 'amber' | 'purple'
  onClick?: () => void
}

function MetricCard({ icon: Icon, label, value, color, onClick }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  )
}
