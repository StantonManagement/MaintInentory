import { useNavigate, useLocation } from 'react-router-dom'
import { Package, LogOut, ShoppingCart, RotateCcw, Shield } from 'lucide-react'

export function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { techName = 'Technician', techId = '', truckId = '' } = location.state || {}

  const handleSignOut = () => {
    navigate('/')
  }

  const handleNewOrder = () => {
    navigate('/location-select', { state: { techName, techId, truckId } })
  }

  const handleReturnItems = () => {
    navigate('/return', { state: { techName, techId, truckId } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 p-6">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Stanton Inventory</h1>
              <p className="text-xs text-gray-500 mt-0.5">{techName}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100/50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md space-y-4">
          {/* Primary Action: New Order */}
          <button
            onClick={handleNewOrder}
            className="group w-full h-28 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-sm hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <ShoppingCart className="w-8 h-8 relative z-10" strokeWidth={1.5} />
            <span className="text-2xl font-semibold relative z-10">New Order</span>
          </button>

          {/* Secondary Action: Return Items */}
          <button
            onClick={handleReturnItems}
            className="group w-full h-28 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl shadow-sm hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-4 border border-gray-200/50 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <RotateCcw className="w-8 h-8 text-gray-700 relative z-10" strokeWidth={1.5} />
            <span className="text-2xl font-semibold relative z-10">Return Items</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center text-xs text-gray-400 font-medium tracking-wide">
          SCAN OR SELECT FROM CATALOG
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center">
        <button
          onClick={() => navigate('/admin-login')}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-lg transition-all"
        >
          <Shield className="w-3.5 h-3.5" />
          <span className="font-medium">Admin Access</span>
        </button>
        <p className="text-xs text-gray-400 mt-3">Stanton Management © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
