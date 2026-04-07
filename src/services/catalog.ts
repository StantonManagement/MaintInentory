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
