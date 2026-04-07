export interface Transaction {
  id: string
  invoice_number: string
  tech_name: string
  tech_id: string
  property_name: string
  unit_number: string
  items_count: number
  total: number
  type: 'checkout' | 'return'
  status: 'completed' | 'cancelled' | 'in_progress'
  processed: boolean
  created_at: string
  lines: TransactionLine[]
}

export interface TransactionLine {
  id: string
  item_name: string
  sku: string
  quantity: number
  unit_cost: number
  line_total: number
}

export const transactions: Transaction[] = [
  {
    id: '1',
    invoice_number: 'INV-20250406-0001',
    tech_name: 'Stan',
    tech_id: 'tech_1',
    property_name: '123 Main St, Hartford, CT',
    unit_number: 'Unit 101',
    items_count: 3,
    total: 31.23,
    type: 'checkout',
    status: 'completed',
    processed: true,
    created_at: '2025-04-06T09:30:00Z',
    lines: [
      { id: 'l1', item_name: 'First Alert Smoke Detector SA320CN', sku: 'SA320CN', quantity: 1, unit_cost: 12.50, line_total: 12.50 },
      { id: 'l2', item_name: 'Toilet Flapper Universal 2"', sku: 'FLP-002', quantity: 2, unit_cost: 5.49, line_total: 10.98 },
      { id: 'l3', item_name: 'Wire Nuts Yellow (10-pack)', sku: 'BIN-ELEC-WN-Y', quantity: 2, unit_cost: 3.20, line_total: 6.40 },
    ],
  },
  {
    id: '2',
    invoice_number: 'INV-20250406-0002',
    tech_name: 'Javier',
    tech_id: 'tech_2',
    property_name: '456 Oak Ave, Hartford, CT',
    unit_number: 'Unit 205',
    items_count: 2,
    total: 33.24,
    type: 'checkout',
    status: 'completed',
    processed: false,
    created_at: '2025-04-06T10:15:00Z',
    lines: [
      { id: 'l4', item_name: 'Kwikset Entry Knob Satin Nickel', sku: '042049940305', quantity: 1, unit_cost: 22.00, line_total: 22.00 },
      { id: 'l5', item_name: 'Door Hinge 3.5" Satin Nickel', sku: 'HINGE-001', quantity: 2, unit_cost: 3.50, line_total: 7.00 },
    ],
  },
  {
    id: '3',
    invoice_number: 'INV-20250405-0001',
    tech_name: 'Stan',
    tech_id: 'tech_1',
    property_name: '789 Elm Rd, West Hartford, CT',
    unit_number: 'Unit 301',
    items_count: 1,
    total: 24.99,
    type: 'checkout',
    status: 'completed',
    processed: true,
    created_at: '2025-04-05T14:20:00Z',
    lines: [
      { id: 'l6', item_name: 'First Alert CO Detector CO605', sku: 'CO605', quantity: 1, unit_cost: 24.99, line_total: 24.99 },
    ],
  },
  {
    id: '4',
    invoice_number: 'INV-20250405-0002',
    tech_name: 'Stan',
    tech_id: 'tech_1',
    property_name: '123 Main St, Hartford, CT',
    unit_number: 'Common Area',
    items_count: 5,
    total: 43.66,
    type: 'checkout',
    status: 'completed',
    processed: true,
    created_at: '2025-04-05T16:45:00Z',
    lines: [
      { id: 'l7', item_name: 'Leviton GFCI Outlet 15A White', sku: 'GFCI-15A', quantity: 2, unit_cost: 8.75, line_total: 17.50 },
      { id: 'l8', item_name: 'Outlet Cover Plate White', sku: 'BIN-ELEC-OCP-W', quantity: 10, unit_cost: 0.65, line_total: 6.50 },
      { id: 'l9', item_name: 'Switch Cover Plate White', sku: 'BIN-ELEC-SCP-W', quantity: 10, unit_cost: 0.65, line_total: 6.50 },
      { id: 'l10', item_name: 'Wire Nuts Yellow (10-pack)', sku: 'BIN-ELEC-WN-Y', quantity: 3, unit_cost: 3.20, line_total: 9.60 },
      { id: 'l11', item_name: '4" LED Recessed Light 3000K', sku: 'BIN-LIGHT-4LED', quantity: 1, unit_cost: 6.99, line_total: 6.99 },
    ],
  },
  {
    id: '5',
    invoice_number: 'INV-20250404-0001',
    tech_name: 'Javier',
    tech_id: 'tech_2',
    property_name: '456 Oak Ave, Hartford, CT',
    unit_number: 'Unit 102',
    items_count: 2,
    total: -15.50,
    type: 'return',
    status: 'completed',
    processed: true,
    created_at: '2025-04-04T11:30:00Z',
    lines: [
      { id: 'l12', item_name: 'Supply Line Braided SS 3/8" x 20"', sku: 'SL-3820', quantity: -2, unit_cost: 7.25, line_total: -14.50 },
      { id: 'l13', item_name: 'Toilet Flapper Universal 2"', sku: 'FLP-002', quantity: -1, unit_cost: 5.49, line_total: -5.49 },
    ],
  },
  {
    id: '6',
    invoice_number: 'INV-20250404-0002',
    tech_name: 'Stan',
    tech_id: 'tech_1',
    property_name: '321 Pine St, Hartford, CT',
    unit_number: 'Unit 401',
    items_count: 1,
    total: 4.50,
    type: 'checkout',
    status: 'completed',
    processed: false,
    created_at: '2025-04-04T13:10:00Z',
    lines: [
      { id: 'l14', item_name: 'DAP Alex Plus Caulk White 10.1oz', sku: 'CAULK-001', quantity: 1, unit_cost: 4.50, line_total: 4.50 },
    ],
  },
  {
    id: '7',
    invoice_number: 'INV-20250403-0001',
    tech_name: 'Javier',
    tech_id: 'tech_2',
    property_name: '789 Elm Rd, West Hartford, CT',
    unit_number: 'Unit 201',
    items_count: 3,
    total: 21.46,
    type: 'checkout',
    status: 'completed',
    processed: true,
    created_at: '2025-04-03T09:45:00Z',
    lines: [
      { id: 'l15', item_name: 'Toilet Wax Ring with Flange', sku: 'WAX-001', quantity: 2, unit_cost: 4.25, line_total: 8.50 },
      { id: 'l16', item_name: 'Toilet Flapper Universal 2"', sku: 'FLP-002', quantity: 1, unit_cost: 5.49, line_total: 5.49 },
      { id: 'l17', item_name: 'Kilz 2 Primer Spray 13oz', sku: 'PRIMER-001', quantity: 1, unit_cost: 6.98, line_total: 6.98 },
    ],
  },
  {
    id: '8',
    invoice_number: 'INV-20250403-0002',
    tech_name: 'Stan',
    tech_id: 'tech_1',
    property_name: '123 Main St, Hartford, CT',
    unit_number: 'Unit 305',
    items_count: 2,
    total: 8.65,
    type: 'checkout',
    status: 'completed',
    processed: true,
    created_at: '2025-04-03T15:20:00Z',
    lines: [
      { id: 'l18', item_name: 'Striker Plate Satin Nickel', sku: 'STRIKER-001', quantity: 1, unit_cost: 2.99, line_total: 2.99 },
      { id: 'l19', item_name: 'Kwikset Entry Knob Satin Nickel', sku: 'Kwikset-001', quantity: 1, unit_cost: 22.00, line_total: 22.00 },
    ],
  },
  {
    id: '9',
    invoice_number: 'INV-20250402-0001',
    tech_name: 'Javier',
    tech_id: 'tech_2',
    property_name: '456 Oak Ave, Hartford, CT',
    unit_number: 'Basement',
    items_count: 1,
    total: 6.98,
    type: 'checkout',
    status: 'completed',
    processed: false,
    created_at: '2025-04-02T10:00:00Z',
    lines: [
      { id: 'l20', item_name: 'Kilz 2 Primer Spray 13oz', sku: 'PRIMER-001', quantity: 1, unit_cost: 6.98, line_total: 6.98 },
    ],
  },
  {
    id: '10',
    invoice_number: 'INV-20250401-0001',
    tech_name: 'Stan',
    tech_id: 'tech_1',
    property_name: '321 Pine St, Hartford, CT',
    unit_number: 'Parking Lot',
    items_count: 2,
    total: 11.48,
    type: 'checkout',
    status: 'completed',
    processed: true,
    created_at: '2025-04-01T08:30:00Z',
    lines: [
      { id: 'l21', item_name: 'Toilet Flapper Universal 2"', sku: 'FLP-002', quantity: 1, unit_cost: 5.49, line_total: 5.49 },
      { id: 'l22', item_name: 'Door Hinge 3.5" Satin Nickel', sku: 'HINGE-001', quantity: 2, unit_cost: 3.50, line_total: 7.00 },
    ],
  },
]
