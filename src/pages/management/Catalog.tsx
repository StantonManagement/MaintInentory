import { useState } from 'react'
import {
  Search,
  Plus,
  Edit2,
  X,
} from 'lucide-react'
import { catalogItems, categoryLabels, zoneOptions, unitOptions, type CatalogItem } from '../../data/mock/catalog'
import { stockLevels } from '../../data/mock/technicians'

export function CatalogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedZone, setSelectedZone] = useState('')
  const [showInactive, setShowInactive] = useState(false)
  const [editingItem, setEditingItem] = useState<CatalogItem | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const filteredItems = catalogItems.filter(item => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (selectedCategory && item.category !== selectedCategory) return false
    if (selectedZone && item.shelf_zone !== selectedZone) return false
    if (!showInactive && !item.is_active) return false
    return true
  })

  const getStockLevel = (catalogItemId: string) => {
    return stockLevels.find(s => s.catalog_item_id === catalogItemId)?.current_quantity || 0
  }

  const categories = Object.keys(categoryLabels)

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Catalog</h1>
          <p className="text-gray-600 mt-1">Manage inventory items and stock levels</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{categoryLabels[cat]}</option>
            ))}
          </select>
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Zones</option>
            {zoneOptions.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 py-2">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">Show inactive</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Zone</th>
                <th className="px-6 py-4">UPC</th>
                <th className="px-6 py-4">Bin Barcode</th>
                <th className="px-6 py-4 text-right">Unit Cost</th>
                <th className="px-6 py-4 text-center">UoM</th>
                <th className="px-6 py-4 text-center">Min</th>
                <th className="px-6 py-4 text-center">Max</th>
                <th className="px-6 py-4 text-center">Stock</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4 text-center">Active</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const stock = getStockLevel(item.id)
                const isLow = stock <= item.min_quantity
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{categoryLabels[item.category]}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.shelf_zone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{item.upc_barcode || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{item.bin_barcode || '-'}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">${item.unit_cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{item.unit_of_measure}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{item.min_quantity}</td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600">{item.max_quantity}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        isLow ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {stock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.preferred_supplier || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.is_active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(isAddModalOpen || editingItem) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingItem ? 'Edit Item' : 'Add Item'}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingItem(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Item name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    defaultValue={editingItem?.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select category...</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{categoryLabels[cat]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Zone *</label>
                  <select
                    defaultValue={editingItem?.shelf_zone}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select zone...</option>
                    {zoneOptions.map(zone => (
                      <option key={zone} value={zone}>{zone}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">UPC Barcode</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.upc_barcode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="UPC barcode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bin Barcode</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.bin_barcode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Bin barcode"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                  <select
                    defaultValue={editingItem?.unit_of_measure || 'each'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {unitOptions.map(uom => (
                      <option key={uom} value={uom}>{uom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost *</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue={editingItem?.unit_cost}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Quantity</label>
                  <input
                    type="number"
                    defaultValue={editingItem?.min_quantity || 5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Quantity</label>
                  <input
                    type="number"
                    defaultValue={editingItem?.max_quantity || 20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Supplier</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.preferred_supplier}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Supplier name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Item #</label>
                  <input
                    type="text"
                    defaultValue={editingItem?.supplier_item_number}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Item number"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    defaultValue={editingItem?.notes}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>
                <div className="col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked={editingItem?.is_active ?? true}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingItem(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsAddModalOpen(false)
                  setEditingItem(null)
                }}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
              >
                {editingItem ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
