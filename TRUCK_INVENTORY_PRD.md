# PRD: Truck Inventory & Materials Management System

## Document Context

**Source:** Two development calls (March 23 & March 27, 2026) — decisions extracted from transcripts.
**Stack:** Vite + React 19 + TypeScript + Tailwind v4 + Supabase
**Database:** Shared Supabase instance (`wkwmxxlfheywwbgdbzxe`) — same instance as MOC, Collections, Leasing
**Developer tooling:** Claude Code
**This PRD covers three phases.** Phase 1 is the build target. Phases 2–3 are documented so the data model and component structure accommodate them without refactoring.

---

## 1. Problem Statement

Maintenance technicians currently drive to Home Depot (or similar) for every job. There is no tracking of what materials are consumed, no way to bill materials back to properties accurately, no visibility into consumption patterns, and no inventory control. A box truck has been acquired to serve as a mobile supply depot. This system makes that truck operationally useful.

## 2. System Goal

The truck operates like a small retail store. Technicians "purchase" items from the truck inventory. Each transaction generates a billing record tied to a specific property and unit. Inventory levels adjust in real time. When stock drops below defined thresholds, the system generates restock reports. Management gets visibility into what's being consumed, where, and at what cost.

### Industry Context

This is a well-established pattern in field service. Systems like ServiceTitan, eTurns TrackStock, QR Inventory, and BuildOps all solve the same core problem for HVAC, plumbing, and electrical contractors. The workflow we're building (scan-to-use → auto-decrement → min/max reorder) is the universal standard across all of them. We are not inventing a new category — we're building a right-sized version for a 300-unit property management company that doesn't need the complexity (or cost) of an enterprise field service platform.

Key patterns validated by industry research:
- **Scan-to-use with min/max replenishment** is how every system works. Our workflow matches.
- **Offline-first mobile** is non-negotiable for truck apps — connectivity is unreliable in basements and on the road.
- **Shrinkage tracking** (gap between expected and actual inventory) is a core ROI driver. One contractor case study showed shrinkage eliminated entirely once techs started scanning.
- **The #1 failure mode is human, not technical.** The simpler the tech interface, the higher the compliance. PIN → one button → scan → done. No extra steps.

## 3. Users & Roles

| Role | Person(s) | Access | Interface |
|------|-----------|--------|-----------|
| Technician | Stan, Javier, future hires | PIN login on truck tablet. Can create transactions, scan items, complete/cancel orders, process returns. Cannot modify catalog, pricing, or thresholds. | Tablet app (mounted in truck) |
| Coordinator | Christine | Views all transactions. Manages restock process. Receives threshold alerts and weekly inventory reports. | Management interface (web) |
| Accounting | Edgar | Receives transaction invoices for property billing. Views processed/unprocessed invoice status. | Management interface (web) |
| Admin | Alex, Dan, Zach | Full access. Manages item catalog, pricing, thresholds, suppliers, truck configuration. | Management interface (web) |

---

## 4. Data Model

Follow existing Supabase conventions: UUID primary keys, snake_case columns, `NUMERIC(10,2)` for money, `TIMESTAMPTZ` for dates, no hard deletes (use `is_active = false`). Prefix all tables with `inv_` to denote inventory department ownership.

These tables read from canonical tables (`properties`, `units`, `work_orders`, `technicians`) but never write to them.

### 4.1 `inv_trucks`
Truck entities. Supports single truck now, multi-truck later. Each truck has a "template" — the definition of what a fully stocked truck looks like. The template is the `inv_catalog` rows associated with this truck, with their `max_quantity` values representing the ideal stock level. This concept comes from ServiceTitan's inventory module, where truck templates define the target state so you can instantly compare current stock vs. ideal and generate a restocking list.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID PK DEFAULT gen_random_uuid()` | |
| `name` | `TEXT NOT NULL` | e.g., "Box Truck 1" |
| `description` | `TEXT` | e.g., "Ford E-450 — Stan's primary vehicle" |
| `is_active` | `BOOLEAN DEFAULT true` | Soft delete |
| `created_at` | `TIMESTAMPTZ DEFAULT now()` | |
| `updated_at` | `TIMESTAMPTZ DEFAULT now()` | |

Phase 1: seed with one row.

### 4.2 `inv_catalog`
Master list of every item that can be stocked in a truck. This is the SKU registry.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID PK DEFAULT gen_random_uuid()` | |
| `truck_id` | `UUID FK → inv_trucks` | Which truck stocks this item |
| `name` | `TEXT NOT NULL` | e.g., "First Alert Smoke Detector SA320CN" |
| `description` | `TEXT` | Optional longer description |
| `category` | `TEXT NOT NULL` | See category list below |
| `sku` | `TEXT` | Internal SKU if we assign one |
| `upc_barcode` | `TEXT` | Manufacturer UPC. Nullable — some items use bin barcodes |
| `bin_barcode` | `TEXT` | Custom barcode on the bin/shelf location. Used when item doesn't have UPC or is sold in multi-packs |
| `unit_of_measure` | `TEXT NOT NULL DEFAULT 'each'` | "each", "box", "pair", "roll", "tube", "can", "bag", "ft" |
| `unit_cost` | `NUMERIC(10,2) NOT NULL` | Cost per unit_of_measure |
| `min_quantity` | `INTEGER NOT NULL DEFAULT 5` | Reorder threshold — alert when at or below this |
| `max_quantity` | `INTEGER NOT NULL DEFAULT 20` | Restock target — reorder up to this number |
| `preferred_supplier` | `TEXT` | e.g., "Home Depot VIP", "HD Supply", "Amazon" |
| `supplier_item_number` | `TEXT` | Supplier's part/item number for reordering |
| `is_active` | `BOOLEAN DEFAULT true` | Soft delete |
| `notes` | `TEXT` | e.g., "Buy the 6-pack, stock individually" |
| `shelf_zone` | `TEXT` | Physical location in the truck. e.g., "A - Plumbing", "B - Electrical", "C - Safety". Maps to labeled shelf zones in the truck so any tech can find items without memorizing the layout. |
| `created_at` | `TIMESTAMPTZ DEFAULT now()` | |
| `updated_at` | `TIMESTAMPTZ DEFAULT now()` | |

**Category values (TEXT, not enum — easier to extend):**
- `plumbing`
- `electrical`
- `hardware`
- `paint`
- `lighting`
- `safety` (smoke detectors, CO detectors, fire extinguishers)
- `hvac`
- `appliance_parts`
- `flooring`
- `cleaning`
- `doors_locks`
- `windows`
- `other`

**Barcode resolution logic:** When a barcode is scanned, the system checks `upc_barcode` first, then `bin_barcode`. If a match is found, the item is identified. If no match, display "Item not found — add to catalog?"

### 4.3 `inv_stock_levels`
Current quantity of each catalog item in each truck. One row per catalog item per truck.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID PK DEFAULT gen_random_uuid()` | |
| `truck_id` | `UUID FK → inv_trucks` | |
| `catalog_item_id` | `UUID FK → inv_catalog` | |
| `current_quantity` | `INTEGER NOT NULL DEFAULT 0` | |
| `last_counted_at` | `TIMESTAMPTZ` | Last physical inventory count |
| `last_counted_quantity` | `INTEGER` | Quantity at last physical count |
| `updated_at` | `TIMESTAMPTZ DEFAULT now()` | |

**Unique constraint:** `(truck_id, catalog_item_id)` — one row per item per truck.

### 4.4 `inv_transactions`
Each time a technician opens a new order, scans items, and hits "Complete," one transaction is created. This is the header record.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID PK DEFAULT gen_random_uuid()` | |
| `truck_id` | `UUID FK → inv_trucks` | |
| `technician_id` | `UUID FK → technicians` | Canonical technicians table |
| `transaction_type` | `TEXT NOT NULL DEFAULT 'checkout'` | "checkout" or "return" |
| `property_id` | `UUID FK → properties` | Canonical properties table |
| `unit_id` | `UUID FK → units` | Nullable — common area work has no unit |
| `location_note` | `TEXT` | e.g., "basement", "building exterior", "parking lot". Used when unit_id is null. |
| `work_order_id` | `UUID FK → work_orders` | **Phase 2.** Nullable. Links to canonical work_orders table. |
| `status` | `TEXT NOT NULL DEFAULT 'in_progress'` | "in_progress", "completed", "cancelled" |
| `total_amount` | `NUMERIC(10,2) DEFAULT 0` | Sum of all line item amounts. Computed on completion. |
| `invoice_number` | `TEXT` | Auto-generated. Format: `INV-YYYYMMDD-XXXX` |
| `invoice_sent_at` | `TIMESTAMPTZ` | When invoice was emailed to accounting |
| `invoice_processed` | `BOOLEAN DEFAULT false` | Accounting marks this when entered into books |
| `notes` | `TEXT` | Tech can add a note |
| `completed_at` | `TIMESTAMPTZ` | |
| `created_at` | `TIMESTAMPTZ DEFAULT now()` | |
| `updated_at` | `TIMESTAMPTZ DEFAULT now()` | |

### 4.5 `inv_transaction_lines`
Individual items within a transaction. One row per distinct item scanned.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID PK DEFAULT gen_random_uuid()` | |
| `transaction_id` | `UUID FK → inv_transactions` | |
| `catalog_item_id` | `UUID FK → inv_catalog` | |
| `quantity` | `INTEGER NOT NULL DEFAULT 1` | Positive for checkout, negative for returns |
| `unit_cost` | `NUMERIC(10,2) NOT NULL` | Snapshot of cost at time of transaction |
| `line_total` | `NUMERIC(10,2) NOT NULL` | quantity × unit_cost |
| `created_at` | `TIMESTAMPTZ DEFAULT now()` | |

**On completion of a transaction:**
1. For each line, decrement `inv_stock_levels.current_quantity` by `quantity` (or increment for returns)
2. Compute `inv_transactions.total_amount` as sum of all `line_total` values
3. Generate `invoice_number`
4. Set `status = 'completed'` and `completed_at = now()`

### 4.6 `inv_restock_alerts`
Triggered when an item drops at or below its `min_quantity`. One alert per item per breach. Cleared when restocked.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID PK DEFAULT gen_random_uuid()` | |
| `truck_id` | `UUID FK → inv_trucks` | |
| `catalog_item_id` | `UUID FK → inv_catalog` | |
| `current_quantity` | `INTEGER NOT NULL` | Quantity when alert was triggered |
| `min_quantity` | `INTEGER NOT NULL` | Threshold that was breached |
| `max_quantity` | `INTEGER NOT NULL` | Target restock level |
| `reorder_quantity` | `INTEGER NOT NULL` | max_quantity − current_quantity |
| `alert_sent` | `BOOLEAN DEFAULT false` | |
| `alert_sent_at` | `TIMESTAMPTZ` | |
| `resolved` | `BOOLEAN DEFAULT false` | Set to true when restocked |
| `resolved_at` | `TIMESTAMPTZ` | |
| `created_at` | `TIMESTAMPTZ DEFAULT now()` | |

**Trigger logic:** After every transaction completion, check if `inv_stock_levels.current_quantity <= inv_catalog.min_quantity` for each affected item. If yes and no unresolved alert exists for that item, insert a row and send email notification.

### 4.7 `inv_restock_reports`
Weekly summary report generated on Fridays.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID PK DEFAULT gen_random_uuid()` | |
| `truck_id` | `UUID FK → inv_trucks` | |
| `report_date` | `DATE NOT NULL` | Friday date |
| `report_data` | `JSONB NOT NULL` | Full inventory snapshot with quantities, below-min flags, reorder amounts |
| `sent_to` | `TEXT` | Email address(es) report was sent to |
| `sent_at` | `TIMESTAMPTZ` | |
| `created_at` | `TIMESTAMPTZ DEFAULT now()` | |

### 4.8 `inv_technician_pins`
PIN-based authentication for the tablet. Separate from main app auth.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID PK DEFAULT gen_random_uuid()` | |
| `technician_id` | `UUID FK → technicians` | Canonical technicians table |
| `pin_hash` | `TEXT NOT NULL` | Hashed 4-digit PIN |
| `is_active` | `BOOLEAN DEFAULT true` | |
| `created_at` | `TIMESTAMPTZ DEFAULT now()` | |

### 4.9 `inv_physical_counts` (Phase 2)
For periodic physical inventory reconciliation.

| Column | Type | Notes |
|--------|------|-------|
| `id` | `UUID PK DEFAULT gen_random_uuid()` | |
| `truck_id` | `UUID FK → inv_trucks` | |
| `counted_by` | `UUID FK → technicians` | |
| `count_data` | `JSONB NOT NULL` | `{ "item_id": { "expected": 40, "actual": 37, "variance": -3 } }` |
| `notes` | `TEXT` | |
| `created_at` | `TIMESTAMPTZ DEFAULT now()` | |

---

## 5. Technician Interface (Tablet App)

This is a **standalone web app** optimized for a 10" tablet mounted in the truck. It is NOT part of the MOC app. It has its own route/deployment. Think of it as a point-of-sale terminal.

**Design priorities:** Large touch targets (minimum 48px), high contrast, minimal text input, fast barcode scanning, works with one hand while holding a part in the other.

### 5.1 Screen: PIN Login

**What the tech sees when they open the app:**

- Company logo or "Stanton Inventory" header
- Numeric keypad (big buttons, calculator-style)
- 4-digit PIN entry with dots for each digit
- "Enter" button
- On successful PIN: show tech's name ("Welcome, Stan") for 1 second, then go to Home screen
- On failed PIN: shake animation, "Invalid PIN" message, clear and let them try again
- No "forgot PIN" flow — admin resets in management interface

### 5.2 Screen: Home

**After login, the tech sees:**

- Top bar: tech name (left), current date/time (right)
- One large primary button: **"New Order"**
- Below it, a secondary button: **"Return Items"**
- At bottom: "Sign Out" link

Nothing else. No dashboards, no inventory counts, no reports. The tech's interface is a cash register, not a management tool.

### 5.3 Screen: Select Location (New Order flow)

**After tapping "New Order":**

- Header: "Select Location"
- **Building dropdown:** Populated from canonical `properties` table. Shows property name and address. Sorted alphabetically. Searchable (type-ahead filter).
- **After building is selected, Unit dropdown appears:** Populated from canonical `units` table filtered by selected property. Includes special entries at top:
  - "Common Area"
  - "Basement"
  - "Building Exterior"
  - "Parking Lot"
  - Then all actual unit numbers
- **"Start Scanning" button** — enabled only when both building and unit are selected
- **"Cancel" button** — returns to Home

**Phase 2 addition:** A third option appears below the building/unit selection: "Attach to Work Order" toggle. When enabled, shows a list of open work orders for that building/unit (pulled from canonical `work_orders` table via the existing AppFolio sync). Tech taps the relevant work order. This is OPTIONAL — they can always just use building/unit.

### 5.4 Screen: Scanning / Order Builder

**The main transaction screen. This is the checkout register.**

- Header shows: Building name, unit number (or "Common Area" etc.)
- **Barcode scan area:** Large camera viewfinder taking up top ~40% of screen. Uses the tablet's rear camera for barcode scanning. Continuously active — as soon as a barcode enters the frame, it reads and processes.
  - Alternative: if a Bluetooth barcode scanner is paired, the camera view can be minimized and input comes from the scanner.
- **Item list below the scanner:** As items are scanned, they appear in a list:
  ```
  [A - Plumbing]  Toilet Flapper Universal 2"    1    $5.49     $5.49
  [C - Safety]    Smoke Detector SA320CN          1    $12.50    $12.50
  [B - Electrical] GFCI Outlet 15A               2    $8.75     $17.50
  ```
  - Each row shows: shelf zone tag (color-coded to match physical shelf labels in the truck), item name, quantity, unit cost, line total
  - Scanning the same item again increments the quantity (qty goes from 1 → 2 → 3)
  - Each item row has a **"−"** button to decrement quantity (goes to 0 = removes from list) and a **"+"** button to manually increment without re-scanning

**Truck zone organization:** The `shelf_zone` field in `inv_catalog` maps to physical labeled sections in the truck. Industry best practice (ServiceTitan, QR Inventory) is to organize the truck into zones by trade/function and label them clearly so any tech — including new hires — can find items without help. The app reinforces this by showing the zone on every scanned item. Zones should match the shelf labels in the truck: "A - Plumbing", "B - Electrical", "C - Safety", "D - Hardware", "E - Paint", etc. This is configured per-item in the catalog.

- **Running total** at the bottom: "Total: $33.20"
- **"Complete Order" button** — big, green, bottom of screen. Tapping it:
  1. Shows a confirmation: "Complete order for [Building] [Unit]? 3 items, $33.20 total"
  2. On confirm: creates the transaction, adjusts inventory, generates invoice
  3. Shows "Order Complete ✓" screen for 2 seconds, then returns to Home
- **"Cancel Order" button** — secondary, requires confirmation ("Cancel this order? Items will not be deducted from inventory.")

**Edge case — Unknown barcode:**
- If a scanned barcode doesn't match any `upc_barcode` or `bin_barcode` in `inv_catalog`:
- Show: "Item not recognized" with the barcode number displayed
- Two options: "Skip" (dismiss) or "Add Note" (tech types a description that gets saved as a note on the transaction — management can add the item to the catalog later)

**Edge case — Item at zero stock:**
- If `inv_stock_levels.current_quantity` for the scanned item is 0 or negative:
- Allow the scan. Show a warning badge: "⚠ Stock shows 0 remaining"
- This accounts for items that were added without being scanned in, or miscounts. Don't block the tech.

**Edge case — Multiple trips to the truck for the same job:**
- If the tech taps "New Order" and selects the same building/unit they just completed an order for:
- This creates a second transaction. That's fine. Don't try to merge them. Two separate invoices is the correct behavior. Each is its own billing line item.

### 5.5 Screen: Return Items

**From Home screen, "Return Items":**

- Same location selection as New Order (building + unit dropdown)
- Same scanning interface, but header says "RETURN" in amber/orange
- Each scanned item adds a negative-quantity line
- On completion: generates a credit transaction (negative total). Inventory is incremented.
- Invoice shows as a credit memo.

### 5.6 Offline Behavior

The tablet has its own cellular connection. But if connectivity drops:

- Transactions should be **cached locally** (IndexedDB or similar) and synced when connectivity returns
- The app must remain functional for scanning and completing orders while offline
- Show a small "Offline — will sync when connected" indicator
- On reconnect: push all cached transactions to Supabase, adjust inventory, generate invoices
- Do NOT block the tech from working because of connectivity issues

---

## 6. Management Interface

This is a **section within the existing MOC web app** (or a linked standalone — developer's call on what's cleaner architecturally). Accessible via sidebar nav. Used by Christine, Edgar, and admins on desktop.

### 6.1 Navigation

Add to MOC sidebar under a new group:

```
INVENTORY
  Dashboard          /inventory
  Transactions       /inventory/transactions
  Catalog            /inventory/catalog
  Restock            /inventory/restock
  Trucks             /inventory/trucks         (admin only)
```

### 6.2 Page: Inventory Dashboard (`/inventory`)

**Overview page. At a glance: is anything running low? How much are we spending?**

- **Metric cards across top:**
  - Total Items in Catalog: [count]
  - Items Below Minimum: [count] — red if > 0
  - Transactions Today: [count]
  - Spend This Week: $[amount]
  - Spend This Month: $[amount]

- **Below-minimum items table** (only shows items at or below min_quantity):
  | Item | Category | Current | Min | Max | Reorder Qty | Supplier |
  |------|----------|---------|-----|-----|-------------|----------|
  Shows "All items above minimum ✓" if nothing is low.

- **Recent transactions list** (last 10):
  | Time | Tech | Building | Unit | Items | Total | Status |
  |------|------|----------|------|-------|-------|--------|
  Click any row → goes to transaction detail.

### 6.3 Page: Transactions (`/inventory/transactions`)

**Full transaction history with filters.**

- **Filter bar:** Date range, technician, building, status (completed / cancelled), type (checkout / return), processed (yes / no)
- **Table columns:** Date, Invoice #, Tech, Building, Unit, Items Count, Total, Type, Processed
- **Processed toggle:** Edgar clicks a checkbox to mark an invoice as processed (entered into accounting). This is the "has accounting handled this?" flag.
- **Click a row** → slide panel or full page showing:
  - Transaction header info (tech, date, location, invoice number)
  - Line item table (item name, qty, unit cost, line total)
  - Invoice PDF download button
  - "Mark as Processed" button (if not already)
  - Notes (if tech added any)

### 6.4 Page: Catalog (`/inventory/catalog`)

**Manage the master item list.**

- **Table columns:** Name, Category, Zone, UPC, Bin Barcode, Unit Cost, UoM, Min Qty, Max Qty, Current Stock, Supplier, Active
- **Filters:** Category dropdown, zone dropdown, search by name, active/inactive toggle
- **Add Item button** → form modal:
  - Name (required)
  - Category (required, dropdown)
  - Shelf Zone (required, dropdown — values: "A - Plumbing", "B - Electrical", "C - Safety", "D - Hardware", "E - Paint", "F - HVAC", "G - Lighting", "H - Flooring", "X - Other". Configurable list.)
  - UPC Barcode (optional)
  - Bin Barcode (optional)
  - Unit of Measure (dropdown: each, box, pair, roll, tube, can, bag, ft)
  - Unit Cost (required)
  - Min Quantity (required, default 5)
  - Max Quantity (required, default 20)
  - Preferred Supplier (optional)
  - Supplier Item Number (optional)
  - Notes (optional)
- **Edit item** → same form, pre-populated
- **Deactivate item** → soft delete (is_active = false), doesn't delete historical transactions

### 6.5 Page: Restock (`/inventory/restock`)

**Restock management center.**

- **Active Alerts** (items below minimum, most urgent first):
  | Item | Current Qty | Min | Reorder Qty | Supplier | Alert Sent | Action |
  |------|-------------|-----|-------------|----------|------------|--------|
  - Action column: "Mark Restocked" button. When clicked:
    - Prompts: "How many were added?" (defaults to reorder quantity)
    - Updates `inv_stock_levels.current_quantity`
    - Resolves the alert
    - Logs the restock in `inv_stock_levels.updated_at`

- **Weekly Reports** (historical list):
  | Report Date | Items Below Min | Total Items | Actions |
  |-------------|-----------------|-------------|---------|
  - Click to view full report
  - Download as PDF

- **Full Inventory Snapshot — "Truck Template" view** (current state of all items vs. the ideal):
  | Item | Category | Zone | Current | Max (Template) | Gap | Status |
  |------|----------|------|---------|----------------|-----|--------|
  Status shows: "OK", "Low" (amber, approaching min), "Reorder" (red, at or below min). Gap = max − current, showing exactly how many of each item are needed to get back to a fully stocked truck. This is the view Christine uses on Friday to generate the restock order — it answers "what does this truck need to look like Monday morning?"

### 6.6 Page: Trucks (`/inventory/trucks`) — Admin Only

- List of trucks with name, description, active status
- Edit truck details
- Manage technician PINs (assign PIN to tech, reset PIN, deactivate)
- Phase 2: per-truck inventory views if multiple trucks exist

---

## 7. Invoice Generation

When a transaction is completed:

1. System generates an `invoice_number` in format `INV-YYYYMMDD-XXXX` (sequential within the day)
2. A PDF is generated containing:
   - Header: "Stanton Management — Materials Invoice"
   - Invoice number, date, time
   - Technician name
   - Property name and address
   - Unit number (or location note)
   - Line item table: Item, Qty, Unit Cost, Line Total
   - Total amount
   - Footer: auto-generated, do not alter
3. PDF is emailed to accounting email address (configurable, default: Edgar's email)
4. PDF is stored and accessible from the management interface

**For returns:** Same format but header says "Credit Memo" and amounts are negative.

---

## 8. Restock Report Logic

### Threshold Alerts (Real-Time)
- **Trigger:** After any transaction completion, if `current_quantity <= min_quantity` for any affected item AND no unresolved alert exists for that item
- **Action:** Insert `inv_restock_alerts` row. Send email to Christine with:
  - Subject: "⚠ Inventory Alert: [Item Name] below minimum"
  - Body: item name, current qty, min qty, reorder qty, preferred supplier

### Weekly Inventory Report (Scheduled)
- **When:** Every Friday at 6:00 AM ET (cron job or Supabase Edge Function)
- **Content:** Full snapshot of all active catalog items with:
  - Current quantity
  - Min/max thresholds
  - Status (OK / Low / Reorder)
  - Any items that need reordering highlighted at top
- **Delivery:** Email to Christine. Also stored in `inv_restock_reports`.
- **Purpose:** Even if no threshold alerts fired during the week, Christine sees the full picture and can proactively order items approaching their minimum.

---

## 9. Phase Breakdown

### Phase 1: MVP — Get Stan Scanning

**Goal:** Technician can open a tablet, log in with a PIN, select a building and unit, scan items with a barcode, complete an order, and an invoice goes to accounting. Management can view transactions and manage the catalog.

**Includes:**
- All database tables from Section 4 (except `inv_physical_counts`)
- Technician tablet interface: PIN login, New Order flow (building/unit selection + barcode scanning + order completion), Return Items flow
- Management interface: Dashboard, Transactions page, Catalog page (CRUD), Restock page (alerts + manual restock)
- Invoice PDF generation and email delivery
- Threshold alerts (email on breach)
- Weekly restock report (Friday cron)
- Offline caching for tablet (transactions queue locally, sync on reconnect)
- Truck setup: one truck seeded in the system

**Does NOT include:**
- Work order integration
- Physical inventory count / reconciliation
- Automated purchase order generation
- Supplier management beyond a text field
- Multi-truck support (table exists but only one truck)
- Price comparison / scanning
- Warranty tracking
- GPS-based work order suggestions

**Success criteria:**
- [ ] Tech can log in with PIN on tablet
- [ ] Tech can select building and unit from dropdowns populated by real property data
- [ ] Tech can scan a barcode and see the item appear in the order
- [ ] Scanning same barcode increments quantity
- [ ] Tech can adjust quantity with +/− buttons
- [ ] Tech can complete order and see confirmation
- [ ] Transaction appears in management interface
- [ ] Invoice PDF is generated and emailed
- [ ] Inventory levels decrement correctly
- [ ] Threshold alert fires when item drops below minimum
- [ ] Weekly report generates on Friday
- [ ] Return flow works (credit memo generated, inventory incremented)
- [ ] App works offline and syncs when connectivity returns

**Estimated blockers / prerequisites:**
1. Initial item catalog needs to be created. Dan and Stan are doing a Home Depot walkthrough to identify items. Someone needs to enter them into the catalog with barcodes and pricing.
2. Barcode labels need to be printed for any bin-barcode items (multi-packs, items without UPC).
3. Tablet needs to be procured and mounted in the truck.
4. Accounting email address needs to be confirmed.
5. Physical truck shelving needs to be installed and labeled with zone designations (A, B, C, etc.) matching the `shelf_zone` values in the catalog. Print zone labels for the shelves.

**Explicitly out of scope (features from enterprise systems we do NOT need):**
- Serialized inventory tracking (tracking individual items by serial number — ServiceTitan feature for expensive equipment, not relevant at our scale)
- RFID or sensor-based auto-counting (eTurns SensorBins — overkill, we have one truck)
- Vendor-managed inventory / consignment (enterprise supply chain feature)
- Punchout procurement / supplier ERP integration (Fortune 500 stuff)
- Multi-level approval workflows for purchase orders
- Customer-facing work order signatures (eTurns feature for contractors billing homeowners — we bill our own properties)

---

### Phase 2: Work Order Integration & Inventory Intelligence

**Adds:**
- Work order attachment: tech can optionally select an open work order when creating a transaction. The `work_order_id` column on `inv_transactions` gets populated. Invoices show the work order number.
- Physical inventory counts: management can initiate a count, tech scans every item in the truck, system compares expected vs. actual and flags variances. (Industry standard: ServiceTitan recommends counts when "things are as quiet as possible — evening when trucks are back, or a day the company is closed.")
- Shrinkage reporting: over time, if scan-out totals diverge from physical counts, surface the discrepancy with trend data.
- **Item kits / bundles:** Pre-defined groups of items under a single action. Inspired by eTurns' "tool grouping" feature. Example: a "Unit Turnover Kit" that includes 2 smoke detectors, 1 CO detector, 4 outlet covers, 2 switch covers, 1 tube of caulk, 1 can of primer. Tech selects the kit → all items are added to the order at once. Eliminates scanning 15 items individually for repetitive jobs. Kits are configured in the management interface and tied to the catalog. New table: `inv_kits` (id, name, description) and `inv_kit_items` (kit_id, catalog_item_id, quantity).
- Supplier management page: structured supplier records with contact info, preferred items, lead times.
- Automated purchase order PDF generation: when restocking, system generates a PO document per supplier, attached to an email draft ready to send. (Industry pattern: eTurns sends POs directly to supplier ERPs via email — we start with email-attached PDFs to account reps like Home Depot VIP.)
- Consumption analytics: charts showing spend by property, spend by category, most-used items, spend trends over time.
- Multi-tech sessions: if a second tech is added, support concurrent sessions on the same truck without conflicts (each session is isolated by tech PIN).

### Phase 3: Scale & Optimization

**Adds:**
- Multi-truck inventory (second truck, warehouse locations). Each truck gets its own template.
- **Dynamic min/max optimization:** System analyzes actual usage data and recommends adjusted min/max levels per item. (eTurns' "Min/Max Tuning Dashboard" does this — shows how much you'd save by optimizing levels based on actual consumption rather than guesses. We'd build a simpler version.)
- Price comparison engine: system periodically checks prices at configured suppliers and flags savings opportunities
- Warranty tracking: flag when a recently-replaced part is being replaced again within its warranty window
- GPS-based suggestions: if tablet has GPS, suggest the work order closest to current location
- AppFolio sync: push invoice data back to AppFolio (if API permits) instead of manual upload
- Parts cannibalization: track salvaged appliances at storage locations, surface available parts when a matching repair comes in
- Predictive restocking: seasonal consumption pattern recognition that adjusts stock levels ahead of demand shifts (e.g., auto-increase smoke detectors before HQS inspection season)
- **Supplier catalog integration:** Direct connection to supplier catalogs (e.g., Amazon Business, HD Supply) so the system can auto-populate pricing and availability. eTurns has this with Amazon Business — scan an item, it checks Amazon pricing and stock. Later-phase feature but worth architecting for.

---

## 10. Consumables Handling — OPEN DECISION

**Not resolved on the calls. Two options were discussed. Build the system to support either approach. Do not hard-code one.**

**Option A — Truck Charge:** Every completed transaction gets an automatic flat fee (e.g., $15 or $20) added as a line item called "Truck Consumables Charge." This covers paper towels, tape, screws, partial cans of paint — items not individually tracked.

**Option B — Property Allocation:** Consumable purchases (bought in bulk) are split evenly across all active properties using the existing invoice-splitting tool. No per-transaction charge.

**Implementation:** Add a system setting (in a config table or env variable): `consumables_method` = `"truck_charge"` or `"property_allocation"`. If `truck_charge`, add a configurable `truck_charge_amount` (NUMERIC). When a transaction is completed and method is `truck_charge`, automatically append a line item with name "Truck Consumables", quantity 1, unit_cost = configured amount.

If `property_allocation`, do nothing — consumables are handled outside this system.

**Default for Phase 1:** `property_allocation` (do nothing). The truck charge can be enabled later via the setting.

---

## 11. Email Notifications

| Trigger | Recipient | Subject | Content |
|---------|-----------|---------|---------|
| Transaction completed | Edgar (accounting) | `Materials Invoice INV-YYYYMMDD-XXXX — [Building Name]` | PDF attachment with invoice. Body: "New materials invoice from [Tech Name] for [Building], [Unit]. Total: $XX.XX" |
| Item below minimum (real-time) | Christine | `⚠ Inventory Alert: [Item Name] at [qty] (min: [min])` | Item name, current qty, min/max, reorder qty, preferred supplier |
| Weekly inventory report (Friday 6 AM) | Christine | `Weekly Inventory Report — [Date]` | Full inventory table. Items needing reorder highlighted at top. |

**Email sending:** Use Supabase Edge Functions or a cron-triggered function. Keep it simple — these are transactional emails, not marketing. Plain text or minimal HTML is fine.

---

## 12. Technical Notes for Developer

### Barcode Scanning
- Use a web-based barcode scanning library. Recommended: `html5-qrcode` or `quagga2` — both work with tablet cameras and handle UPC-A, UPC-E, EAN-13, Code 128.
- The tablet's rear camera should be used (not front-facing). Specify `facingMode: "environment"` in the camera config.
- Continuous scanning mode: as soon as one barcode is read, process it and immediately listen for the next. No "tap to scan" — keep the scanner hot.
- Debounce: after a successful scan, ignore the same barcode for 2 seconds to prevent double-reads.

### Tablet App Architecture
- This should be a PWA (Progressive Web App) or a standalone Vite app deployed to its own URL (e.g., `inventory.stantoncap.com` or a subdomain).
- It's NOT a page within the MOC app. It has its own layout, its own auth (PIN-based, not Supabase Auth), and its own design optimized for touch.
- The management interface pages CAN live within the MOC app as new routes if that's architecturally cleaner. Developer's call.

### Database Triggers / Functions
- **On `inv_transaction_lines` insert (when transaction is completed):** Decrement `inv_stock_levels.current_quantity`. Check threshold. Create alert if needed.
- **On transaction completion:** Compute total, generate invoice number, set timestamps.
- These can be Supabase database functions (PL/pgSQL) or handled in the application layer. Database functions are preferred for data integrity — the inventory adjustment and the transaction completion should be atomic (wrapped in a single database transaction).

### PDF Generation
- For invoice PDFs, use a server-side approach (Supabase Edge Function with a PDF library, or generate in the browser and upload).
- Keep the template simple. This is an internal document, not customer-facing. Black and white, tabular, clear.

### Existing Tables to Read From
- `properties` — for building dropdown. Read `id`, `name`, `address`.
- `units` — for unit dropdown. Read `id`, `unit_number`, `property_id`.
- `technicians` — for PIN auth and tech name display. Read `id`, `name`.
- `work_orders` — Phase 2 only. Read `id`, `af_work_order_id`, `description`, `status`, `property_id`, `unit_id`.

**Never write to these canonical tables from the inventory system.**

### File Structure Suggestion

```
src/
├── apps/
│   └── truck-tablet/              # Standalone tablet PWA
│       ├── components/
│       │   ├── PinLogin.tsx
│       │   ├── HomeScreen.tsx
│       │   ├── LocationSelect.tsx
│       │   ├── BarcodeScanner.tsx
│       │   ├── OrderBuilder.tsx
│       │   ├── OrderConfirmation.tsx
│       │   └── ReturnFlow.tsx
│       ├── hooks/
│       │   ├── useBarcodeScan.ts
│       │   ├── useTransaction.ts
│       │   ├── useOfflineSync.ts
│       │   └── usePinAuth.ts
│       ├── lib/
│       │   └── offlineStore.ts    # IndexedDB wrapper for offline caching
│       ├── App.tsx
│       └── main.tsx
│
├── inventory/                     # Management interface (within MOC or standalone)
│   ├── pages/
│   │   ├── InventoryDashboard.tsx
│   │   ├── TransactionsPage.tsx
│   │   ├── CatalogPage.tsx
│   │   ├── RestockPage.tsx
│   │   └── TruckSettingsPage.tsx
│   ├── components/
│   │   ├── TransactionDetail.tsx
│   │   ├── CatalogItemForm.tsx
│   │   ├── RestockAlert.tsx
│   │   ├── InventoryReportView.tsx
│   │   └── PinManager.tsx
│   └── hooks/
│       ├── useCatalog.ts
│       ├── useTransactions.ts
│       ├── useStockLevels.ts
│       └── useRestockAlerts.ts
```

### Validation Checkpoints

After each phase of implementation:

```bash
# Types compile
npx tsc --noEmit

# App builds
npm run build

# Database: tables exist and have correct columns
# Run: SELECT * FROM inv_catalog LIMIT 1;
# Run: SELECT * FROM inv_trucks LIMIT 1;

# Tablet app: loads on mobile viewport
# Test: PIN login → select building → scan barcode → complete order

# Management: pages render with data
# Test: /inventory shows dashboard with metrics
# Test: /inventory/catalog shows items, add/edit works
# Test: /inventory/transactions shows completed orders
```

### Claude Code Setup for This Project

The developer is using Claude Code (Anthropic's terminal-based agentic coding tool). These are the specific setup steps and practices for building this system effectively.

**1. Run `/init` first.** This generates a starter `CLAUDE.md` by analyzing the existing codebase. Then customize it with the project-specific context below.

**2. Create or update `CLAUDE.md` in the repo root.** Keep it concise — under 150 lines. Claude Code loads this every session. Only include things that apply broadly. If it's too long, Claude starts ignoring instructions.

Recommended `CLAUDE.md` content for this project:

```markdown
# Truck Inventory System

## Stack
- Vite + React 19 + TypeScript + Tailwind v4
- Supabase (Postgres + Realtime)
- Shared DB instance: wkwmxxlfheywwbgdbzxe
- Same Supabase as MOC, Collections, Leasing apps

## Database Conventions
- PK: id UUID DEFAULT gen_random_uuid()
- Columns: snake_case, never PascalCase
- Money: NUMERIC(10,2)
- Dates: TIMESTAMPTZ
- No hard deletes: use is_active = false
- All inventory tables prefixed inv_
- Read canonical tables (properties, units, technicians). NEVER write to them.

## Two Apps
- Tablet app: standalone PWA at its own URL. PIN auth, touch-optimized, offline-first.
- Management interface: new routes within MOC app or standalone. Standard Supabase Auth.
- These are separate — different layouts, different auth, different UX priorities.

## Code Style
- ES modules (import/export), not CommonJS
- Destructure imports
- TypeScript strict mode, no `any` types
- Follow existing MOC component patterns for management pages

## Testing
- Run `npx tsc --noEmit` after type changes
- Run `npm run build` after every feature
- Test tablet app on mobile viewport (768px width)

## Key Files to Reference
- src/lib/supabase.ts (existing Supabase client)
- src/hooks/ (existing hook patterns)
- src/components/ (existing component patterns)
- DATABASE_ARCHITECTURE.md (canonical table conventions)
```

**3. Use Plan Mode before each major feature.** Enter plan mode, describe the feature (e.g., "Build the PIN login screen for the tablet app"), let Claude research the existing codebase and propose an approach. Review the plan before approving implementation. This is non-negotiable for anything touching multiple files.

**4. Work in small diffs.** Each implementation step should touch as few files as possible. The recommended loop:
- Plan → approve plan → implement step 1 → `npx tsc --noEmit` → `npm run build` → verify in browser → commit → next step.
- Keep diffs under 200 lines when possible.
- Use Checkpoints so you can `/rewind` if something goes wrong.

**5. Build order for Phase 1 (sequential — each step validates before moving to the next):**
1. Database tables — create all `inv_` tables in Supabase with correct schemas, constraints, and indexes
2. Seed data — insert sample truck, catalog items, technician PINs
3. Tablet app scaffold — Vite PWA project setup, routing, basic layout
4. PIN login screen — auth against `inv_technician_pins`, display tech name
5. Location select screen — dropdowns reading from canonical `properties` and `units`
6. Barcode scanner — camera integration with `html5-qrcode`, scan → lookup in `inv_catalog`
7. Order builder screen — item list, quantity adjustment, running total
8. Transaction completion — write to `inv_transactions` and `inv_transaction_lines`, decrement `inv_stock_levels`, generate invoice number
9. Return flow — same screens, negative quantities, credit memo
10. Offline caching — IndexedDB queue for transactions, sync on reconnect
11. Management: Catalog page — CRUD for `inv_catalog` within MOC app
12. Management: Transactions page — list, filter, detail view, processed toggle
13. Management: Dashboard — metric cards, below-minimum items, recent transactions
14. Management: Restock page — active alerts, manual restock, truck template view
15. Invoice PDF generation — Edge Function or browser-side, email to accounting
16. Threshold alerts — email on min breach
17. Weekly report — Friday cron job

**6. Use `/clear` between major features.** Context degrades around 70% utilization. When switching from the tablet app to the management interface, or from frontend to database work, clear context and start fresh. Reference specific files rather than relying on accumulated context.

**7. Reference existing patterns.** When building management interface pages, tell Claude to follow the pattern from existing MOC pages:
```
"Build the CatalogPage following the pattern in src/pages/PropertyOperationsDashboard.tsx —
same table layout, filter chips, slide panel for detail/edit. Read from inv_catalog table."
```
One concrete example from the existing codebase is worth more than a paragraph of description.

**8. Create a per-folder `CLAUDE.md` for the tablet app.** The tablet app has different conventions than the management interface — touch targets, simplified layout, no sidebar. Put a `CLAUDE.md` in `src/apps/truck-tablet/`:
```markdown
# Tablet App Rules
- All touch targets minimum 48px
- Large text: minimum 16px body, 20px headers
- No sidebar navigation — single-screen flows only
- PIN auth, not Supabase Auth
- Must work offline — cache all transactions in IndexedDB
- Camera scanning uses rear camera (facingMode: "environment")
```

---

## 13. Sample Data for Development

Seed these for testing. Do not use in production.

### Sample Truck
```json
{
  "name": "Box Truck 1",
  "description": "Ford E-450 — primary maintenance vehicle"
}
```

### Sample Catalog Items (seed ~15 for testing)
```json
[
  { "name": "First Alert Smoke Detector SA320CN", "category": "safety", "shelf_zone": "C - Safety", "upc_barcode": "029054774507", "unit_cost": 12.50, "unit_of_measure": "each", "min_quantity": 10, "max_quantity": 25, "preferred_supplier": "Home Depot VIP" },
  { "name": "First Alert CO Detector CO605", "category": "safety", "shelf_zone": "C - Safety", "upc_barcode": "029054775108", "unit_cost": 24.99, "unit_of_measure": "each", "min_quantity": 5, "max_quantity": 15, "preferred_supplier": "Home Depot VIP" },
  { "name": "Leviton GFCI Outlet 15A White", "category": "electrical", "shelf_zone": "B - Electrical", "upc_barcode": "078477453117", "unit_cost": 8.75, "unit_of_measure": "each", "min_quantity": 5, "max_quantity": 15, "preferred_supplier": "HD Supply" },
  { "name": "Kwikset Entry Knob Satin Nickel", "category": "doors_locks", "shelf_zone": "D - Hardware", "upc_barcode": "042049940305", "unit_cost": 22.00, "unit_of_measure": "each", "min_quantity": 3, "max_quantity": 10, "preferred_supplier": "Home Depot VIP" },
  { "name": "Wire Nuts Yellow (10-pack)", "category": "electrical", "shelf_zone": "B - Electrical", "bin_barcode": "BIN-ELEC-WN-Y", "unit_cost": 3.20, "unit_of_measure": "box", "min_quantity": 5, "max_quantity": 15, "preferred_supplier": "HD Supply" },
  { "name": "DAP Alex Plus Caulk White 10.1oz", "category": "paint", "shelf_zone": "E - Paint", "upc_barcode": "070798186040", "unit_cost": 4.50, "unit_of_measure": "tube", "min_quantity": 8, "max_quantity": 20, "preferred_supplier": "Home Depot VIP" },
  { "name": "4\" LED Recessed Light 3000K", "category": "lighting", "shelf_zone": "B - Electrical", "bin_barcode": "BIN-LIGHT-4LED", "unit_cost": 6.99, "unit_of_measure": "each", "min_quantity": 10, "max_quantity": 30, "preferred_supplier": "Amazon" },
  { "name": "Toilet Flapper Universal 2\"", "category": "plumbing", "shelf_zone": "A - Plumbing", "upc_barcode": "039166107803", "unit_cost": 5.49, "unit_of_measure": "each", "min_quantity": 5, "max_quantity": 12, "preferred_supplier": "Home Depot VIP" },
  { "name": "Supply Line Braided SS 3/8\" x 20\"", "category": "plumbing", "shelf_zone": "A - Plumbing", "upc_barcode": "013056123456", "unit_cost": 7.25, "unit_of_measure": "each", "min_quantity": 4, "max_quantity": 10, "preferred_supplier": "HD Supply" },
  { "name": "Outlet Cover Plate White", "category": "electrical", "shelf_zone": "B - Electrical", "bin_barcode": "BIN-ELEC-OCP-W", "unit_cost": 0.65, "unit_of_measure": "each", "min_quantity": 15, "max_quantity": 40, "preferred_supplier": "HD Supply" },
  { "name": "Switch Cover Plate White", "category": "electrical", "shelf_zone": "B - Electrical", "bin_barcode": "BIN-ELEC-SCP-W", "unit_cost": 0.65, "unit_of_measure": "each", "min_quantity": 10, "max_quantity": 30, "preferred_supplier": "HD Supply" },
  { "name": "Kilz 2 Primer Spray 13oz", "category": "paint", "shelf_zone": "E - Paint", "upc_barcode": "051652100136", "unit_cost": 6.98, "unit_of_measure": "can", "min_quantity": 5, "max_quantity": 15, "preferred_supplier": "Home Depot VIP" },
  { "name": "Door Hinge 3.5\" Satin Nickel", "category": "doors_locks", "shelf_zone": "D - Hardware", "upc_barcode": "033923123456", "unit_cost": 3.50, "unit_of_measure": "each", "min_quantity": 6, "max_quantity": 18, "preferred_supplier": "Home Depot VIP" },
  { "name": "Striker Plate Satin Nickel", "category": "doors_locks", "shelf_zone": "D - Hardware", "upc_barcode": "042049789012", "unit_cost": 2.99, "unit_of_measure": "each", "min_quantity": 5, "max_quantity": 15, "preferred_supplier": "Home Depot VIP" },
  { "name": "Toilet Wax Ring with Flange", "category": "plumbing", "shelf_zone": "A - Plumbing", "upc_barcode": "078864567890", "unit_cost": 4.25, "unit_of_measure": "each", "min_quantity": 3, "max_quantity": 8, "preferred_supplier": "Home Depot VIP" }
]
```

### Sample Technician PINs
```json
[
  { "technician_name": "Stan", "pin": "1234" },
  { "technician_name": "Javier", "pin": "5678" }
]
```

---

## 14. Open Items — Decisions Pending

These do not block Phase 1 development. The system is designed to accommodate either resolution.

| # | Item | Options | Who Decides | Notes |
|---|------|---------|-------------|-------|
| 1 | Consumables billing method | Truck charge vs. property allocation | Zach + Dan | System supports both via config toggle. Default: property allocation. |
| 2 | Exact stock list | TBD | Dan + Stan (Home Depot walkthrough) | Seed data above is for development. Real catalog comes from the walkthrough. |
| 3 | Shelving layout | TBD | Dan | Depends on stock list. Not a software concern. |
| 4 | Tablet model | iPad vs. Android tablet | Dan + Alex | Software is a web app — works on either. |
| 5 | Accounting email | Edgar's email | Zach | Needs to be configured before go-live. |
| 6 | Appliance parts to stock | TBD | Dan + Stan | Igniters, valves, universal parts across manufacturers. |
| 7 | Which common-area location options | Basement, Exterior, Parking Lot, other? | Dan + Christine | Hardcode a reasonable list, make it configurable later. |
| 8 | Shelf zone labels for truck | How many zones? Which trades map to which shelf? | Dan + Stan | Must be decided before catalog is populated. Zones in the app must match physical shelf labels. |

---

## 15. Industry Reference — Systems We Studied

These are the established products in this space. Listed for developer context and UI inspiration, not because we're copying them. Our build is intentionally simpler than all of these.

| System | What It Does | What's Relevant to Us | What We're Skipping |
|--------|-------------|----------------------|-------------------|
| **eTurns TrackStock** | Mobile truck inventory for contractors. Scan-to-use, min/max auto-replenishment, work order integration, supplier PO automation. | Closest match to our scope. Their scan → decrement → auto-reorder workflow is exactly what we're building. Their offline-first mobile app and tool kit grouping feature are worth studying. | RFID, SensorBins, vendor-managed inventory, punchout procurement. |
| **ServiceTitan Inventory** | Enterprise field service platform (HVAC, plumbing, electrical). Truck templates, serialized inventory, fleet management. | Truck template concept (define ideal stock per truck, compare to current). Their mobile barcode app and replenishment cycle model. Physical count methodology. | Serialized tracking, multi-warehouse, supplier ERP integration, pricebook integration. |
| **QR Inventory** | QR-code-based tracking for field service. Multi-location visibility, mobile forms, equipment maintenance scheduling. | Simple scan-to-use UX. Location-based inventory views (truck vs. warehouse vs. job site). Low-inventory alerts with reorder links. | Custom mobile forms, IoT monitoring, BOM/assembly tracking. |
| **BuildOps** | Commercial service contractor platform. Parts usage tied to job records, returns and exceptions tracking. | Concept of tying material usage to the job record for accurate costing. "Inventory drift" concept (our shrinkage tracking). | Full dispatch system, customer-facing portal, estimate integration. |
| **Ply (ServiceTitan add-on)** | Inventory + purchasing optimization. Multi-vendor price comparison, auto-PO. | Price comparison concept for Phase 3. Claims 35% material cost reduction. Onboards in under 48 hours — simplicity benchmark. | ServiceTitan dependency, vendor RFQ automation. |

**For UI/UX inspiration:** Look at how eTurns TrackStock's mobile app handles the scanning flow — it's the closest analog to our technician tablet interface. Their checkout flow (scan → list builds → complete) is the pattern we want.
