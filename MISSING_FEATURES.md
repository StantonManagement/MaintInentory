# Missing Features & Implementation Gaps

**Last Updated:** April 14, 2026
**Project:** Stanton Truck Tablet Inventory System
**Repository:** https://github.com/StantonManagement/MaintInentory

---

## 📊 Overview

This document outlines features that are partially implemented (UI exists but using mock/hardcoded data) or completely missing from the Truck Tablet Inventory System.

---

## 🔶 Partially Implemented Features

### 1. Management Interface Database Integration

**Status:** UI exists, but all pages use mock/hardcoded data
**Priority:** HIGH
**Location:** `/inventory/*` routes

#### Dashboard (`src/pages/management/Dashboard.tsx`)

**Current State:**
- Shows hardcoded metrics (lines 20-50)
- Mock data for total items, low stock count, transactions, spending

**What's Needed:**
```typescript
// Queries to implement:
- Total active items: SELECT COUNT(*) FROM inv_catalog WHERE is_active = true
- Items below minimum: SELECT COUNT(*) FROM inv_stock_levels sl
    JOIN inv_catalog c ON sl.catalog_item_id = c.id
    WHERE sl.current_quantity <= c.min_quantity
- Transactions today: SELECT COUNT(*) FROM inv_transactions
    WHERE DATE(transaction_date) = CURRENT_DATE
- Spend this week: SELECT SUM(total_amount) FROM inv_transactions
    WHERE transaction_date >= date_trunc('week', CURRENT_DATE)
- Spend this month: SELECT SUM(total_amount) FROM inv_transactions
    WHERE transaction_date >= date_trunc('month', CURRENT_DATE)
- Recent transactions: SELECT * FROM inv_transactions
    ORDER BY transaction_date DESC LIMIT 5
- Low stock items: SELECT c.*, sl.current_quantity FROM inv_catalog c
    JOIN inv_stock_levels sl ON c.id = sl.catalog_item_id
    WHERE sl.current_quantity <= c.min_quantity
```

**Files to Update:**
- `src/services/dashboard.ts` - Add real query functions
- `src/pages/management/Dashboard.tsx` - Replace mock data with service calls

**Estimated Time:** 1-2 hours

---

#### Catalog Management (`src/pages/management/Catalog.tsx`)

**Current State:**
- Read-only display of catalog items
- No create, update, or delete functionality
- Uses service to fetch items but no mutation operations

**What's Needed:**
1. **Create Item Form**
   - Modal/drawer with form fields (SKU, name, category, barcode, cost, UOM, min/max qty)
   - Validation for required fields
   - Insert into `inv_catalog` table
   - Auto-create stock level entry in `inv_stock_levels`

2. **Update Item Form**
   - Pre-populate form with existing item data
   - Update `inv_catalog` record
   - Handle SKU/barcode uniqueness constraints

3. **Delete Item**
   - Soft delete (set `is_active = false`)
   - Confirmation dialog
   - Check for existing transactions before deleting

**Service Functions to Add:**
```typescript
// src/services/catalog.ts
createCatalogItem(data: CatalogItemInput): Promise<CatalogItem>
updateCatalogItem(id: string, data: Partial<CatalogItemInput>): Promise<CatalogItem>
deleteCatalogItem(id: string): Promise<void>
```

**Files to Update:**
- `src/services/catalog.ts` - Add CRUD functions
- `src/pages/management/Catalog.tsx` - Add forms and buttons

**Estimated Time:** 2-3 hours

---

#### Transactions Page (`src/pages/management/Transactions.tsx`)

**Current State:**
- Shows mock transaction data
- Not connected to `inv_transactions` table
- Service function `getTransactions()` exists in `src/services/transactions.ts:124`

**What's Needed:**
1. Connect to existing `getTransactions()` service
2. Display real transaction data from database
3. Add filters:
   - Date range picker
   - Transaction type (checkout, return, restock)
   - Technician filter
   - Property filter
   - Status filter (processed/unprocessed)
4. Add transaction detail view
   - Show line items from `inv_transaction_lines`
   - Display totals, tech name, property/unit
5. Add export functionality (CSV/PDF)

**Files to Update:**
- `src/pages/management/Transactions.tsx` - Replace mock data, add filters

**Estimated Time:** 1-2 hours

---

#### Restock Page (`src/pages/management/Restock.tsx`)

**Current State:**
- Shows mock restock alerts
- Not connected to `inv_restock_alerts` or `inv_stock_levels` tables

**What's Needed:**
1. **Fetch Real Alerts**
   - Query `inv_restock_alerts` for pending alerts
   - Query `inv_stock_levels` for items below minimum
   - Join with `inv_catalog` for item details

2. **Create Restock Order**
   - Select items to restock
   - Specify quantities
   - Generate restock report in `inv_restock_reports`

3. **Receive Restock**
   - Mark restock as received
   - Create adjustment transaction
   - Update stock levels
   - Clear alerts

**Service Functions to Add:**
```typescript
// src/services/restock.ts (new file)
getRestockAlerts(): Promise<RestockAlert[]>
createRestockOrder(items: RestockItem[]): Promise<RestockReport>
receiveRestock(reportId: string, items: ReceivedItem[]): Promise<void>
```

**Files to Create/Update:**
- `src/services/restock.ts` - New service file
- `src/pages/management/Restock.tsx` - Connect to real data

**Estimated Time:** 2-3 hours

---

#### Trucks Management (`src/pages/management/Trucks.tsx`)

**Current State:**
- Shows mock truck data
- Not connected to `inv_trucks` or `inv_technician_pins` tables

**What's Needed:**
1. **Truck Management**
   - List trucks from `inv_trucks` table
   - Add/edit/delete trucks
   - Assign technicians to trucks
   - View truck status (active/inactive)

2. **Technician PIN Management**
   - List technicians from `inv_technician_pins`
   - Create new technician with PIN
   - Reset/change PINs
   - Deactivate technicians

3. **Stock Overview by Truck**
   - Show current inventory per truck
   - Link to stock level adjustments

**Service Functions to Add:**
```typescript
// src/services/trucks.ts (new file)
getTrucks(): Promise<Truck[]>
createTruck(data: TruckInput): Promise<Truck>
updateTruck(id: string, data: Partial<TruckInput>): Promise<Truck>
deleteTruck(id: string): Promise<void>
getTechnicians(): Promise<Technician[]>
createTechnician(data: TechnicianInput): Promise<Technician>
updateTechnicianPin(id: string, newPin: string): Promise<void>
```

**Files to Create/Update:**
- `src/services/trucks.ts` - New service file
- `src/pages/management/Trucks.tsx` - Connect to real data

**Estimated Time:** 2-3 hours

---

### 2. Properties/Units Real Data

**Status:** Service layer exists but queries are commented out
**Priority:** HIGH
**Location:** `src/services/properties.ts`

**Current State:**
- `getProperties()` and `getUnits()` functions return hardcoded data
- Supabase queries are commented out (lines 47-52, 63-70)
- Mock data: 3 properties, 4 units per property

**What's Needed:**

**Option A: Use Existing MaintOC Tables**
1. Connect to existing `af_properties` and `af_units` tables in Supabase
2. Uncomment and update queries in `src/services/properties.ts`
3. Map AppFolio fields to expected format

**Option B: Create New Inventory Tables**
1. Create `inv_properties` and `inv_units` tables
2. Seed with property/unit data
3. Uncomment queries in `src/services/properties.ts`

**Option C: Use MaintOC API**
1. Create API endpoint in MaintOC backend
2. Update service to fetch from API instead of Supabase
3. Handle authentication/CORS

**Recommended Approach:** Option A (use existing tables)

**Query Example:**
```sql
-- Properties
SELECT id, property_name as name, address, city, state, zip
FROM af_properties
WHERE is_active = true
ORDER BY property_name;

-- Units
SELECT id, unit_number as name, property_id, bedrooms, bathrooms
FROM af_units
WHERE property_id = $1 AND is_active = true
ORDER BY unit_number;
```

**Files to Update:**
- `src/services/properties.ts` - Uncomment and adjust queries

**Estimated Time:** 30 minutes - 1 hour

---

## ❌ Completely Missing Features

### 3. Real Barcode Scanner

**Status:** Not implemented (currently simulated)
**Priority:** MEDIUM
**Location:** `src/pages/Scanner.tsx:89-100`

**Current State:**
```typescript
const handleScanBarcode = async () => {
  // TODO: Implement actual barcode scanning
  // Currently adds random item from catalog
}
```

**What's Needed:**
1. Install barcode scanning library:
   - `html5-qrcode` (recommended)
   - `quagga2`
   - `@zxing/browser`

2. Implement camera access
3. Scan barcode and extract value
4. Look up item using `getCatalogItemByBarcode(barcode)`
5. Add to cart if found
6. Handle errors (camera permission denied, no match found)

**Example Implementation:**
```typescript
import { Html5Qrcode } from 'html5-qrcode';

const handleScanBarcode = async () => {
  const scanner = new Html5Qrcode("reader");

  try {
    const decodedText = await scanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        // Lookup item by barcode
        const item = await getCatalogItemByBarcode(decodedText);
        if (item) addToCart(item);
        scanner.stop();
      }
    );
  } catch (err) {
    console.error("Scanner error:", err);
  }
};
```

**Files to Update:**
- `package.json` - Add dependency
- `src/pages/Scanner.tsx` - Implement real scanning
- `src/pages/ReturnScanner.tsx` - Same implementation

**Estimated Time:** 2-3 hours

---

### 4. Common Area Unit Options

**Status:** Missing from unit dropdowns
**Priority:** LOW
**Location:** `src/services/properties.ts`

**Current State:**
- Only regular unit numbers shown in dropdown
- No common area options

**What's Needed:**
Add common area options at the top of unit dropdown:
- Common Area
- Basement
- Building Exterior
- Parking Lot
- Laundry Room
- Mailroom
- Roof

**Implementation:**
```typescript
export async function getUnits(propertyId: string) {
  // Common areas (no property_id needed)
  const commonAreas = [
    { id: 'common-area', name: 'Common Area', property_id: propertyId },
    { id: 'basement', name: 'Basement', property_id: propertyId },
    { id: 'exterior', name: 'Building Exterior', property_id: propertyId },
    { id: 'parking', name: 'Parking Lot', property_id: propertyId },
    { id: 'laundry', name: 'Laundry Room', property_id: propertyId },
    { id: 'mailroom', name: 'Mailroom', property_id: propertyId },
    { id: 'roof', name: 'Roof', property_id: propertyId },
  ];

  // Fetch regular units from database
  const regularUnits = await fetchUnitsFromDB(propertyId);

  // Return common areas first, then units
  return [...commonAreas, ...regularUnits];
}
```

**Files to Update:**
- `src/services/properties.ts` - Add common areas logic

**Estimated Time:** 15-30 minutes

---

### 5. Admin Authentication

**Status:** Not implemented
**Priority:** HIGH
**Location:** Management interface routes

**Current State:**
- `/inventory/*` routes are publicly accessible
- No authentication or authorization

**What's Needed:**

**Option A: PIN-Based Auth (Recommended)**
1. Create `inv_admin_pins` table or add `is_admin` flag to `inv_technician_pins`
2. Create admin PIN login page
3. Store admin session in localStorage or React context
4. Protect management routes with auth check

**Option B: Password-Based Auth**
1. Use Supabase Auth (email + password)
2. Create admin login page
3. Implement role-based access control
4. More secure but requires user management

**Implementation (PIN-based):**
```typescript
// src/services/adminAuth.ts
export async function authenticateAdmin(pin: string) {
  const { data, error } = await supabase
    .from('inv_technician_pins')
    .select('*')
    .eq('pin_hash', hashPin(pin))
    .eq('is_admin', true)
    .single();

  if (error || !data) return null;
  return data;
}

// src/components/ProtectedRoute.tsx
export function ProtectedRoute({ children }) {
  const isAdmin = localStorage.getItem('admin_session');
  if (!isAdmin) return <Navigate to="/admin-login" />;
  return children;
}
```

**Files to Create:**
- `src/services/adminAuth.ts` - Admin authentication
- `src/pages/AdminLogin.tsx` - Admin PIN entry
- `src/components/ProtectedRoute.tsx` - Route guard

**Files to Update:**
- `src/App.tsx` - Wrap management routes with ProtectedRoute
- Database migration - Add `is_admin` column to `inv_technician_pins`

**Estimated Time:** 2-3 hours

---

### 6. Physical Count Management

**Status:** Tables exist but no UI
**Priority:** LOW

**Tables:**
- `inv_physical_counts` - Count session records
- `inv_physical_count_lines` - Individual item counts

**What's Needed:**
1. Admin page to initiate physical count
2. Tablet interface to record actual quantities
3. Variance report (expected vs actual)
4. Stock adjustment workflow (approve/reject variances)

**Estimated Time:** 4-6 hours

---

### 7. Invoice PDF Generation

**Status:** Not implemented
**Priority:** MEDIUM

**What's Needed:**
1. Install PDF library (`jspdf` or `pdfmake`)
2. Create invoice template
3. Generate PDF on order completion
4. Add download/print button to OrderComplete page
5. Email invoice (optional)

**Estimated Time:** 2-3 hours

---

### 8. Email Notifications

**Status:** Not implemented
**Priority:** LOW

**Use Cases:**
- Low stock alerts to coordinators
- Weekly inventory summary
- Transaction receipts
- Restock order confirmations

**What's Needed:**
1. Set up email service (Supabase Edge Functions + SendGrid/Resend)
2. Create email templates
3. Trigger emails on specific events
4. Admin settings for notification preferences

**Estimated Time:** 4-6 hours

---

## 📋 Implementation Priority

### Phase 1 (Next Session) - Core Functionality
**Total Time: 8-12 hours**

1. Connect Dashboard to real data (1-2 hrs)
2. Add Catalog CRUD operations (2-3 hrs)
3. Connect Transactions page (1-2 hrs)
4. Fix Properties/Units service (1 hr)
5. Connect Restock page (2-3 hrs)
6. Connect Trucks page (2-3 hrs)

### Phase 2 - Authentication & Enhancement
**Total Time: 5-8 hours**

1. Implement admin authentication (2-3 hrs)
2. Add real barcode scanner (2-3 hrs)
3. Add common area options (30 min)
4. Testing and bug fixes (2 hrs)

### Phase 3 - Advanced Features
**Total Time: 10-15 hours**

1. Physical count management (4-6 hrs)
2. Invoice PDF generation (2-3 hrs)
3. Email notifications (4-6 hrs)

---

## 🧪 Testing Requirements

After implementing each feature, verify:

### Dashboard
- [ ] Metrics show real counts from database
- [ ] Recent transactions display correctly
- [ ] Low stock items match actual inventory
- [ ] Spending totals are accurate

### Catalog
- [ ] Can create new items
- [ ] SKU/barcode uniqueness is enforced
- [ ] Can edit existing items
- [ ] Soft delete works (items become inactive)
- [ ] Stock levels auto-create for new items

### Transactions
- [ ] Shows real checkout/return data
- [ ] Filters work correctly
- [ ] Can view transaction details
- [ ] Line items display correctly

### Properties/Units
- [ ] Real properties load from database
- [ ] Units filter by selected property
- [ ] Common areas appear at top of list
- [ ] Data matches MaintOC/AppFolio

### Restock
- [ ] Alerts show items actually below minimum
- [ ] Can create restock order
- [ ] Receiving updates stock levels
- [ ] Alerts clear after restocking

### Trucks
- [ ] Lists real trucks from database
- [ ] Can add/edit trucks
- [ ] Technician PIN management works
- [ ] Stock levels shown per truck

---

## 📚 Related Documentation

- **Implementation Status:** `IMPLEMENTATION_STATUS.md`
- **Product Requirements:** `TRUCK_INVENTORY_PRD.md`
- **Deployment Guide:** `RAILWAY_DEPLOYMENT.md`
- **Next Session Guide:** `NEXT_SESSION_GUIDE.md`
- **Database Schema:** `supabase/migrations/20260407_create_inventory_tables.sql`

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://wkwmxxlfheywwbgdbzxe.supabase.co
- **Production App:** https://inventory.stantoncap.com
- **GitHub Repo:** https://github.com/StantonManagement/MaintInentory

---

**Last Updated:** April 14, 2026
**Next Review:** After Phase 1 implementation
