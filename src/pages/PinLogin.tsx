import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package } from 'lucide-react'
import { authenticatePin } from '@/services/auth'

export function PinLogin() {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const navigate = useNavigate()

  const handleNumberClick = (num: number) => {
    if (pin.length < 4) {
      const newPin = pin + num
      setPin(newPin)
      if (newPin.length === 4) {
        verifyPin(newPin)
      }
    }
  }

  const handleClear = () => {
    setPin('')
    setError('')
  }

  const verifyPin = async (pinValue: string) => {
    setIsAuthenticating(true)
    setError('')

    try {
      // Call real authentication service
      const result = await authenticatePin(pinValue)

      if (result.success && result.technicianId && result.technicianName && result.truckId) {
        // Show welcome message briefly
        setError(`Welcome, ${result.technicianName}!`)

        // Navigate to home after brief delay
        setTimeout(() => {
          navigate('/home', {
            state: {
              techName: result.technicianName,
              techId: result.technicianId,
              truckId: result.truckId
            }
          })
        }, 1000)
      } else {
        setError(result.error || 'Invalid PIN')
        setPin('')
        setIsAuthenticating(false)
      }
    } catch (err) {
      setError('Authentication failed')
      setPin('')
      setIsAuthenticating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="mb-12 text-center">
        <div className="flex justify-center mb-4">
          <Package className="w-16 h-16 text-gray-800" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">Stanton Inventory</h1>
        <p className="text-gray-600 text-base">Enter your 4-digit PIN</p>
      </div>

      {/* PIN Display */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 w-full max-w-md">
        <div className="flex justify-center gap-4 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className="w-16 h-16 rounded-xl border-2 flex items-center justify-center bg-white transition-all duration-200"
              style={{
                borderColor: pin.length > index ? '#1f2937' : '#e5e7eb',
              }}
            >
              {pin.length > index && (
                <div className="w-3 h-3 rounded-full bg-gray-900" />
              )}
            </div>
          ))}
        </div>

        {/* Error/Success Message */}
        {error && (
          <div
            className={`text-center text-sm font-medium py-2 px-4 rounded-lg ${
              error.includes('Welcome')
                ? 'text-green-700 bg-green-50'
                : 'text-red-700 bg-red-50'
            }`}
          >
            {error}
          </div>
        )}
      </div>

      {/* Numeric Keypad */}
      <div className="w-full max-w-md">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={isAuthenticating}
              className="h-20 text-2xl font-semibold bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            disabled={isAuthenticating}
            className="h-20 text-base font-semibold bg-white text-gray-700 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 active:scale-98 transition-all disabled:opacity-50"
          >
            Clear
          </button>
          <button
            onClick={() => handleNumberClick(0)}
            disabled={isAuthenticating}
            className="h-20 text-2xl font-semibold bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:scale-98 transition-all disabled:opacity-50"
          >
            0
          </button>
          <div className="h-20" /> {/* Empty space */}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-sm text-gray-500">
        <p>Stanton Management © {new Date().getFullYear()}</p>
      </div>
    </div>
  )
}
