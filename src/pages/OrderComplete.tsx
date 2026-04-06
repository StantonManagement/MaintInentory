import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, Home as HomeIcon, FileText, Package } from 'lucide-react'

export function OrderComplete() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    techName = 'Technician',
    techId = '',
    propertyId = '',
    cart = [],
    total = 0,
  } = location.state || {}

  // Generate order number (mock for now)
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`
  const orderDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })

  const handleNewOrder = () => {
    navigate('/home', { state: { techName, techId } })
  }

  const handlePrintReceipt = () => {
    // TODO: Implement PDF receipt generation
    window.print()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-6">
        <div className="flex items-center justify-center gap-4">
          <div className="bg-gradient-to-br from-green-600 to-green-700 p-3 rounded-2xl shadow-lg">
            <Package className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order Complete</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-3xl p-12 space-y-10 border border-gray-200">
          {/* Success Icon */}
          <div className="flex flex-col items-center pb-8 border-b border-gray-200">
            <div className="bg-green-100 p-8 rounded-full mb-6 animate-pulse">
              <CheckCircle className="w-28 h-28 text-green-600" strokeWidth={2} />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              Order Completed!
            </h2>
            <p className="text-xl text-gray-600 font-medium">
              Transaction recorded successfully
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-2xl p-8 space-y-5 border border-blue-100">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-2">Order Number</p>
                <p className="text-xl font-bold text-gray-900">{orderNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-2">Date & Time</p>
                <p className="text-xl font-bold text-gray-900">{orderDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-2">Technician</p>
                <p className="text-xl font-bold text-gray-900">{techName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-semibold mb-2">Property</p>
                <p className="text-xl font-bold text-gray-900">
                  Property #{propertyId}
                </p>
              </div>
            </div>
          </div>

          {/* Items Summary */}
          <div className="space-y-5">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
              Items ({cart.length})
            </h3>
            <div className="max-h-80 overflow-y-auto space-y-3 pr-2">
              {cart.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-5 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200 shadow-sm"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-lg mb-1">{item.name}</p>
                    <p className="text-sm text-gray-600 font-medium">
                      {item.sku} × {item.quantity}
                    </p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-200 pt-8">
            <div className="flex justify-between items-center mb-8 bg-green-50 p-6 rounded-2xl border-2 border-green-200">
              <span className="text-3xl font-bold text-gray-800">Total:</span>
              <span className="text-5xl font-bold text-green-600">
                ${total.toFixed(2)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-5">
              <button
                onClick={handlePrintReceipt}
                className="h-20 bg-white hover:bg-gray-50 text-gray-800 font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl active:scale-98 transition-all flex items-center justify-center gap-3 border-2 border-gray-200"
              >
                <FileText className="w-6 h-6" strokeWidth={2} />
                Print Receipt
              </button>
              <button
                onClick={handleNewOrder}
                className="h-20 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-3xl active:scale-98 transition-all flex items-center justify-center gap-3"
              >
                <HomeIcon className="w-6 h-6" strokeWidth={2} />
                New Order
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center text-base text-gray-600 pt-6 border-t border-gray-200 space-y-2">
            <p className="font-medium">
              This order has been charged to the property and recorded in the system.
            </p>
            <p className="text-gray-500">A copy will be available in MaintOC.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-sm text-gray-500">
        <p>Stanton Management © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
