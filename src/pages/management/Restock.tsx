import { useState } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  Package,
  Download,
  FileText,
} from 'lucide-react'
import { catalogItems, categoryLabels } from '../../data/mock/catalog'
import { stockLevels } from '../../data/mock/technicians'

interface AlertItem {
  catalog_item_id: string
  name: string
  category: string
  current_quantity: number
  min_quantity: number
  max_quantity: number
  reorder_quantity: number
  supplier: string
  alert_sent: boolean
}

export function RestockPage() {
  const [activeTab, setActiveTab] = useState<'alerts' | 'template' | 'reports'>('alerts')
  const [restockQty, setRestockQty] = useState<Record<string, number>>({})

  // Generate alerts from stock levels below minimum
  const activeAlerts: AlertItem[] = stockLevels
    .map(stock => {
      const item = catalogItems.find(c => c.id === stock.catalog_item_id)
      if (!item || !item.is_active) return null
      const isBelowMin = stock.current_quantity <= item.min_quantity
      if (!isBelowMin) return null
      return {
        catalog_item_id: stock.catalog_item_id,
        name: item.name,
        category: item.category,
        current_quantity: stock.current_quantity,
        min_quantity: item.min_quantity,
        max_quantity: item.max_quantity,
        reorder_quantity: item.max_quantity - stock.current_quantity,
        supplier: item.preferred_supplier || 'N/A',
        alert_sent: true,
      }
    })
    .filter(Boolean) as AlertItem[]

  // Generate full template view
  const templateItems = stockLevels.map(stock => {
    const item = catalogItems.find(c => c.id === stock.catalog_item_id)
    if (!item) return null
    const gap = item.max_quantity - stock.current_quantity
    let status: 'ok' | 'low' | 'reorder' = 'ok'
    if (stock.current_quantity <= item.min_quantity) {
      status = 'reorder'
    } else if (stock.current_quantity <= item.min_quantity + 2) {
      status = 'low'
    }
    return {
      catalog_item_id: stock.catalog_item_id,
      name: item.name,
      category: item.category,
      zone: item.shelf_zone,
      current: stock.current_quantity,
      max: item.max_quantity,
      gap,
      status,
    }
  }).filter(Boolean)

  const weeklyReports = [
    { date: '2025-04-04', items_below: 3, total_items: 15 },
    { date: '2025-03-28', items_below: 5, total_items: 15 },
    { date: '2025-03-21', items_below: 2, total_items: 14 },
    { date: '2025-03-14', items_below: 4, total_items: 15 },
  ]

  const handleMarkRestocked = (itemId: string) => {
    console.log('Marking restocked:', itemId, 'Quantity:', restockQty[itemId])
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Restock Management</h1>
        <p className="text-gray-600 mt-1">Manage inventory alerts and truck template</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'alerts'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Active Alerts
            {activeAlerts.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {activeAlerts.length}
              </span>
            )}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('template')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'template'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Truck Template
          </span>
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-gray-900 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Weekly Reports
          </span>
        </button>
      </div>

      {/* Active Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {activeAlerts.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">No Active Alerts</h3>
              <p className="text-gray-600 mt-1">All items are above minimum levels</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Item</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Current</th>
                    <th className="px-6 py-4 text-center">Min</th>
                    <th className="px-6 py-4 text-center">Reorder Qty</th>
                    <th className="px-6 py-4">Supplier</th>
                    <th className="px-6 py-4 text-center">Alert Sent</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activeAlerts.map((alert) => (
                    <tr key={alert.catalog_item_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{alert.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{categoryLabels[alert.category]}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {alert.current_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-600">{alert.min_quantity}</td>
                      <td className="px-6 py-4 text-center font-medium text-amber-600">
                        {alert.reorder_quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{alert.supplier}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          alert.alert_sent ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {alert.alert_sent ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center gap-2 justify-center">
                          <input
                            type="number"
                            min="1"
                            defaultValue={alert.reorder_quantity}
                            onChange={(e) => setRestockQty({
                              ...restockQty,
                              [alert.catalog_item_id]: parseInt(e.target.value) || 0
                            })}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                          />
                          <button
                            onClick={() => handleMarkRestocked(alert.catalog_item_id)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                          >
                            Mark Restocked
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Truck Template Tab */}
      {activeTab === 'template' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Full Inventory Snapshot</h2>
            <p className="text-sm text-gray-600">Current state vs. ideal template levels</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Zone</th>
                  <th className="px-6 py-4 text-center">Current</th>
                  <th className="px-6 py-4 text-center">Max (Template)</th>
                  <th className="px-6 py-4 text-center">Gap</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {templateItems.map((item: any) => (
                  <tr key={item.catalog_item_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{categoryLabels[item.category]}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.zone}</td>
                    <td className="px-6 py-4 text-center font-medium">{item.current}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{item.max}</td>
                    <td className="px-6 py-4 text-center font-medium text-amber-600">{item.gap}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === 'reorder'
                          ? 'bg-red-100 text-red-800'
                          : item.status === 'low'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {item.status === 'reorder' ? 'Reorder' : item.status === 'low' ? 'Low' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Weekly Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Inventory Reports</h2>
            <p className="text-sm text-gray-600">Historical restock reports (Fridays)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Report Date</th>
                  <th className="px-6 py-4 text-center">Items Below Min</th>
                  <th className="px-6 py-4 text-center">Total Items</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {weeklyReports.map((report, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {new Date(report.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        report.items_below > 0 ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {report.items_below}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600">{report.total_items}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          View
                        </button>
                        <button className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors">
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
