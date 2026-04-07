export interface Technician {
  id: string
  name: string
  pin: string
  is_active: boolean
}

export const technicians: Technician[] = [
  { id: 'tech_1', name: 'Stan', pin: '1234', is_active: true },
  { id: 'tech_2', name: 'Javier', pin: '5678', is_active: true },
]

export interface Truck {
  id: string
  name: string
  description: string
  is_active: boolean
}

export const trucks: Truck[] = [
  { id: 'truck_1', name: 'Box Truck 1', description: 'Ford E-450 — primary maintenance vehicle', is_active: true },
]

export interface StockLevel {
  catalog_item_id: string
  current_quantity: number
  last_counted_at?: string
}

export const stockLevels: StockLevel[] = [
  { catalog_item_id: '1', current_quantity: 8 },  // Smoke detector - below min (10)
  { catalog_item_id: '2', current_quantity: 6 },  // CO detector - OK
  { catalog_item_id: '3', current_quantity: 12 }, // GFCI - OK
  { catalog_item_id: '4', current_quantity: 2 },  // Knob - below min (3)
  { catalog_item_id: '5', current_quantity: 8 },  // Wire nuts - OK
  { catalog_item_id: '6', current_quantity: 15 }, // Caulk - OK
  { catalog_item_id: '7', current_quantity: 22 }, // LED light - OK
  { catalog_item_id: '8', current_quantity: 3 },  // Flapper - below min (5)
  { catalog_item_id: '9', current_quantity: 6 },  // Supply line - OK
  { catalog_item_id: '10', current_quantity: 35 }, // Outlet cover - OK
  { catalog_item_id: '11', current_quantity: 18 }, // Switch cover - OK
  { catalog_item_id: '12', current_quantity: 4 },  // Primer - below min (5)
  { catalog_item_id: '13', current_quantity: 10 }, // Hinge - OK
  { catalog_item_id: '14', current_quantity: 7 },  // Striker plate - OK
  { catalog_item_id: '15', current_quantity: 1 },  // Wax ring - below min (3)
]
