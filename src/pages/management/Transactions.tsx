import { useState } from 'react'
import {
  Search,
  Download,
  CheckCircle,
  X,
} from 'lucide-react'
import { transactions, type Transaction } from '../../data/mock/transactions'
import { technicians } from '../../data/mock/technicians'
import { properties } from '../../data/mock/properties'

export function TransactionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTech, setSelectedTech] = useState('')
  const [selectedBuilding, setSelectedBuilding] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedProcessed, setSelectedProcessed] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const filteredTransactions = transactions.filter(t => {
    if (searchQuery && !t.invoice_number.toLowerCase().includes(searchQuery.toLowerCase())) return false
    if (selectedTech && t.tech_id !== selectedTech) return false
    if (selectedBuilding && !t.property_name.includes(selectedBuilding)) return false
    if (selectedStatus && t.status !== selectedStatus) return false
    if (selectedType && t.type !== selectedType) return false
    if (selectedProcessed !== '' && t.processed.toString() !== selectedProcessed) return false
    return true
  })

  const handleMarkProcessed = (transactionId: string) => {
    // In real app, this would update the database
    console.log('Marking processed:', transactionId)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-600 mt-1">View and manage all inventory transactions</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by invoice number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={selectedTech}
            onChange={(e) => setSelectedTech(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Technicians</option>
            {technicians.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Buildings</option>
            {properties.map(p => (
              <option key={p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="in_progress">In Progress</option>
          </select>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="checkout">Checkout</option>
            <option value="return">Return</option>
          </select>
          <select
            value={selectedProcessed}
            onChange={(e) => setSelectedProcessed(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Processing Status</option>
            <option value="true">Processed</option>
            <option value="false">Unprocessed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Tech</th>
                <th className="px-6 py-4">Building</th>
                <th className="px-6 py-4">Unit</th>
                <th className="px-6 py-4 text-center">Items</th>
                <th className="px-6 py-4 text-right">Total</th>
                <th className="px-6 py-4 text-center">Type</th>
                <th className="px-6 py-4 text-center">Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTransactions.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTransaction(t)}
                >
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{t.invoice_number}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.tech_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[150px]">
                    {t.property_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{t.unit_number}</td>
                  <td className="px-6 py-4 text-center text-sm text-gray-600">{t.items_count}</td>
                  <td className={`px-6 py-4 text-right font-medium ${t.type === 'return' ? 'text-amber-600' : 'text-gray-900'}`}>
                    {t.type === 'return' ? '-' : ''}${Math.abs(t.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      t.type === 'checkout'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {t.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkProcessed(t.id)
                      }}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        t.processed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {t.processed ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Yes</>
                      ) : (
                        'No'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide Panel */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedTransaction(null)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl">
            <div className="h-full flex flex-col">
              {/* Panel Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Content */}
              <div className="flex-1 overflow-auto p-6">
                {/* Header Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Invoice #</p>
                      <p className="font-medium text-gray-900">{selectedTransaction.invoice_number}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedTransaction.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Technician</p>
                      <p className="font-medium text-gray-900">{selectedTransaction.tech_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Type</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedTransaction.type === 'checkout'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {selectedTransaction.type}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Location</p>
                    <p className="font-medium text-gray-900">{selectedTransaction.property_name}</p>
                    <p className="text-sm text-gray-600">{selectedTransaction.unit_number}</p>
                  </div>
                </div>

                {/* Line Items */}
                <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
                <div className="space-y-3">
                  {selectedTransaction.lines.map((line) => (
                    <div key={line.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{line.item_name}</p>
                        <p className="text-sm text-gray-600">{line.sku} × {Math.abs(line.quantity)}</p>
                      </div>
                      <p className={`font-medium ${line.quantity < 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                        {line.quantity < 0 ? '-' : ''}${Math.abs(line.line_total).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className={`text-2xl font-bold ${selectedTransaction.total < 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                      {selectedTransaction.total < 0 ? '-' : ''}${Math.abs(selectedTransaction.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Panel Footer */}
              <div className="px-6 py-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => handleMarkProcessed(selectedTransaction.id)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedTransaction.processed
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={selectedTransaction.processed}
                >
                  {selectedTransaction.processed ? 'Already Processed' : 'Mark as Processed'}
                </button>
                <button className="w-full py-2 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
