import { supabase } from '@/lib/supabase'

// Hash PIN using SHA-256 (same as auth service)
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(pin)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

export interface Truck {
  id: string
  name: string
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Technician {
  id: string
  technician_id: string
  name: string
  pin_hash: string
  is_active: boolean
  created_at: string
  last_login_at: string | null
}

export interface CreateTruckData {
  name: string
  description?: string
}

export interface UpdateTruckData {
  name?: string
  description?: string
  is_active?: boolean
}

export interface CreateTechnicianData {
  technician_id: string
  name: string
  pin: string
}

/**
 * Get all trucks
 */
export async function getTrucks(): Promise<Truck[]> {
  try {
    const { data, error } = await supabase
      .from('inv_trucks')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching trucks:', error)
    return []
  }
}

/**
 * Create a new truck
 */
export async function createTruck(data: CreateTruckData): Promise<{
  success: boolean
  truck?: Truck
  error?: string
}> {
  try {
    const { data: truck, error } = await supabase
      .from('inv_trucks')
      .insert({
        name: data.name,
        description: data.description || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, truck }
  } catch (error) {
    console.error('Error creating truck:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create truck',
    }
  }
}

/**
 * Update a truck
 */
export async function updateTruck(
  id: string,
  data: UpdateTruckData
): Promise<{
  success: boolean
  truck?: Truck
  error?: string
}> {
  try {
    const { data: truck, error } = await supabase
      .from('inv_trucks')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return { success: true, truck }
  } catch (error) {
    console.error('Error updating truck:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update truck',
    }
  }
}

/**
 * Delete a truck (soft delete by setting is_active = false)
 */
export async function deleteTruck(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('inv_trucks')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting truck:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete truck',
    }
  }
}

/**
 * Get all technicians
 */
export async function getTechnicians(): Promise<Technician[]> {
  try {
    const { data, error } = await supabase
      .from('inv_technician_pins')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching technicians:', error)
    return []
  }
}

/**
 * Create a new technician with PIN
 */
export async function createTechnician(data: CreateTechnicianData): Promise<{
  success: boolean
  technician?: Technician
  error?: string
}> {
  try {
    // Hash the PIN
    const pinHash = await hashPin(data.pin)

    const { data: technician, error } = await supabase
      .from('inv_technician_pins')
      .insert({
        technician_id: data.technician_id,
        name: data.name,
        pin_hash: pinHash,
        is_active: true,
      })
      .select()
      .single()

    if (error) throw error

    return { success: true, technician }
  } catch (error) {
    console.error('Error creating technician:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create technician',
    }
  }
}

/**
 * Update technician PIN
 */
export async function updateTechnicianPin(
  id: string,
  newPin: string
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Hash the new PIN
    const pinHash = await hashPin(newPin)

    const { error } = await supabase
      .from('inv_technician_pins')
      .update({
        pin_hash: pinHash,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error updating PIN:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update PIN',
    }
  }
}

/**
 * Deactivate a technician
 */
export async function deactivateTechnician(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('inv_technician_pins')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deactivating technician:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate technician',
    }
  }
}

/**
 * Activate a technician
 */
export async function activateTechnician(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('inv_technician_pins')
      .update({
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error activating technician:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to activate technician',
    }
  }
}
