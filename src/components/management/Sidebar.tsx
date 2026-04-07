import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Package,
  AlertTriangle,
  Truck,
  ChevronLeft,
} from 'lucide-react'

const navItems = [
  { path: '/inventory', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inventory/transactions', label: 'Transactions', icon: Receipt },
  { path: '/inventory/catalog', label: 'Catalog', icon: Package },
  { path: '/inventory/restock', label: 'Restock', icon: AlertTriangle },
  { path: '/inventory/trucks', label: 'Trucks', icon: Truck },
]

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 p-2 rounded-lg">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-gray-900">Inventory</h1>
            <p className="text-xs text-gray-500">Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
          INVENTORY
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <NavLink
          to="/"
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Tablet App
        </NavLink>
      </div>
    </aside>
  )
}
