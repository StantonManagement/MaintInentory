export interface CatalogItem {
  id: string
  name: string
  category: string
  shelf_zone: string
  upc_barcode?: string
  bin_barcode?: string
  unit_of_measure: string
  unit_cost: number
  min_quantity: number
  max_quantity: number
  preferred_supplier?: string
  supplier_item_number?: string
  notes?: string
  is_active: boolean
}

export const catalogItems: CatalogItem[] = [
  { id: '1', name: 'First Alert Smoke Detector SA320CN', category: 'safety', shelf_zone: 'C - Safety', upc_barcode: '029054774507', unit_cost: 12.50, unit_of_measure: 'each', min_quantity: 10, max_quantity: 25, preferred_supplier: 'Home Depot VIP', is_active: true },
  { id: '2', name: 'First Alert CO Detector CO605', category: 'safety', shelf_zone: 'C - Safety', upc_barcode: '029054775108', unit_cost: 24.99, unit_of_measure: 'each', min_quantity: 5, max_quantity: 15, preferred_supplier: 'Home Depot VIP', is_active: true },
  { id: '3', name: 'Leviton GFCI Outlet 15A White', category: 'electrical', shelf_zone: 'B - Electrical', upc_barcode: '078477453117', unit_cost: 8.75, unit_of_measure: 'each', min_quantity: 5, max_quantity: 15, preferred_supplier: 'HD Supply', is_active: true },
  { id: '4', name: 'Kwikset Entry Knob Satin Nickel', category: 'doors_locks', shelf_zone: 'D - Hardware', upc_barcode: '042049940305', unit_cost: 22.00, unit_of_measure: 'each', min_quantity: 3, max_quantity: 10, preferred_supplier: 'Home Depot VIP', is_active: true },
  { id: '5', name: 'Wire Nuts Yellow (10-pack)', category: 'electrical', shelf_zone: 'B - Electrical', bin_barcode: 'BIN-ELEC-WN-Y', unit_cost: 3.20, unit_of_measure: 'box', min_quantity: 5, max_quantity: 15, preferred_supplier: 'HD Supply', is_active: true },
  { id: '6', name: 'DAP Alex Plus Caulk White 10.1oz', category: 'paint', shelf_zone: 'E - Paint', upc_barcode: '070798186040', unit_cost: 4.50, unit_of_measure: 'tube', min_quantity: 8, max_quantity: 20, preferred_supplier: 'Home Depot VIP', is_active: true },
  { id: '7', name: '4" LED Recessed Light 3000K', category: 'lighting', shelf_zone: 'B - Electrical', bin_barcode: 'BIN-LIGHT-4LED', unit_cost: 6.99, unit_of_measure: 'each', min_quantity: 10, max_quantity: 30, preferred_supplier: 'Amazon', is_active: true },
  { id: '8', name: 'Toilet Flapper Universal 2"', category: 'plumbing', shelf_zone: 'A - Plumbing', upc_barcode: '039166107803', unit_cost: 5.49, unit_of_measure: 'each', min_quantity: 5, max_quantity: 12, preferred_supplier: 'Home Depot VIP', is_active: true },
  { id: '9', name: 'Supply Line Braided SS 3/8" x 20"', category: 'plumbing', shelf_zone: 'A - Plumbing', upc_barcode: '013056123456', unit_cost: 7.25, unit_of_measure: 'each', min_quantity: 4, max_quantity: 10, preferred_supplier: 'HD Supply', is_active: true },
  { id: '10', name: 'Outlet Cover Plate White', category: 'electrical', shelf_zone: 'B - Electrical', bin_barcode: 'BIN-ELEC-OCP-W', unit_cost: 0.65, unit_of_measure: 'each', min_quantity: 15, max_quantity: 40, preferred_supplier: 'HD Supply', is_active: true },
  { id: '11', name: 'Switch Cover Plate White', category: 'electrical', shelf_zone: 'B - Electrical', bin_barcode: 'BIN-ELEC-SCP-W', unit_cost: 0.65, unit_of_measure: 'each', min_quantity: 10, max_quantity: 30, preferred_supplier: 'HD Supply', is_active: true },
  { id: '12', name: 'Kilz 2 Primer Spray 13oz', category: 'paint', shelf_zone: 'E - Paint', upc_barcode: '051652100136', unit_cost: 6.98, unit_of_measure: 'can', min_quantity: 5, max_quantity: 15, preferred_supplier: 'Home Depot VIP', is_active: true },
  { id: '13', name: 'Door Hinge 3.5" Satin Nickel', category: 'doors_locks', shelf_zone: 'D - Hardware', upc_barcode: '033923123456', unit_cost: 3.50, unit_of_measure: 'each', min_quantity: 6, max_quantity: 18, preferred_supplier: 'Home Depot VIP', is_active: true },
  { id: '14', name: 'Striker Plate Satin Nickel', category: 'doors_locks', shelf_zone: 'D - Hardware', upc_barcode: '042049789012', unit_cost: 2.99, unit_of_measure: 'each', min_quantity: 5, max_quantity: 15, preferred_supplier: 'Home Depot VIP', is_active: true },
  { id: '15', name: 'Toilet Wax Ring with Flange', category: 'plumbing', shelf_zone: 'A - Plumbing', upc_barcode: '078864567890', unit_cost: 4.25, unit_of_measure: 'each', min_quantity: 3, max_quantity: 8, preferred_supplier: 'Home Depot VIP', is_active: true },
]

export const categoryLabels: Record<string, string> = {
  plumbing: 'Plumbing',
  electrical: 'Electrical',
  hardware: 'Hardware',
  paint: 'Paint',
  lighting: 'Lighting',
  safety: 'Safety',
  hvac: 'HVAC',
  appliance_parts: 'Appliance Parts',
  flooring: 'Flooring',
  cleaning: 'Cleaning',
  doors_locks: 'Doors & Locks',
  windows: 'Windows',
  other: 'Other',
}

export const zoneOptions = [
  'A - Plumbing',
  'B - Electrical',
  'C - Safety',
  'D - Hardware',
  'E - Paint',
  'F - HVAC',
  'G - Lighting',
  'H - Flooring',
  'X - Other',
]

export const unitOptions = ['each', 'box', 'pair', 'roll', 'tube', 'can', 'bag', 'ft']
