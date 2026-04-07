import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  ChevronLeft,
  Camera,
  Search,
  Plus,
  Minus,
  Trash2,
  RotateCcw,
} from 'lucide-react'
import { catalogItems } from '../data/mock/catalog'

interface ReturnItem {
  id: string
  sku: string
  name: string
  price: number
  quantity: number
}

export function ReturnScanner() {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    techName = 'Technician',
    techId = '',
    propertyId = '',
    unitId = '',
  } = location.state || {}

  const [cart, setCart] = useState<ReturnItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const handleBack = () => {
    navigate('/return', { state: { techName, techId } })
  }

  const handleScanBarcode = () => {
    // Simulate scanning by adding a random item with negative quantity
    const randomItem = catalogItems[Math.floor(Math.random() * catalogItems.length)]
    addItemToCart({
      id: randomItem.id,
      sku: randomItem.upc_barcode || randomItem.bin_barcode || `SKU-${randomItem.id}`,
      name: randomItem.name,
      price: randomItem.unit_cost,
    })
  }

  const addItemToCart = (item: { id: string; sku: string; name: string; price: number }) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
      } else {
        return [...prevCart, { ...item, quantity: -1 }]
      }
    })
  }

  const updateQuantity = (itemId: string, change: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - change } // Subtract for returns (more negative)
            : item
        )
        .filter((item) => item.quantity !== 0)
    )
  }

  const removeItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))
  }

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateItemCount = () => {
    return cart.reduce((count, item) => count + Math.abs(item.quantity), 0)
  }

  const handleCompleteReturn = () => {
    if (cart.length === 0) return

    navigate('/return-complete', {
      state: {
        techName,
        techId,
        propertyId,
        unitId,
        cart,
        total: calculateTotal(),
      },
    })
  }

  const filteredItems = catalogItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.upc_barcode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.bin_barcode || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-amber-200/50 p-6">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-200"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            <span className="text-lg font-bold">Back</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-2xl shadow-lg">
              <RotateCcw className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">RETURN</h1>
              <p className="text-sm text-amber-700 font-medium mt-0.5">{techName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-amber-100 px-5 py-3 rounded-2xl border-2 border-amber-200">
            <RotateCcw className="w-7 h-7 text-amber-600" strokeWidth={2} />
            <span className="text-2xl font-bold text-amber-700">{calculateItemCount()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Scanner / Search */}
          <div className="space-y-6">
            {/* Scanner Button */}
            <button
              onClick={handleScanBarcode}
              className="group w-full h-72 bg-gradient-to-br from-white via-amber-50 to-white rounded-3xl shadow-2xl flex flex-col items-center justify-center gap-5 hover:shadow-3xl active:scale-98 transition-all border-4 border-dashed border-amber-400 hover:border-amber-500"
            >
              <div className="bg-amber-100 p-6 rounded-3xl group-hover:bg-amber-200 transition-colors">
                <Camera className="w-24 h-24 text-amber-600" strokeWidth={1.5} />
              </div>
              <span className="text-3xl font-bold text-gray-800">
                Tap to Scan Barcode
              </span>
              <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                Scan items being returned
              </span>
            </button>

            {/* Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="w-full h-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl flex items-center justify-center gap-4 hover:shadow-2xl active:scale-98 transition-all border-2 border-gray-200 hover:border-gray-300"
            >
              <Search className="w-7 h-7 text-gray-600" strokeWidth={2} />
              <span className="text-xl font-bold text-gray-800">
                {showSearch ? 'Hide Search' : 'Search Manually'}
              </span>
            </button>

            {/* Search Results */}
            {showSearch && (
              <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-5 border border-gray-200">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or barcode..."
                  className="w-full h-16 px-6 text-lg font-medium border-2 border-gray-300 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all shadow-sm"
                />
                <div className="max-h-96 overflow-y-auto space-y-3">
                  {filteredItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addItemToCart({
                        id: item.id,
                        sku: item.upc_barcode || item.bin_barcode || `SKU-${item.id}`,
                        name: item.name,
                        price: item.unit_cost,
                      })}
                      className="w-full p-5 bg-gradient-to-r from-gray-50 to-amber-50/50 hover:from-amber-50 hover:to-amber-100 rounded-2xl flex items-center justify-between active:scale-98 transition-all shadow-sm border border-gray-200"
                    >
                      <div className="text-left">
                        <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                        <p className="text-sm text-gray-600 font-medium">{item.shelf_zone}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-xl font-bold text-amber-600">
                          ${item.unit_cost.toFixed(2)}
                        </p>
                        <div className="bg-amber-100 p-2 rounded-xl">
                          <Plus className="w-6 h-6 text-amber-600" strokeWidth={2.5} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Return Cart */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 flex flex-col border border-amber-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-4 pb-6 border-b border-gray-200">
              <div className="bg-amber-100 p-3 rounded-2xl">
                <RotateCcw className="w-8 h-8 text-amber-600" strokeWidth={2} />
              </div>
              <span>Returns ({calculateItemCount()} items)</span>
            </h2>

            {cart.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <div className="bg-gray-50 p-8 rounded-3xl mb-6">
                    <RotateCcw className="w-20 h-20 mx-auto opacity-30" strokeWidth={1.5} />
                  </div>
                  <p className="text-xl font-bold text-gray-500 mb-2">No items to return</p>
                  <p className="text-base text-gray-400">Scan items being returned</p>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-8">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="p-5 bg-gradient-to-r from-amber-50/50 to-orange-50/30 rounded-2xl flex items-center gap-4 border border-amber-200 shadow-sm"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-lg mb-1">{item.name}</p>
                        <p className="text-sm text-gray-600 font-medium mb-2">{item.sku}</p>
                        <p className="text-sm font-bold text-amber-600">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-12 h-12 bg-gray-200 hover:bg-gray-300 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-sm"
                        >
                          <Minus className="w-6 h-6 text-gray-700" strokeWidth={2.5} />
                        </button>
                        <span className="text-3xl font-bold text-amber-600 w-14 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl flex items-center justify-center active:scale-95 transition-all shadow-md"
                        >
                          <Plus className="w-6 h-6 text-white" strokeWidth={2.5} />
                        </button>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="w-12 h-12 bg-red-100 hover:bg-red-200 rounded-xl flex items-center justify-center active:scale-95 transition-all ml-2 shadow-sm"
                        >
                          <Trash2 className="w-6 h-6 text-red-600" strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total and Complete */}
                <div className="border-t-2 border-gray-200 pt-6 space-y-6">
                  <div className="flex justify-between items-center bg-amber-50 p-5 rounded-2xl border-2 border-amber-200">
                    <span className="text-2xl font-bold text-gray-800">Credit Total:</span>
                    <span className="text-4xl font-bold text-amber-600">
                      ${calculateTotal().toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={handleCompleteReturn}
                    className="w-full h-20 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-2xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl active:scale-98 transition-all"
                  >
                    Complete Return →
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
