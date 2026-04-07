import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ChevronLeft, MapPin, RotateCcw } from 'lucide-react'
import { properties, commonAreaOptions } from '../data/mock/properties'

export function ReturnLocationSelect() {
  const navigate = useNavigate()
  const location = useLocation()
  const { techName = 'Technician', techId = '' } = location.state || {}

  const [selectedProperty, setSelectedProperty] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')

  // Get units for selected property plus common area options
  const unitOptions = selectedProperty
    ? [
        ...commonAreaOptions.map((area, idx) => ({ id: `common_${idx}`, number: area })),
        // Add actual units from properties data
        { id: 'u1', number: 'Unit 101' },
        { id: 'u2', number: 'Unit 102' },
        { id: 'u3', number: 'Unit 201' },
        { id: 'u4', number: 'Unit 202' },
      ]
    : []

  const handleBack = () => {
    navigate('/home', { state: { techName, techId } })
  }

  const handleNext = () => {
    if (!selectedProperty || !selectedUnit) {
      return
    }

    navigate('/return-scanner', {
      state: {
        techName,
        techId,
        propertyId: selectedProperty,
        unitId: selectedUnit,
      },
    })
  }

  const canProceed = selectedProperty && selectedUnit

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-amber-200/50 p-6">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
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
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">RETURN ITEMS</h1>
              <p className="text-sm text-amber-700 font-medium mt-0.5">{techName}</p>
            </div>
          </div>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 space-y-10 border border-amber-200/50">
          <div className="flex items-center gap-4 pb-6 border-b border-amber-200">
            <div className="bg-amber-100 p-4 rounded-2xl">
              <MapPin className="w-10 h-10 text-amber-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                Select Return Location
              </p>
              <p className="text-sm text-gray-600 mt-1">Which property and unit are these items being returned from?</p>
            </div>
          </div>

          {/* Property Dropdown */}
          <div className="space-y-4">
            <label
              htmlFor="property"
              className="block text-xl font-bold text-gray-800"
            >
              Property
            </label>
            <select
              id="property"
              value={selectedProperty}
              onChange={(e) => {
                setSelectedProperty(e.target.value)
                setSelectedUnit('')
              }}
              className="w-full h-18 px-6 text-lg font-medium border-2 border-gray-300 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all bg-white shadow-sm hover:border-gray-400"
            >
              <option value="">Select a property...</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name} — {property.address}
                </option>
              ))}
            </select>
          </div>

          {/* Unit Dropdown */}
          <div className="space-y-4">
            <label
              htmlFor="unit"
              className="block text-xl font-bold text-gray-800"
            >
              Unit / Location
            </label>
            <select
              id="unit"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              disabled={!selectedProperty}
              className="w-full h-18 px-6 text-lg font-medium border-2 border-gray-300 rounded-2xl focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm hover:border-gray-400 disabled:hover:border-gray-300"
            >
              <option value="">
                {selectedProperty ? 'Select a unit...' : 'Select property first'}
              </option>
              {unitOptions.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.number}
                </option>
              ))}
            </select>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full h-24 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-3xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl active:scale-98 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none border border-amber-500/30"
          >
            Next: Scan Returns →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 text-center text-sm text-gray-500">
        <p>Stanton Management © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
