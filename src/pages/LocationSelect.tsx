import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Package, ChevronLeft, MapPin } from 'lucide-react'
import { getProperties, getUnitsByProperty, type Property, type Unit } from '@/services/properties'

export function LocationSelect() {
  const navigate = useNavigate()
  const location = useLocation()
  const { techName = 'Technician', techId = '', truckId = '' } = location.state || {}

  const [selectedProperty, setSelectedProperty] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [isLoadingProperties, setIsLoadingProperties] = useState(false)
  const [isLoadingUnits, setIsLoadingUnits] = useState(false)

  // Load properties on mount
  useEffect(() => {
    loadProperties()
  }, [])

  // Load units when property is selected
  useEffect(() => {
    if (selectedProperty) {
      loadUnits(selectedProperty)
    } else {
      setUnits([])
    }
  }, [selectedProperty])

  const loadProperties = async () => {
    setIsLoadingProperties(true)
    try {
      const data = await getProperties()
      setProperties(data)
    } catch (error) {
      console.error('Failed to load properties:', error)
    } finally {
      setIsLoadingProperties(false)
    }
  }

  const loadUnits = async (propertyId: string) => {
    setIsLoadingUnits(true)
    try {
      const data = await getUnitsByProperty(propertyId)
      setUnits(data)
    } catch (error) {
      console.error('Failed to load units:', error)
    } finally {
      setIsLoadingUnits(false)
    }
  }

  const handleBack = () => {
    navigate('/home', { state: { techName, techId, truckId } })
  }

  const handleNext = () => {
    if (!selectedProperty || !selectedUnit) {
      return
    }

    const property = properties.find(p => p.id === selectedProperty)
    const unit = units.find(u => u.id === selectedUnit)

    navigate('/scanner', {
      state: {
        techName,
        techId,
        truckId,
        propertyId: selectedProperty,
        propertyName: property?.address || property?.name || '',
        unitId: selectedUnit,
        unitNumber: unit?.unit_number || '',
      },
    })
  }

  const canProceed = selectedProperty && selectedUnit

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 p-6">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-3 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all border border-gray-200"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            <span className="text-lg font-bold">Back</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-2xl shadow-lg">
              <Package className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Select Location</h1>
              <p className="text-sm text-gray-600 font-medium mt-0.5">{techName}</p>
            </div>
          </div>
          <div className="w-32" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-3xl bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 space-y-10 border border-gray-200/50">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            <div className="bg-blue-50 p-4 rounded-2xl">
              <MapPin className="w-10 h-10 text-blue-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                Select Destination
              </p>
              <p className="text-sm text-gray-600 mt-1">Which property and unit are these items for?</p>
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
                setSelectedUnit('') // Reset unit when property changes
              }}
              disabled={isLoadingProperties}
              className="w-full h-18 px-6 text-lg font-medium border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white shadow-sm hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {isLoadingProperties ? 'Loading properties...' : 'Select a property...'}
              </option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.address}
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
              Unit
            </label>
            <select
              id="unit"
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              disabled={!selectedProperty || isLoadingUnits}
              className="w-full h-18 px-6 text-lg font-medium border-2 border-gray-300 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed shadow-sm hover:border-gray-400 disabled:hover:border-gray-300"
            >
              <option value="">
                {isLoadingUnits
                  ? 'Loading units...'
                  : selectedProperty
                    ? 'Select a unit...'
                    : 'Select property first'}
              </option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  Unit {unit.unit_number}
                </option>
              ))}
            </select>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="w-full h-24 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-3xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl active:scale-98 transition-all disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none border border-blue-500/30"
          >
            Next: Scan Items →
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
