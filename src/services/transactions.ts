import { supabase, type Transaction, type TransactionLine } from '@/lib/supabase'

interface CartItem {
  id: string
  sku: string
  name: string
  price: number
  quantity: number
}

interface CreateTransactionParams {
  truckId: string
  technicianId: string
  technicianName: string
  propertyId?: string
  propertyName?: string
  unitId?: string
  unitNumber?: string
  workOrderId?: string
  transactionType: 'checkout' | 'return'
  cart: CartItem[]
  notes?: string
}

export async function createTransaction(params: CreateTransactionParams): Promise<{
  success: boolean
  transactionId?: string
  invoiceNumber?: string
  error?: string
}> {
  try {
    const total = params.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const invoiceNumber = `INV-${Date.now().toString().slice(-8)}`

    // Insert transaction header
    const { data: transaction, error: transactionError } = await supabase
      .from('inv_transactions')
      .insert({
        truck_id: params.truckId,
        transaction_type: params.transactionType,
        technician_id: params.technicianId,
        technician_name: params.technicianName,
        property_id: params.propertyId,
        property_name: params.propertyName,
        unit_id: params.unitId,
        unit_number: params.unitNumber,
        work_order_id: params.workOrderId,
        total_amount: total,
        invoice_number: invoiceNumber,
        notes: params.notes,
        is_processed: false
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    // Insert transaction lines
    const lines = params.cart.map(item => ({
      transaction_id: transaction.id,
      catalog_item_id: item.id,
      sku: item.sku,
      item_name: item.name,
      quantity: item.quantity,
      unit_cost: item.price,
      line_total: item.price * item.quantity
    }))

    const { error: linesError } = await supabase
      .from('inv_transaction_lines')
      .insert(lines)

    if (linesError) throw linesError

    // Update stock levels
    for (const item of params.cart) {
      const quantityChange = params.transactionType === 'checkout'
        ? -item.quantity
        : item.quantity

      // Get current stock
      const { data: stock } = await supabase
        .from('inv_stock_levels')
        .select('current_quantity')
        .eq('truck_id', params.truckId)
        .eq('catalog_item_id', item.id)
        .single()

      if (stock) {
        // Update existing stock
        await supabase
          .from('inv_stock_levels')
          .update({
            current_quantity: stock.current_quantity + quantityChange,
            updated_at: new Date().toISOString()
          })
          .eq('truck_id', params.truckId)
          .eq('catalog_item_id', item.id)
      } else {
        // Create new stock entry
        await supabase
          .from('inv_stock_levels')
          .insert({
            truck_id: params.truckId,
            catalog_item_id: item.id,
            current_quantity: Math.max(0, quantityChange),
            updated_at: new Date().toISOString()
          })
      }
    }

    return {
      success: true,
      transactionId: transaction.id,
      invoiceNumber: invoiceNumber
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create transaction'
    }
  }
}

export async function getTransactions(truckId?: string): Promise<Transaction[]> {
  try {
    let query = supabase
      .from('inv_transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .limit(100)

    if (truckId) {
      query = query.eq('truck_id', truckId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return []
  }
}

export async function getTransactionLines(transactionId: string): Promise<TransactionLine[]> {
  try {
    const { data, error } = await supabase
      .from('inv_transaction_lines')
      .select('*')
      .eq('transaction_id', transactionId)

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching transaction lines:', error)
    return []
  }
}
