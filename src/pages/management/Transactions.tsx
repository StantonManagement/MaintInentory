import { useState, useEffect } from 'react'
import {
  Search,
  Download,
  CheckCircle,
  X,
} from 'lucide-react'
import { getTransactions, getTransactionLines } from '@/services/transactions'
import type { Transaction, TransactionLine } from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

export function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedProcessed, setSelectedProcessed] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [transactionLines, setTransactionLines] = useState<TransactionLine[]>([])

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const data = await getTransactions()
      setTransactions(data)
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTransactionLines = async (transactionId: string) => {
    try {
      const lines = await getTransactionLines(transactionId)
      setTransactionLines(lines)
    } catch (error) {
      console.error('Failed to load transaction lines:', error)
    }
  }

  const filteredTransactions = transactions.filter(t => {
    if (searchQuery && !(t.invoice_number?.toLowerCase() || '').includes(searchQuery.toLowerCase())) return false
    if (selectedType && t.transaction_type !== selectedType) return false
    if (selectedProcessed !== '' && t.is_processed.toString() !== selectedProcessed) return false
    return true
  })

  const handleTransactionClick = async (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    await loadTransactionLines(transaction.id)
  }

  const handleMarkProcessed = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from('inv_transactions')
        .update({
          is_processed: true,
          processed_at: new Date().toISOString(),
        })
        .eq('id', transactionId)

      if (error) throw error

      // Reload transactions
      await loadTransactions()

      // Update selected transaction if it's the one being marked
      if (selectedTransaction && selectedTransaction.id === transactionId) {
        setSelectedTransaction({ ...selectedTransaction, is_processed: true })
      }
    } catch (error) {
      console.error('Failed to mark transaction as processed:', error)
      alert('Failed to mark as processed')
    }
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="checkout">Checkout</option>
            <option value="return">Return</option>
            <option value="restock">Restock</option>
            <option value="adjustment">Adjustment</option>
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
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No transactions found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Invoice #</th>
                  <th className="px-6 py-4">Tech</th>
                  <th className="px-6 py-4">Building</th>
                  <th className="px-6 py-4">Unit</th>
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
                    onClick={() => handleTransactionClick(t)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(t.transaction_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{t.invoice_number || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.technician_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-[150px]">
                      {t.property_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.unit_number || '-'}</td>
                    <td className={`px-6 py-4 text-right font-medium ${t.transaction_type === 'return' ? 'text-amber-600' : 'text-gray-900'}`}>
                      {t.transaction_type === 'return' ? '-' : ''}${Math.abs(t.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
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
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkProcessed(t.id)
                      }}
                      disabled={t.is_processed}
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        t.is_processed
                          ? 'bg-green-100 text-green-800 cursor-default'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-pointer'
                      }`}
                    >
                      {t.is_processed ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Yes</>
                      ) : (
                        'Mark Processed'
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
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
                      <p className="font-medium text-gray-900">{selectedTransaction.invoice_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Date</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedTransaction.transaction_date).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Technician</p>
                      <p className="font-medium text-gray-900">{selectedTransaction.technician_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Type</p>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedTransaction.transaction_type === 'checkout'
                          ? 'bg-blue-100 text-blue-800'
                          : selectedTransaction.transaction_type === 'return'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedTransaction.transaction_type}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Location</p>
                    <p className="font-medium text-gray-900">{selectedTransaction.property_name || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{selectedTransaction.unit_number || 'N/A'}</p>
                  </div>
                </div>

                {/* Line Items */}
                <h3 className="font-semibold text-gray-900 mb-4">Line Items</h3>
                {transactionLines.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Loading line items...
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactionLines.map((line) => (
                      <div key={line.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{line.item_name}</p>
                          <p className="text-sm text-gray-600">{line.sku} × {Math.abs(line.quantity)}</p>
                        </div>
                        <p className={`font-medium ${selectedTransaction.transaction_type === 'return' ? 'text-amber-600' : 'text-gray-900'}`}>
                          {selectedTransaction.transaction_type === 'return' ? '-' : ''}${Math.abs(line.line_total).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Total */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className={`text-2xl font-bold ${selectedTransaction.transaction_type === 'return' ? 'text-amber-600' : 'text-gray-900'}`}>
                      {selectedTransaction.transaction_type === 'return' ? '-' : ''}${Math.abs(selectedTransaction.total_amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Panel Footer */}
              <div className="px-6 py-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={() => handleMarkProcessed(selectedTransaction.id)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    selectedTransaction.is_processed
                      ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={selectedTransaction.is_processed}
                >
                  {selectedTransaction.is_processed ? 'Already Processed' : 'Mark as Processed'}
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
