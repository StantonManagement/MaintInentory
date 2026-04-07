-- =====================================================
-- Truck Inventory System - Database Schema
-- =====================================================
-- This migration creates all tables needed for the truck inventory system
-- including trucks, catalog, stock levels, transactions, and technician PINs

-- =====================================================
-- 1. TRUCKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inv_trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  license_plate TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. CATALOG TABLE (Master Item List)
-- =====================================================
CREATE TABLE IF NOT EXISTS inv_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'plumbing', 'electrical', 'hardware', 'paint', 'lighting',
    'safety', 'hvac', 'appliance_parts', 'flooring',
    'cleaning', 'doors_locks', 'windows', 'other'
  )),
  shelf_zone TEXT CHECK (shelf_zone IN (
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'X'
  )),
  barcode TEXT,
  unit_cost DECIMAL(10, 2) NOT NULL,
  unit_of_measure TEXT DEFAULT 'EA',
  min_quantity INTEGER DEFAULT 0,
  max_quantity INTEGER DEFAULT 0,
  supplier TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. STOCK LEVELS TABLE (Current Inventory per Truck)
-- =====================================================
CREATE TABLE IF NOT EXISTS inv_stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES inv_trucks(id) ON DELETE CASCADE,
  catalog_item_id UUID NOT NULL REFERENCES inv_catalog(id) ON DELETE CASCADE,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  last_counted_at TIMESTAMPTZ,
  last_counted_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(truck_id, catalog_item_id)
);

-- =====================================================
-- 4. TRANSACTIONS TABLE (Header)
-- =====================================================
CREATE TABLE IF NOT EXISTS inv_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES inv_trucks(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('checkout', 'return', 'restock', 'adjustment')),
  transaction_date TIMESTAMPTZ DEFAULT NOW(),
  technician_id TEXT NOT NULL,
  technician_name TEXT NOT NULL,
  property_id TEXT,
  property_name TEXT,
  unit_id TEXT,
  unit_number TEXT,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  notes TEXT,
  invoice_number TEXT,
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  processed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. TRANSACTION LINES TABLE (Detail)
-- =====================================================
CREATE TABLE IF NOT EXISTS inv_transaction_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES inv_transactions(id) ON DELETE CASCADE,
  catalog_item_id UUID NOT NULL REFERENCES inv_catalog(id) ON DELETE RESTRICT,
  sku TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. RESTOCK ALERTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inv_restock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES inv_trucks(id) ON DELETE CASCADE,
  catalog_item_id UUID NOT NULL REFERENCES inv_catalog(id) ON DELETE CASCADE,
  current_quantity INTEGER NOT NULL,
  min_quantity INTEGER NOT NULL,
  alert_date TIMESTAMPTZ DEFAULT NOW(),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  UNIQUE(truck_id, catalog_item_id, is_resolved)
);

-- =====================================================
-- 7. RESTOCK REPORTS TABLE (Weekly Snapshots)
-- =====================================================
CREATE TABLE IF NOT EXISTS inv_restock_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES inv_trucks(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  report_week TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  generated_by TEXT,
  snapshot_data JSONB NOT NULL,
  UNIQUE(truck_id, report_date)
);

-- =====================================================
-- 8. TECHNICIAN PINS TABLE (Authentication)
-- =====================================================
CREATE TABLE IF NOT EXISTS inv_technician_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id TEXT UNIQUE NOT NULL,
  technician_name TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  truck_id UUID REFERENCES inv_trucks(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. PHYSICAL COUNTS TABLE (Inventory Audits)
-- =====================================================
CREATE TABLE IF NOT EXISTS inv_physical_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID NOT NULL REFERENCES inv_trucks(id) ON DELETE CASCADE,
  count_date TIMESTAMPTZ DEFAULT NOW(),
  counted_by TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'cancelled')),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 10. PHYSICAL COUNT LINES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS inv_physical_count_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_id UUID NOT NULL REFERENCES inv_physical_counts(id) ON DELETE CASCADE,
  catalog_item_id UUID NOT NULL REFERENCES inv_catalog(id) ON DELETE CASCADE,
  expected_quantity INTEGER NOT NULL,
  actual_quantity INTEGER,
  variance INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Catalog indexes
CREATE INDEX idx_inv_catalog_sku ON inv_catalog(sku);
CREATE INDEX idx_inv_catalog_category ON inv_catalog(category);
CREATE INDEX idx_inv_catalog_barcode ON inv_catalog(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX idx_inv_catalog_active ON inv_catalog(is_active);

-- Stock levels indexes
CREATE INDEX idx_inv_stock_truck ON inv_stock_levels(truck_id);
CREATE INDEX idx_inv_stock_item ON inv_stock_levels(catalog_item_id);

-- Transactions indexes
CREATE INDEX idx_inv_trans_truck ON inv_transactions(truck_id);
CREATE INDEX idx_inv_trans_date ON inv_transactions(transaction_date DESC);
CREATE INDEX idx_inv_trans_tech ON inv_transactions(technician_id);
CREATE INDEX idx_inv_trans_type ON inv_transactions(transaction_type);
CREATE INDEX idx_inv_trans_processed ON inv_transactions(is_processed);

-- Transaction lines indexes
CREATE INDEX idx_inv_trans_lines_trans ON inv_transaction_lines(transaction_id);
CREATE INDEX idx_inv_trans_lines_item ON inv_transaction_lines(catalog_item_id);

-- Restock alerts indexes
CREATE INDEX idx_inv_alerts_truck ON inv_restock_alerts(truck_id);
CREATE INDEX idx_inv_alerts_resolved ON inv_restock_alerts(is_resolved);

-- Technician pins indexes
CREATE INDEX idx_inv_pins_tech ON inv_technician_pins(technician_id);
CREATE INDEX idx_inv_pins_active ON inv_technician_pins(is_active);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE inv_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_restock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_restock_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_technician_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_physical_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_physical_count_lines ENABLE ROW LEVEL SECURITY;

-- Allow anon users to read from all tables (for tablet PWA)
CREATE POLICY "Allow anon read access to trucks"
  ON inv_trucks FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read access to catalog"
  ON inv_catalog FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read access to stock levels"
  ON inv_stock_levels FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read access to transactions"
  ON inv_transactions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read access to transaction lines"
  ON inv_transaction_lines FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read access to restock alerts"
  ON inv_restock_alerts FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read access to restock reports"
  ON inv_restock_reports FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon read access to technician pins"
  ON inv_technician_pins FOR SELECT
  TO anon
  USING (true);

-- Allow anon users to insert transactions (from tablet PWA)
CREATE POLICY "Allow anon insert transactions"
  ON inv_transactions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon insert transaction lines"
  ON inv_transaction_lines FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow anon users to update stock levels
CREATE POLICY "Allow anon update stock levels"
  ON inv_stock_levels FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow anon insert stock levels"
  ON inv_stock_levels FOR INSERT
  TO anon
  WITH CHECK (true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_inv_trucks_updated_at
  BEFORE UPDATE ON inv_trucks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inv_catalog_updated_at
  BEFORE UPDATE ON inv_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inv_stock_levels_updated_at
  BEFORE UPDATE ON inv_stock_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inv_technician_pins_updated_at
  BEFORE UPDATE ON inv_technician_pins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE inv_trucks IS 'Stores information about inventory trucks';
COMMENT ON TABLE inv_catalog IS 'Master catalog of all inventory items';
COMMENT ON TABLE inv_stock_levels IS 'Current stock levels for each item on each truck';
COMMENT ON TABLE inv_transactions IS 'Transaction headers (checkout, return, restock)';
COMMENT ON TABLE inv_transaction_lines IS 'Transaction line items';
COMMENT ON TABLE inv_restock_alerts IS 'Alerts for items below minimum quantity';
COMMENT ON TABLE inv_restock_reports IS 'Weekly inventory snapshots';
COMMENT ON TABLE inv_technician_pins IS 'Technician PIN authentication';
COMMENT ON TABLE inv_physical_counts IS 'Physical inventory count headers';
COMMENT ON TABLE inv_physical_count_lines IS 'Physical inventory count details';
