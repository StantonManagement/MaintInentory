import { supabase } from '@/lib/supabase'

// Hash PIN using SHA-256 (same as regular auth)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export interface AdminAuthResult {
  success: boolean
  adminId?: string
  adminName?: string
  error?: string
}

/**
 * Admin session storage key
 */
const ADMIN_SESSION_KEY = 'truck_inventory_admin_session'

/**
 * Authenticate admin with PIN
 * Checks for technicians with is_admin flag or special admin table
 */
export async function authenticateAdmin(pin: string): Promise<AdminAuthResult> {
  try {
    // Hash the PIN
    const pinHash = await hashPin(pin)

    // Try to find admin in inv_technician_pins with is_admin flag
    // Note: You may need to add is_admin column to inv_technician_pins table
    const { data, error } = await supabase
      .from('inv_technician_pins')
      .select('id, technician_id, technician_name, is_active')
      .eq('pin_hash', pinHash)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: 'Invalid admin PIN'
      }
    }

    // Store admin session
    const adminSession = {
      adminId: data.id,
      adminName: data.technician_name,
      loginTime: new Date().toISOString(),
    }

    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(adminSession))

    // Update last login timestamp
    await supabase
      .from('inv_technician_pins')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', data.id)

    return {
      success: true,
      adminId: data.id,
      adminName: data.technician_name,
    }
  } catch (error) {
    console.error('Admin authentication error:', error)
    return {
      success: false,
      error: 'Authentication failed'
    }
  }
}

/**
 * Check if admin is currently logged in
 */
export function isAdminAuthenticated(): boolean {
  const session = localStorage.getItem(ADMIN_SESSION_KEY)
  if (!session) return false

  try {
    const adminSession = JSON.parse(session)
    // Check if session is less than 24 hours old
    const loginTime = new Date(adminSession.loginTime)
    const now = new Date()
    const hoursSinceLogin = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

    return hoursSinceLogin < 24
  } catch {
    return false
  }
}

/**
 * Get current admin session
 */
export function getAdminSession(): { adminId: string; adminName: string } | null {
  const session = localStorage.getItem(ADMIN_SESSION_KEY)
  if (!session) return null

  try {
    const adminSession = JSON.parse(session)
    return {
      adminId: adminSession.adminId,
      adminName: adminSession.adminName,
    }
  } catch {
    return null
  }
}

/**
 * Sign out admin
 */
export function signOutAdmin(): void {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}
