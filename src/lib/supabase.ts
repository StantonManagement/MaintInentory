import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Truck {
  id: string
  name: string
  description: string | null
  license_plate: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CatalogItem {
  id: string
  sku: string
  name: string
  description: string | null
  category: string
  shelf_zone: string | null
  barcode: string | null
  unit_cost: number
  unit_of_measure: string
  min_quantity: number
  max_quantity: number
  supplier: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StockLevel {
  id: string
  truck_id: string
  catalog_item_id: string
  current_quantity: number
  last_counted_at: string | null
  last_counted_by: string | null
  updated_at: string
}

export interface Transaction {
  id: string
  truck_id: string
  transaction_type: 'checkout' | 'return' | 'restock' | 'adjustment'
  transaction_date: string
  technician_id: string
  technician_name: string
  property_id: string | null
  property_name: string | null
  unit_id: string | null
  unit_number: string | null
  total_amount: number
  notes: string | null
  invoice_number: string | null
  is_processed: boolean
  processed_at: string | null
  processed_by: string | null
  created_at: string
}

export interface TransactionLine {
  id: string
  transaction_id: string
  catalog_item_id: string
  sku: string
  item_name: string
  quantity: number
  unit_cost: number
  line_total: number
  created_at: string
}

export interface TechnicianPin {
  id: string
  technician_id: string
  technician_name: string
  pin_hash: string
  truck_id: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}
