import { supabase, type WorkOrder } from '@/lib/supabase'

/**
 * Get work orders for a specific property
 * Optionally filter by technician assignment
 */
export async function getWorkOrdersForProperty(
  propertyId: string,
  technicianId?: string
): Promise<WorkOrder[]> {
  try {
    let query = supabase
      .from('work_orders')
      .select('*')
      .eq('property_id', propertyId)
      .in('status', ['open', 'in_progress'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (technicianId) {
      query = query.eq('assigned_to', technicianId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching work orders:', error)
    return []
  }
}

/**
 * Get a specific work order by ID
 */
export async function getWorkOrderById(workOrderId: string): Promise<WorkOrder | null> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('id', workOrderId)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching work order:', error)
    return null
  }
}

/**
 * Get all open/in-progress work orders assigned to a technician
 */
export async function getAssignedWorkOrders(technicianId: string): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .eq('assigned_to', technicianId)
      .in('status', ['open', 'in_progress'])
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching assigned work orders:', error)
    return []
  }
}
