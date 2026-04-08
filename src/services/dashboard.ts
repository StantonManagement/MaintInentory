import { supabase } from '@/lib/supabase'

export interface DashboardMetrics {
  totalCatalogItems: number
  belowMinCount: number
  transactionsToday: number
  spendThisWeek: number
  spendThisMonth: number
}

export interface BelowMinItem {
  id: string
  name: string
  category: string
  current_quantity: number
  min_quantity: number
  max_quantity: number
  reorder_quantity: number
}

export interface RecentTransaction {
  id: string
  transaction_date: string
  transaction_type: string
  technician_name: string
  property_name: string | null
  unit_number: string | null
  total_amount: number
  invoice_number: string | null
}

/**
 * Fetch dashboard metrics from Supabase
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    // Total active catalog items
    const { count: totalCatalogItems, error: catalogError } = await supabase
      .from('inv_catalog')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    if (catalogError) throw catalogError

    // Items below minimum - join stock levels with catalog
    const { data: stockData, error: stockError } = await supabase
      .from('inv_stock_levels')
      .select(`
        current_quantity,
        catalog_item_id,
        inv_catalog!inner(min_quantity, is_active)
      `)

    if (stockError) throw stockError

    // Count items where current_quantity <= min_quantity
    const belowMinCount = stockData?.filter((stock: any) =>
      stock.inv_catalog.is_active &&
      stock.current_quantity <= stock.inv_catalog.min_quantity
    ).length || 0

    // Transactions today
    const today = new Date().toISOString().split('T')[0]
    const { count: transactionsToday, error: todayError } = await supabase
      .from('inv_transactions')
      .select('*', { count: 'exact', head: true })
      .gte('transaction_date', `${today}T00:00:00`)
      .lte('transaction_date', `${today}T23:59:59`)

    if (todayError) throw todayError

    // Spend this week (last 7 days, checkouts only)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const { data: weekData, error: weekError } = await supabase
      .from('inv_transactions')
      .select('total_amount')
      .eq('transaction_type', 'checkout')
      .gte('transaction_date', weekAgo.toISOString())

    if (weekError) throw weekError

    const spendThisWeek = weekData?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0

    // Spend this month (last 30 days, checkouts only)
    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    const { data: monthData, error: monthError } = await supabase
      .from('inv_transactions')
      .select('total_amount')
      .eq('transaction_type', 'checkout')
      .gte('transaction_date', monthAgo.toISOString())

    if (monthError) throw monthError

    const spendThisMonth = monthData?.reduce((sum, t) => sum + (t.total_amount || 0), 0) || 0

    return {
      totalCatalogItems: totalCatalogItems || 0,
      belowMinCount,
      transactionsToday: transactionsToday || 0,
      spendThisWeek,
      spendThisMonth,
    }
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return {
      totalCatalogItems: 0,
      belowMinCount: 0,
      transactionsToday: 0,
      spendThisWeek: 0,
      spendThisMonth: 0,
    }
  }
}

/**
 * Get items below minimum stock level
 */
export async function getBelowMinItems(): Promise<BelowMinItem[]> {
  try {
    const { data, error } = await supabase
      .from('inv_stock_levels')
      .select(`
        current_quantity,
        inv_catalog!inner(
          id,
          name,
          category,
          min_quantity,
          max_quantity,
          is_active
        )
      `)

    if (error) throw error

    // Filter and map to BelowMinItem
    const belowMinItems = data
      ?.filter((stock: any) =>
        stock.inv_catalog.is_active &&
        stock.current_quantity <= stock.inv_catalog.min_quantity
      )
      .map((stock: any) => ({
        id: stock.inv_catalog.id,
        name: stock.inv_catalog.name,
        category: stock.inv_catalog.category,
        current_quantity: stock.current_quantity,
        min_quantity: stock.inv_catalog.min_quantity,
        max_quantity: stock.inv_catalog.max_quantity,
        reorder_quantity: stock.inv_catalog.max_quantity - stock.current_quantity,
      })) || []

    return belowMinItems
  } catch (error) {
    console.error('Error fetching below min items:', error)
    return []
  }
}

/**
 * Get recent transactions (last 10)
 */
export async function getRecentTransactions(): Promise<RecentTransaction[]> {
  try {
    const { data, error } = await supabase
      .from('inv_transactions')
      .select('id, transaction_date, transaction_type, technician_name, property_name, unit_number, total_amount, invoice_number')
      .order('transaction_date', { ascending: false })
      .limit(10)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    return []
  }
}
