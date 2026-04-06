# Next Session Guide - Truck Inventory System

**Last Updated:** April 6, 2026
**Current Status:** Phase 1 Frontend Complete - Ready for Backend Integration

---

## 🎯 What We Built This Session

### Tablet PWA (100% Complete)
Created a standalone React app for technicians to use on tablets in the truck:
- **Location:** `/Users/zeff/Desktop/Work/stanton/truck-tablet/`
- **Running on:** http://localhost:5173/
- **5 Pages Built:** PIN Login → Home → Location Select → Scanner/Cart → Order Complete
- **Status:** Fully functional with mock data, ready for Supabase integration

### Management Interface (100% Complete)
Created 5 admin pages for desktop users (Christine, Edgar, admins):
- **Location:** `/Users/zeff/Desktop/Work/stanton/MaintOC/src/components/pages/`
- **5 Pages Built:**
  - `TruckInventoryDashboard.tsx` - Metrics and overview
  - `TruckInventoryTransactions.tsx` - Transaction history
  - `TruckInventoryCatalog.tsx` - Item management
  - `TruckInventoryRestock.tsx` - Restock alerts
  - `TruckInventoryTrucks.tsx` - Truck settings and PINs
- **Status:** Built but NOT routed yet in MaintOC

---

## 🚀 What to Do NEXT SESSION (Priority Order)

### Task 1: Create Database Tables (HIGH PRIORITY)
**Why First:** Everything else depends on these tables existing.

**Action:** Run this SQL in Supabase SQL Editor:

```sql
-- 1. Create inv_trucks table
CREATE TABLE inv_trucks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create inv_catalog table
CREATE TABLE inv_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID REFERENCES inv_trucks(id),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sku TEXT,
  upc_barcode TEXT,
  bin_barcode TEXT,
  unit_of_measure TEXT NOT NULL DEFAULT 'each',
  unit_cost NUMERIC(10,2) NOT NULL,
  min_quantity INTEGER NOT NULL DEFAULT 5,
  max_quantity INTEGER NOT NULL DEFAULT 20,
  preferred_supplier TEXT,
  supplier_item_number TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  shelf_zone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create inv_stock_levels table
CREATE TABLE inv_stock_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID REFERENCES inv_trucks(id),
  catalog_item_id UUID REFERENCES inv_catalog(id),
  current_quantity INTEGER NOT NULL DEFAULT 0,
  last_counted_at TIMESTAMPTZ,
  last_counted_quantity INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(truck_id, catalog_item_id)
);

-- 4. Create inv_transactions table
CREATE TABLE inv_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID REFERENCES inv_trucks(id),
  technician_id UUID, -- FK to existing technicians table
  transaction_type TEXT NOT NULL DEFAULT 'checkout',
  property_id UUID, -- FK to existing properties table
  unit_id UUID, -- FK to existing units table
  location_note TEXT,
  work_order_id UUID, -- Phase 2 - FK to work_orders table
  status TEXT NOT NULL DEFAULT 'in_progress',
  total_amount NUMERIC(10,2) DEFAULT 0,
  invoice_number TEXT,
  invoice_sent_at TIMESTAMPTZ,
  invoice_processed BOOLEAN DEFAULT false,
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create inv_transaction_lines table
CREATE TABLE inv_transaction_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES inv_transactions(id) ON DELETE CASCADE,
  catalog_item_id UUID REFERENCES inv_catalog(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_cost NUMERIC(10,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create inv_restock_alerts table
CREATE TABLE inv_restock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID REFERENCES inv_trucks(id),
  catalog_item_id UUID REFERENCES inv_catalog(id),
  current_quantity INTEGER NOT NULL,
  min_quantity INTEGER NOT NULL,
  max_quantity INTEGER NOT NULL,
  reorder_quantity INTEGER NOT NULL,
  alert_sent BOOLEAN DEFAULT false,
  alert_sent_at TIMESTAMPTZ,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Create inv_restock_reports table
CREATE TABLE inv_restock_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  truck_id UUID REFERENCES inv_trucks(id),
  report_date DATE NOT NULL,
  report_data JSONB NOT NULL,
  sent_to TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Create inv_technician_pins table
CREATE TABLE inv_technician_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_id UUID, -- FK to existing technicians table
  pin_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Add indexes for performance
CREATE INDEX idx_inv_catalog_truck ON inv_catalog(truck_id);
CREATE INDEX idx_inv_catalog_barcode ON inv_catalog(upc_barcode, bin_barcode);
CREATE INDEX idx_inv_stock_levels_truck_item ON inv_stock_levels(truck_id, catalog_item_id);
CREATE INDEX idx_inv_transactions_truck ON inv_transactions(truck_id);
CREATE INDEX idx_inv_transactions_tech ON inv_transactions(technician_id);
CREATE INDEX idx_inv_transactions_property ON inv_transactions(property_id);
CREATE INDEX idx_inv_transaction_lines_txn ON inv_transaction_lines(transaction_id);
CREATE INDEX idx_inv_restock_alerts_resolved ON inv_restock_alerts(resolved);

-- 10. Enable RLS (Row Level Security)
ALTER TABLE inv_trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_stock_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_transaction_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_restock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_restock_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_technician_pins ENABLE ROW LEVEL SECURITY;

-- 11. Create RLS policies (allow authenticated users to read/write)
-- TODO: Refine these policies based on actual user roles

-- Trucks: Anyone authenticated can read
CREATE POLICY "Allow authenticated read on trucks" ON inv_trucks
  FOR SELECT TO authenticated USING (true);

-- Catalog: Anyone authenticated can read
CREATE POLICY "Allow authenticated read on catalog" ON inv_catalog
  FOR SELECT TO authenticated USING (true);

-- Stock Levels: Anyone authenticated can read/update
CREATE POLICY "Allow authenticated read on stock_levels" ON inv_stock_levels
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update on stock_levels" ON inv_stock_levels
  FOR UPDATE TO authenticated USING (true);

-- Transactions: Anyone authenticated can read/insert
CREATE POLICY "Allow authenticated read on transactions" ON inv_transactions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on transactions" ON inv_transactions
  FOR INSERT TO authenticated WITH CHECK (true);

-- Transaction Lines: Anyone authenticated can read/insert
CREATE POLICY "Allow authenticated read on transaction_lines" ON inv_transaction_lines
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on transaction_lines" ON inv_transaction_lines
  FOR INSERT TO authenticated WITH CHECK (true);

-- Restock Alerts: Anyone authenticated can read
CREATE POLICY "Allow authenticated read on restock_alerts" ON inv_restock_alerts
  FOR SELECT TO authenticated USING (true);

-- Restock Reports: Anyone authenticated can read
CREATE POLICY "Allow authenticated read on restock_reports" ON inv_restock_reports
  FOR SELECT TO authenticated USING (true);

-- Technician PINs: Only specific users can read (refine this)
CREATE POLICY "Allow authenticated read on technician_pins" ON inv_technician_pins
  FOR SELECT TO authenticated USING (true);
```

**Verification:** After running, check tables exist:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name LIKE 'inv_%';
```

---

### Task 2: Seed Initial Data
**Why:** Need test data to develop against.

```sql
-- Insert one truck
INSERT INTO inv_trucks (name, description) VALUES
  ('Box Truck 1', 'Ford E-450 — primary maintenance vehicle');

-- Insert sample catalog items (15 items from PRD)
WITH truck AS (SELECT id FROM inv_trucks LIMIT 1)
INSERT INTO inv_catalog (
  truck_id, name, category, shelf_zone, upc_barcode, bin_barcode,
  unit_cost, unit_of_measure, min_quantity, max_quantity, preferred_supplier
) VALUES
  ((SELECT id FROM truck), 'First Alert Smoke Detector SA320CN', 'safety', 'C - Safety', '029054774507', NULL, 12.50, 'each', 10, 25, 'Home Depot VIP'),
  ((SELECT id FROM truck), 'First Alert CO Detector CO605', 'safety', 'C - Safety', '029054775108', NULL, 24.99, 'each', 5, 15, 'Home Depot VIP'),
  ((SELECT id FROM truck), 'Leviton GFCI Outlet 15A White', 'electrical', 'B - Electrical', '078477453117', NULL, 8.75, 'each', 5, 15, 'HD Supply'),
  ((SELECT id FROM truck), 'Kwikset Entry Knob Satin Nickel', 'doors_locks', 'D - Hardware', '042049940305', NULL, 22.00, 'each', 3, 10, 'Home Depot VIP'),
  ((SELECT id FROM truck), 'Wire Nuts Yellow (10-pack)', 'electrical', 'B - Electrical', NULL, 'BIN-ELEC-WN-Y', 3.20, 'box', 5, 15, 'HD Supply'),
  ((SELECT id FROM truck), 'DAP Alex Plus Caulk White 10.1oz', 'paint', 'E - Paint', '070798186040', NULL, 4.50, 'tube', 8, 20, 'Home Depot VIP'),
  ((SELECT id FROM truck), '4" LED Recessed Light 3000K', 'lighting', 'B - Electrical', NULL, 'BIN-LIGHT-4LED', 6.99, 'each', 10, 30, 'Amazon'),
  ((SELECT id FROM truck), 'Toilet Flapper Universal 2"', 'plumbing', 'A - Plumbing', '039166107803', NULL, 5.49, 'each', 5, 12, 'Home Depot VIP'),
  ((SELECT id FROM truck), 'Supply Line Braided SS 3/8" x 20"', 'plumbing', 'A - Plumbing', '013056123456', NULL, 7.25, 'each', 4, 10, 'HD Supply'),
  ((SELECT id FROM truck), 'Outlet Cover Plate White', 'electrical', 'B - Electrical', NULL, 'BIN-ELEC-OCP-W', 0.65, 'each', 15, 40, 'HD Supply'),
  ((SELECT id FROM truck), 'Switch Cover Plate White', 'electrical', 'B - Electrical', NULL, 'BIN-ELEC-SCP-W', 0.65, 'each', 10, 30, 'HD Supply'),
  ((SELECT id FROM truck), 'Kilz 2 Primer Spray 13oz', 'paint', 'E - Paint', '051652100136', NULL, 6.98, 'can', 5, 15, 'Home Depot VIP'),
  ((SELECT id FROM truck), 'Door Hinge 3.5" Satin Nickel', 'doors_locks', 'D - Hardware', '033923123456', NULL, 3.50, 'each', 6, 18, 'Home Depot VIP'),
  ((SELECT id FROM truck), 'Striker Plate Satin Nickel', 'doors_locks', 'D - Hardware', '042049789012', NULL, 2.99, 'each', 5, 15, 'Home Depot VIP'),
  ((SELECT id FROM truck), 'Toilet Wax Ring with Flange', 'plumbing', 'A - Plumbing', '078864567890', NULL, 4.25, 'each', 3, 8, 'Home Depot VIP');

-- Initialize stock levels (set current quantity = max for now)
WITH truck AS (SELECT id FROM inv_trucks LIMIT 1),
     items AS (SELECT id, max_quantity FROM inv_catalog WHERE truck_id = (SELECT id FROM truck))
INSERT INTO inv_stock_levels (truck_id, catalog_item_id, current_quantity)
SELECT
  (SELECT id FROM truck),
  id,
  max_quantity
FROM items;

-- Create technician PINs (Stan = 1234, Javier = 5678)
-- Note: These are hashed - in production, hash the PINs properly!
-- For now, storing plain text for development (CHANGE IN PRODUCTION)
INSERT INTO inv_technician_pins (technician_id, pin_hash, is_active)
SELECT id, '1234', true FROM technicians WHERE name ILIKE '%stan%' LIMIT 1;

INSERT INTO inv_technician_pins (technician_id, pin_hash, is_active)
SELECT id, '5678', true FROM technicians WHERE name ILIKE '%javier%' LIMIT 1;
```

**Verification:**
```sql
SELECT COUNT(*) as catalog_items FROM inv_catalog;
SELECT COUNT(*) as stock_levels FROM inv_stock_levels;
SELECT COUNT(*) as technician_pins FROM inv_technician_pins;
```

---

### Task 3: Add Routes to MaintOC
**File:** `/Users/zeff/Desktop/Work/stanton/MaintOC/src/main.tsx`

**Action:** Add these imports at the top:
```typescript
const TruckInventoryDashboard = lazy(() =>
  import('./components/pages/TruckInventoryDashboard').then((m) => ({ default: m.TruckInventoryDashboard })),
)
const TruckInventoryTransactions = lazy(() =>
  import('./components/pages/TruckInventoryTransactions').then((m) => ({ default: m.TruckInventoryTransactions })),
)
const TruckInventoryCatalog = lazy(() =>
  import('./components/pages/TruckInventoryCatalog').then((m) => ({ default: m.TruckInventoryCatalog })),
)
const TruckInventoryRestock = lazy(() =>
  import('./components/pages/TruckInventoryRestock').then((m) => ({ default: m.TruckInventoryRestock })),
)
const TruckInventoryTrucks = lazy(() =>
  import('./components/pages/TruckInventoryTrucks').then((m) => ({ default: m.TruckInventoryTrucks })),
)
```

**Action:** Add routes inside the `<Routes>` component:
```typescript
<Route path="/truck-inventory" element={<TruckInventoryDashboard />} />
<Route path="/truck-inventory/transactions" element={<TruckInventoryTransactions />} />
<Route path="/truck-inventory/catalog" element={<TruckInventoryCatalog />} />
<Route path="/truck-inventory/restock" element={<TruckInventoryRestock />} />
<Route path="/truck-inventory/trucks" element={<TruckInventoryTrucks />} />
```

---

### Task 4: Update MaintOC Sidebar Navigation
**File:** Find the sidebar component (likely `AppLayout.tsx` or similar in `/Users/zeff/Desktop/Work/stanton/MaintOC/src/layouts/`)

**Action:** Add new navigation section:
```typescript
{
  label: 'TRUCK INVENTORY',
  items: [
    { path: '/truck-inventory', label: 'Dashboard', icon: Package },
    { path: '/truck-inventory/transactions', label: 'Transactions', icon: FileText },
    { path: '/truck-inventory/catalog', label: 'Catalog', icon: List },
    { path: '/truck-inventory/restock', label: 'Restock', icon: AlertTriangle },
    { path: '/truck-inventory/trucks', label: 'Trucks', icon: Truck },
  ]
}
```

---

### Task 5: Connect Tablet App to Supabase
**File:** `/Users/zeff/Desktop/Work/stanton/truck-tablet/src/lib/supabase.ts`

**Action:** Create Supabase client:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Action:** Install Supabase:
```bash
cd /Users/zeff/Desktop/Work/stanton/truck-tablet
npm install @supabase/supabase-js
```

**Action:** Create `.env` file:
```
VITE_SUPABASE_URL=https://wkwmxxlfheywwbgdbzxe.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

---

### Task 6: Replace Mock Data with Real Queries
**Priority Pages to Update:**

1. **PinLogin.tsx** - Replace mock PIN check:
```typescript
// OLD (mock):
if (pinValue === '1234') techName = 'Stan'

// NEW (real):
const { data } = await supabase
  .from('inv_technician_pins')
  .select('technician_id, technicians(name)')
  .eq('pin_hash', pinValue)
  .eq('is_active', true)
  .single()
```

2. **LocationSelect.tsx** - Load real properties/units:
```typescript
const { data: properties } = await supabase
  .from('properties')
  .select('id, name, address')
  .order('name')

const { data: units } = await supabase
  .from('units')
  .select('id, unit_number')
  .eq('property_id', selectedPropertyId)
  .order('unit_number')
```

3. **Scanner.tsx** - Load real catalog items:
```typescript
const { data: items } = await supabase
  .from('inv_catalog')
  .select('*')
  .eq('is_active', true)
```

---

## 📋 Quick Reference

### Key Files & Locations

**Tablet App:**
```
/Users/zeff/Desktop/Work/stanton/truck-tablet/
├── src/pages/           ← 5 pages (all complete)
├── README.md            ← Quick start guide
├── TRUCK_INVENTORY_PRD.md  ← Full requirements
├── IMPLEMENTATION_STATUS.md ← What's done
├── RAILWAY_DEPLOYMENT.md    ← Deploy guide
└── NEXT_SESSION_GUIDE.md    ← This file
```

**Management Pages:**
```
/Users/zeff/Desktop/Work/stanton/MaintOC/src/components/pages/
├── TruckInventoryDashboard.tsx
├── TruckInventoryTransactions.tsx
├── TruckInventoryCatalog.tsx
├── TruckInventoryRestock.tsx
└── TruckInventoryTrucks.tsx
```

### Commands

**Start Tablet App:**
```bash
cd /Users/zeff/Desktop/Work/stanton/truck-tablet
npm run dev
# Opens http://localhost:5173/
```

**Start MaintOC:**
```bash
cd /Users/zeff/Desktop/Work/stanton/MaintOC
npm run dev
```

**Test Production Build:**
```bash
cd /Users/zeff/Desktop/Work/stanton/truck-tablet
npm run build
npm start
```

---

## 🎯 Success Criteria for Next Session

By end of next session, you should have:

- [ ] Database tables created in Supabase
- [ ] Seed data inserted (1 truck, 15 items, 2 PINs)
- [ ] MaintOC routes added (can access management pages)
- [ ] Sidebar navigation updated
- [ ] Tablet app connected to Supabase (PIN login works)
- [ ] At least one management page showing real data

---

## 🐛 Common Issues to Watch For

1. **Supabase RLS Policies:** If queries return empty, check RLS policies allow access
2. **Environment Variables:** Make sure `.env` file has correct Supabase keys
3. **TypeScript Errors:** Run `npm run build` to catch type errors before runtime
4. **CORS Issues:** Supabase should handle this, but if you get CORS errors, check Supabase settings
5. **PIN Hashing:** The seed data uses plain text PINs - in production, hash them!

---

## 📚 Additional Resources

- **PRD:** `TRUCK_INVENTORY_PRD.md` - Complete requirements
- **Status:** `IMPLEMENTATION_STATUS.md` - What's built vs. what's left
- **Deploy:** `RAILWAY_DEPLOYMENT.md` - How to deploy to Railway
- **Supabase Docs:** https://supabase.com/docs
- **Vite Docs:** https://vitejs.dev/

---

## 💡 Tips for Next Developer

1. **Start with database** - Nothing works without tables
2. **Test queries in Supabase SQL Editor** - Before adding to code
3. **One page at a time** - Don't try to connect everything at once
4. **Use mock data fallback** - Keep mock data as fallback during development
5. **Check browser console** - Most errors show up there first

---

## 📞 Questions to Ask if Stuck

- Are the database tables created? (Run: `SELECT * FROM inv_trucks LIMIT 1`)
- Are environment variables set? (Check `.env` file exists)
- Are imports correct? (Check file paths)
- Are routes added to MaintOC? (Check `main.tsx`)
- Is dev server running? (Should be on port 5173 for tablet, MaintOC port for management)

---

**Good luck! The frontend is 100% done, now it's just connecting the data layer.**
