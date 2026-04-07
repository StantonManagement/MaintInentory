import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Package,
  AlertTriangle,
  Receipt,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { catalogItems } from '../../data/mock/catalog'
import { transactions } from '../../data/mock/transactions'
import { stockLevels } from '../../data/mock/technicians'
import { categoryLabels } from '../../data/mock/catalog'

export function Dashboard() {
  const navigate = useNavigate()

  // Calculate metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayTransactions = transactions.filter(t => t.created_at.startsWith(today))
    
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    const weekTransactions = transactions.filter(t => new Date(t.created_at) >= weekStart)
    
    const monthStart = new Date()
    monthStart.setDate(monthStart.getDate() - 30)
    const monthTransactions = transactions.filter(t => new Date(t.created_at) >= monthStart)

    const weekSpend = weekTransactions.reduce((sum, t) => sum + (t.type === 'checkout' ? t.total : 0), 0)
    const monthSpend = monthTransactions.reduce((sum, t) => sum + (t.type === 'checkout' ? t.total : 0), 0)

    // Find items below minimum
    const belowMinItems = stockLevels
      .map(stock => {
        const catalogItem = catalogItems.find(c => c.id === stock.catalog_item_id)
        if (!catalogItem || !catalogItem.is_active) return null
        const isBelowMin = stock.current_quantity <= catalogItem.min_quantity
        return isBelowMin ? { ...stock, catalogItem } : null
      })
      .filter(Boolean)

    return {
      totalCatalog: catalogItems.filter(c => c.is_active).length,
      belowMinCount: belowMinItems.length,
      belowMinItems,
      todayCount: todayTransactions.length,
      weekSpend,
      monthSpend,
    }
  }, [])

  const recentTransactions = transactions.slice(0, 10)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Inventory Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of truck inventory and transactions</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <MetricCard
          icon={Package}
          label="Total Items in Catalog"
          value={metrics.totalCatalog.toString()}
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
          value={metrics.todayCount.toString()}
          color="purple"
        />
        <MetricCard
          icon={DollarSign}
          label="Spend This Week"
          value={`$${metrics.weekSpend.toFixed(2)}`}
          color="amber"
        />
        <MetricCard
          icon={TrendingUp}
          label="Spend This Month"
          value={`$${metrics.monthSpend.toFixed(2)}`}
          color="green"
        />
      </div>

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
            {metrics.belowMinItems.length === 0 ? (
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
                    {metrics.belowMinItems.map((item: any) => (
                      <tr key={item.catalog_item_id} className="hover:bg-gray-50">
                        <td className="py-3 font-medium text-gray-900">
                          {item.catalogItem.name}
                        </td>
                        <td className="py-3 text-sm text-gray-600">
                          {categoryLabels[item.catalogItem.category] || item.catalogItem.category}
                        </td>
                        <td className="py-3 text-center">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {item.current_quantity}
                          </span>
                        </td>
                        <td className="py-3 text-center text-gray-600">
                          {item.catalogItem.min_quantity}
                        </td>
                        <td className="py-3 text-center font-medium text-amber-600">
                          {item.catalogItem.max_quantity - item.current_quantity}
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="pb-3">Time</th>
                    <th className="pb-3">Tech</th>
                    <th className="pb-3">Building</th>
                    <th className="pb-3">Unit</th>
                    <th className="pb-3 text-right">Total</th>
                    <th className="pb-3 text-center">Status</th>
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
                        {new Date(t.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 font-medium text-gray-900">{t.tech_name}</td>
                      <td className="py-3 text-sm text-gray-600 truncate max-w-[150px]">
                        {t.property_name}
                      </td>
                      <td className="py-3 text-sm text-gray-600">{t.unit_number}</td>
                      <td className={`py-3 text-right font-medium ${t.type === 'return' ? 'text-amber-600' : 'text-gray-900'}`}>
                        {t.type === 'return' ? '-' : ''}${Math.abs(t.total).toFixed(2)}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          t.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : t.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
