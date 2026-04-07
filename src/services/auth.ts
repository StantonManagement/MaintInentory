import { supabase } from '@/lib/supabase'

// Hash PIN using SHA-256
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export interface AuthResult {
  success: boolean
  technicianId?: string
  technicianName?: string
  truckId?: string
  error?: string
}

export async function authenticatePin(pin: string): Promise<AuthResult> {
  try {
    // Hash the PIN
    const pinHash = await hashPin(pin)

    // Query database for matching PIN
    const { data, error } = await supabase
      .from('inv_technician_pins')
      .select('technician_id, technician_name, truck_id, is_active')
      .eq('pin_hash', pinHash)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: 'Invalid PIN'
      }
    }

    // Update last login timestamp
    await supabase
      .from('inv_technician_pins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('technician_id', data.technician_id)

    return {
      success: true,
      technicianId: data.technician_id,
      technicianName: data.technician_name,
      truckId: data.truck_id
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: 'Authentication failed'
    }
  }
}
