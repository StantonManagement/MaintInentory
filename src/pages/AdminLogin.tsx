import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, ArrowLeft } from 'lucide-react'
import { authenticateAdmin } from '@/services/adminAuth'

export function AdminLogin() {
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

  const handleBackToTablet = () => {
    navigate('/')
  }

  const verifyPin = async (pinValue: string) => {
    setIsAuthenticating(true)
    setError('')

    try {
      const result = await authenticateAdmin(pinValue)

      if (result.success && result.adminId && result.adminName) {
        // Show welcome message briefly
        setError(`Welcome, ${result.adminName}!`)

        // Navigate to management dashboard after brief delay
        setTimeout(() => {
          navigate('/inventory/dashboard')
        }, 1000)
      } else {
        setError(result.error || 'Invalid admin PIN')
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
      {/* Back to Tablet Button */}
      <button
        onClick={handleBackToTablet}
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Tablet</span>
      </button>

      {/* Header */}
      <div className="mb-12 text-center">
        <div className="flex justify-center mb-4">
          <Shield className="w-16 h-16 text-gray-800" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">Admin Access</h1>
        <p className="text-gray-600 text-base">Enter your admin 4-digit PIN</p>
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
                backgroundColor: pin.length > index ? '#f9fafb' : 'white',
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
            className={`text-center text-sm mb-4 py-2 px-4 rounded-lg ${
              error.includes('Welcome')
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {error}
          </div>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              disabled={isAuthenticating}
              className="h-20 rounded-2xl bg-white border border-gray-300 text-2xl font-medium text-gray-900 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            disabled={isAuthenticating}
            className="h-20 rounded-2xl bg-white border border-gray-300 text-base font-medium text-gray-600 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            Clear
          </button>
          <button
            onClick={() => handleNumberClick(0)}
            disabled={isAuthenticating}
            className="h-20 rounded-2xl bg-white border border-gray-300 text-2xl font-medium text-gray-900 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed select-none"
          >
            0
          </button>
          <div className="h-20" /> {/* Empty space for layout */}
        </div>
      </div>

      {/* Help Text */}
      <p className="text-sm text-gray-500 text-center max-w-md">
        Admin access is required to manage inventory, view reports, and configure settings.
      </p>
    </div>
  )
}
