import { useState } from 'react'
import { Edit2, Check, X, Lock, Unlock } from 'lucide-react'
import { trucks, technicians } from '../../data/mock/technicians'

export function TrucksPage() {
  const [editingTech, setEditingTech] = useState<string | null>(null)
  const [pinInputs, setPinInputs] = useState<Record<string, string>>({})
  const [showPin, setShowPin] = useState<Record<string, boolean>>({})

  const handleSavePin = (techId: string) => {
    console.log('Saving PIN for tech:', techId, 'PIN:', pinInputs[techId])
    setEditingTech(null)
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trucks & Settings</h1>
        <p className="text-gray-600 mt-1">Manage trucks and technician PINs</p>
      </div>

      {/* Trucks Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Trucks</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {trucks.map((truck) => (
                <tr key={truck.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{truck.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{truck.description}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      truck.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {truck.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => console.log('Edit truck:', truck.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Technician PINs Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Technician PINs</h2>
          <p className="text-sm text-gray-600">Manage PIN codes for tablet access</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Technician</th>
                <th className="px-6 py-4">PIN</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {technicians.map((tech) => (
                <tr key={tech.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{tech.name}</td>
                  <td className="px-6 py-4">
                    {editingTech === tech.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type={showPin[tech.id] ? 'text' : 'password'}
                          maxLength={4}
                          defaultValue={tech.pin}
                          onChange={(e) => setPinInputs({
                            ...pinInputs,
                            [tech.id]: e.target.value
                          })}
                          className="w-20 px-3 py-1 border border-gray-300 rounded text-center font-mono"
                          placeholder="0000"
                        />
                        <button
                          onClick={() => setShowPin({ ...showPin, [tech.id]: !showPin[tech.id] })}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {showPin[tech.id] ? (
                            <Unlock className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Lock className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="font-mono text-gray-600">••••</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      tech.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tech.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {editingTech === tech.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleSavePin(tech.id)}
                          className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => setEditingTech(null)}
                          className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingTech(tech.id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
