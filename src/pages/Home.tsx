import { useNavigate, useLocation } from 'react-router-dom'
import { Package, LogOut, ShoppingCart, RotateCcw } from 'lucide-react'

export function Home() {
  const navigate = useNavigate()
  const location = useLocation()
  const { techName = 'Technician', techId = '' } = location.state || {}

  const handleSignOut = () => {
    navigate('/')
  }

  const handleNewOrder = () => {
    navigate('/location-select', { state: { techName, techId } })
  }

  const handleReturnItems = () => {
    navigate('/return', { state: { techName, techId } })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-gray-900" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Stanton Inventory</h1>
              <p className="text-sm text-gray-600">Welcome, {techName}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-2xl space-y-4">
          {/* Primary Action: New Order */}
          <button
            onClick={handleNewOrder}
            className="w-full h-32 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center gap-4"
          >
            <ShoppingCart className="w-10 h-10" strokeWidth={1.5} />
            <span className="text-3xl font-semibold">New Order</span>
          </button>

          {/* Secondary Action: Return Items */}
          <button
            onClick={handleReturnItems}
            className="w-full h-24 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl shadow-sm hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-3 border border-gray-200"
          >
            <RotateCcw className="w-7 h-7 text-gray-700" strokeWidth={1.5} />
            <span className="text-2xl font-semibold">Return Items</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Scan items to begin, or select from catalog</p>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-sm text-gray-500">
        <p>Stanton Management © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
