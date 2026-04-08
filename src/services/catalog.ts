import { supabase, type CatalogItem } from '@/lib/supabase'

export async function getCatalogItems(): Promise<CatalogItem[]> {
  try {
    const { data, error } = await supabase
      .from('inv_catalog')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching catalog:', error)
    return []
  }
}

export async function searchCatalogItems(query: string): Promise<CatalogItem[]> {
  try {
    const { data, error } = await supabase
      .from('inv_catalog')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,barcode.ilike.%${query}%`)
      .order('name')
      .limit(50)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error searching catalog:', error)
    return []
  }
}

export async function getCatalogItemByBarcode(barcode: string): Promise<CatalogItem | null> {
  try {
    const { data, error } = await supabase
      .from('inv_catalog')
      .select('*')
      .eq('barcode', barcode)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching item by barcode:', error)
    return null
  }
}

export interface CreateCatalogItemData {
  sku: string
  name: string
  description?: string
  category: string
  shelf_zone?: string
  barcode?: string
  unit_cost: number
  unit_of_measure: string
  min_quantity: number
  max_quantity: number
  supplier?: string
  notes?: string
}

export interface UpdateCatalogItemData extends Partial<CreateCatalogItemData> {
  is_active?: boolean
}

/**
 * Create a new catalog item
 */
export async function createCatalogItem(data: CreateCatalogItemData): Promise<{
  success: boolean
  item?: CatalogItem
  error?: string
}> {
  try {
    const { data: item, error } = await supabase
      .from('inv_catalog')
      .insert({
        ...data,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      item,
    }
  } catch (error) {
    console.error('Error creating catalog item:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create item',
    }
  }
}

/**
 * Update an existing catalog item
 */
export async function updateCatalogItem(
  id: string,
  data: UpdateCatalogItemData
): Promise<{
  success: boolean
  item?: CatalogItem
  error?: string
}> {
  try {
    const { data: item, error } = await supabase
      .from('inv_catalog')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      item,
    }
  } catch (error) {
    console.error('Error updating catalog item:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update item',
    }
  }
}

/**
 * Soft delete a catalog item (set is_active = false)
 */
export async function deleteCatalogItem(id: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase
      .from('inv_catalog')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error deleting catalog item:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete item',
    }
  }
}

/**
 * Get all catalog items including inactive ones (for management interface)
 */
export async function getAllCatalogItems(): Promise<CatalogItem[]> {
  try {
    const { data, error } = await supabase
      .from('inv_catalog')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching all catalog items:', error)
    return []
  }
}
