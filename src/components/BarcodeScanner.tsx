import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, X, AlertCircle } from 'lucide-react'

interface BarcodeScannerProps {
  onScan: (code: string) => void
  onClose: () => void
  isActive: boolean
}

export function BarcodeScanner({ onScan, onClose, isActive }: BarcodeScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastScan, setLastScan] = useState<string | null>(null)

  useEffect(() => {
    if (!isActive) return

    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode('barcode-reader')
        scannerRef.current = scanner

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        }

        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            // Prevent duplicate scans
            if (decodedText !== lastScan) {
              setLastScan(decodedText)
              onScan(decodedText)

              // Visual feedback
              const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPDTijcJFGS57OujUxMLS6Hn77BtJAU1lcDuzIo3CRRjturs')
              audio.play().catch(() => {}) // Ignore audio errors
            }
          },
          (errorMessage) => {
            // Ignore continuous scan errors
            console.debug('Scan error:', errorMessage)
          }
        )

        setIsScanning(true)
        setError(null)
      } catch (err) {
        console.error('Failed to start scanner:', err)
        setError('Failed to access camera. Please check permissions.')
        setIsScanning(false)
      }
    }

    startScanner()

    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current = null
            setIsScanning(false)
          })
          .catch((err) => console.error('Error stopping scanner:', err))
      }
    }
  }, [isActive, lastScan, onScan])

  if (!isActive) return null

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2 rounded-xl">
            <Camera className="w-6 h-6 text-white" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Scan Barcode</h2>
            <p className="text-sm text-gray-300">Position barcode in the center</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
        >
          <X className="w-6 h-6 text-white" strokeWidth={2} />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="relative">
          {error ? (
            <div className="bg-red-500/20 border-2 border-red-500 rounded-2xl p-8 max-w-md">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="bg-red-500 p-4 rounded-full">
                  <AlertCircle className="w-12 h-12 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Camera Error</h3>
                  <p className="text-gray-300">{error}</p>
                </div>
                <button
                  onClick={onClose}
                  className="mt-4 px-6 py-3 bg-white text-gray-900 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Close Scanner
                </button>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div
                id="barcode-reader"
                className="rounded-2xl overflow-hidden shadow-2xl border-4 border-blue-500"
              />

              {isScanning && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold shadow-xl flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Scanning...
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white/10 backdrop-blur-sm p-6 text-center">
        <p className="text-white font-medium">
          Point your camera at a barcode or QR code
        </p>
        <p className="text-gray-400 text-sm mt-1">
          The item will be added to your cart automatically
        </p>
      </div>
    </div>
  )
}
