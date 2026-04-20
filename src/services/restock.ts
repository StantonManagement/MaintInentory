import { supabase } from '@/lib/supabase'

export interface RestockAlert {
  catalog_item_id: string
  name: string
  category: string
  current_quantity: number
  min_quantity: number
  max_quantity: number
  reorder_quantity: number
  supplier: string
  alert_sent: boolean
}

export interface TemplateItem {
  catalog_item_id: string
  name: string
  category: string
  zone: string | null
  current: number
  max: number
  gap: number
  status: 'ok' | 'low' | 'reorder'
}

/**
 * Get active restock alerts (items below minimum)
 */
export async function getRestockAlerts(): Promise<RestockAlert[]> {
  try {
    const { data, error } = await supabase
      .from('inv_stock_levels')
      .select(`
        current_quantity,
        catalog_item_id,
        inv_catalog!inner(
          id,
          name,
          category,
          min_quantity,
          max_quantity,
          supplier,
          is_active
        )
      `)
      .eq('inv_catalog.is_active', true)

    if (error) throw error

    // Filter items below minimum and map to RestockAlert
    const alerts = data
      ?.filter((stock: unknown) => {
        const s = stock as { current_quantity: number; inv_catalog: unknown }
        const catalog = s.inv_catalog as { min_quantity: number }
        return s.current_quantity <= catalog.min_quantity
      })
      .map((stock: unknown) => {
        const s = stock as { current_quantity: number; inv_catalog: unknown }
        const catalog = s.inv_catalog as {
          id: string
          name: string
          category: string
          min_quantity: number
          max_quantity: number
          supplier: string | null
        }
        return {
          catalog_item_id: catalog.id,
          name: catalog.name,
          category: catalog.category,
          current_quantity: s.current_quantity,
          min_quantity: catalog.min_quantity,
          max_quantity: catalog.max_quantity,
          reorder_quantity: catalog.max_quantity - s.current_quantity,
          supplier: catalog.supplier || 'N/A',
          alert_sent: true,
        }
      }) || []

    return alerts
  } catch (error) {
    console.error('Error fetching restock alerts:', error)
    return []
  }
}

/**
 * Get truck template (all items with current vs max comparison)
 */
export async function getTruckTemplate(): Promise<TemplateItem[]> {
  try {
    const { data, error } = await supabase
      .from('inv_stock_levels')
      .select(`
        current_quantity,
        catalog_item_id,
        inv_catalog!inner(
          id,
          name,
          category,
          shelf_zone,
          min_quantity,
          max_quantity,
          is_active
        )
      `)
      .eq('inv_catalog.is_active', true)

    if (error) throw error

    // Map to TemplateItem
    const items = data?.map((stock: unknown) => {
      const s = stock as { current_quantity: number; inv_catalog: unknown }
      const catalog = s.inv_catalog as {
        id: string
        name: string
        category: string
        shelf_zone: string | null
        min_quantity: number
        max_quantity: number
      }

      const gap = catalog.max_quantity - s.current_quantity
      let status: 'ok' | 'low' | 'reorder' = 'ok'

      if (s.current_quantity <= catalog.min_quantity) {
        status = 'reorder'
      } else if (s.current_quantity <= catalog.min_quantity + 2) {
        status = 'low'
      }

      return {
        catalog_item_id: catalog.id,
        name: catalog.name,
        category: catalog.category,
        zone: catalog.shelf_zone,
        current: s.current_quantity,
        max: catalog.max_quantity,
        gap,
        status,
      }
    }) || []

    return items
  } catch (error) {
    console.error('Error fetching truck template:', error)
    return []
  }
}

/**
 * Mark item as restocked (update stock level)
 */
export async function markItemRestocked(
  catalogItemId: string,
  quantity: number,
  truckId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current stock level
    const { data: stockData, error: fetchError } = await supabase
      .from('inv_stock_levels')
      .select('current_quantity')
      .eq('catalog_item_id', catalogItemId)
      .eq('truck_id', truckId)
      .single()

    if (fetchError) throw fetchError

    const newQuantity = (stockData?.current_quantity || 0) + quantity

    // Update stock level
    const { error: updateError } = await supabase
      .from('inv_stock_levels')
      .update({
        current_quantity: newQuantity,
        last_counted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('catalog_item_id', catalogItemId)
      .eq('truck_id', truckId)

    if (updateError) throw updateError

    // Create restock transaction
    const { data: catalogItem } = await supabase
      .from('inv_catalog')
      .select('name, sku, unit_cost')
      .eq('id', catalogItemId)
      .single()

    if (catalogItem) {
      const invoiceNumber = `REST-${Date.now()}`

      // Create transaction header
      const { data: transaction, error: txError } = await supabase
        .from('inv_transactions')
        .insert({
          truck_id: truckId,
          transaction_type: 'restock',
          technician_id: 'admin',
          technician_name: 'Admin',
          property_id: null,
          property_name: null,
          unit_id: null,
          unit_number: null,
          total_amount: catalogItem.unit_cost * quantity,
          invoice_number: invoiceNumber,
          is_processed: true,
          transaction_date: new Date().toISOString(),
        })
        .select()
        .single()

      if (txError) throw txError

      // Create transaction line
      await supabase
        .from('inv_transaction_lines')
        .insert({
          transaction_id: transaction.id,
          catalog_item_id: catalogItemId,
          sku: catalogItem.sku,
          item_name: catalogItem.name,
          quantity: quantity,
          unit_price: catalogItem.unit_cost,
          line_total: catalogItem.unit_cost * quantity,
        })
    }

    return { success: true }
  } catch (error) {
    console.error('Error marking item as restocked:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update stock',
    }
  }
}

/**
 * Get weekly restock reports
 * Shows restock activity for the last 4 weeks
 */
export async function getWeeklyReports(): Promise<{
  date: string
  items_below: number
  total_items: number
}[]> {
  try {
    // Get total active catalog items
    const { count: totalItems } = await supabase
      .from('inv_catalog')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    const catalogCount = totalItems || 60

    // Get restock transactions from the last 5 weeks
    const fiveWeeksAgo = new Date()
    fiveWeeksAgo.setDate(fiveWeeksAgo.getDate() - 35)

    const { data: transactions, error } = await supabase
      .from('inv_transactions')
      .select('transaction_date, id')
      .eq('transaction_type', 'restock')
      .gte('transaction_date', fiveWeeksAgo.toISOString())
      .order('transaction_date', { ascending: false })

    if (error) throw error

    // Get transaction lines to count unique items restocked
    const transactionIds = transactions?.map(t => t.id) || []

    if (transactionIds.length === 0) {
      // No restock history, return empty reports
      return generateEmptyWeeklyReports(catalogCount)
    }

    const { data: transactionLines } = await supabase
      .from('inv_transaction_lines')
      .select('transaction_id, catalog_item_id')
      .in('transaction_id', transactionIds)

    // Group transactions by week
    const weeklyData: Record<string, Set<string>> = {}

    transactions?.forEach(tx => {
      const txDate = new Date(tx.transaction_date)
      // Get the Friday of that week
      const dayOfWeek = txDate.getDay()
      const daysToFriday = (5 - dayOfWeek + 7) % 7
      const friday = new Date(txDate)
      friday.setDate(txDate.getDate() + daysToFriday)
      const fridayStr = friday.toISOString().split('T')[0]

      if (!weeklyData[fridayStr]) {
        weeklyData[fridayStr] = new Set()
      }

      // Add all items from this transaction to the week
      const linesForTx = transactionLines?.filter(line => line.transaction_id === tx.id) || []
      linesForTx.forEach(line => {
        weeklyData[fridayStr].add(line.catalog_item_id)
      })
    })

    // Convert to report format
    const reports = Object.entries(weeklyData)
      .map(([date, itemsSet]) => ({
        date,
        items_below: itemsSet.size, // Number of unique items restocked that week
        total_items: catalogCount,
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4) // Keep only last 4 weeks

    // If we don't have 4 weeks of data, pad with empty weeks
    while (reports.length < 4) {
      const lastDate = reports.length > 0
        ? new Date(reports[reports.length - 1].date)
        : new Date()

      lastDate.setDate(lastDate.getDate() - 7)
      reports.push({
        date: lastDate.toISOString().split('T')[0],
        items_below: 0,
        total_items: catalogCount,
      })
    }

    return reports
  } catch (error) {
    console.error('Error fetching weekly reports:', error)
    return generateEmptyWeeklyReports(60)
  }
}

/**
 * Generate empty weekly reports for the last 4 weeks
 */
function generateEmptyWeeklyReports(totalItems: number): {
  date: string
  items_below: number
  total_items: number
}[] {
  const reports = []
  const today = new Date()

  for (let i = 0; i < 4; i++) {
    const weekDate = new Date(today)
    weekDate.setDate(today.getDate() - (i * 7))

    // Get the Friday of that week
    const dayOfWeek = weekDate.getDay()
    const daysToFriday = (5 - dayOfWeek + 7) % 7
    const friday = new Date(weekDate)
    friday.setDate(weekDate.getDate() + daysToFriday)

    reports.push({
      date: friday.toISOString().split('T')[0],
      items_below: 0,
      total_items: totalItems,
    })
  }

  return reports
}
