export interface Property {
  id: string
  name: string
  address: string
}

export interface Unit {
  id: string
  property_id: string
  unit_number: string
}

export const properties: Property[] = [
  { id: '1', name: 'Hartford Commons', address: '123 Main St, Hartford, CT' },
  { id: '2', name: 'Oakwood Apartments', address: '456 Oak Ave, Hartford, CT' },
  { id: '3', name: 'Elm Gardens', address: '789 Elm Rd, West Hartford, CT' },
  { id: '4', name: 'Pine Ridge', address: '321 Pine St, Hartford, CT' },
  { id: '5', name: 'Maple Heights', address: '555 Maple Dr, East Hartford, CT' },
]

export const units: Unit[] = [
  // Hartford Commons
  { id: '101', property_id: '1', unit_number: '101' },
  { id: '102', property_id: '1', unit_number: '102' },
  { id: '103', property_id: '1', unit_number: '103' },
  { id: '201', property_id: '1', unit_number: '201' },
  { id: '202', property_id: '1', unit_number: '202' },
  { id: '203', property_id: '1', unit_number: '203' },
  { id: '301', property_id: '1', unit_number: '301' },
  { id: '302', property_id: '1', unit_number: '302' },
  { id: '303', property_id: '1', unit_number: '303' },
  { id: '401', property_id: '1', unit_number: '401' },
  { id: '402', property_id: '1', unit_number: '402' },
  { id: '403', property_id: '1', unit_number: '403' },
  
  // Oakwood Apartments
  { id: '101', property_id: '2', unit_number: '101' },
  { id: '102', property_id: '2', unit_number: '102' },
  { id: '103', property_id: '2', unit_number: '103' },
  { id: '201', property_id: '2', unit_number: '201' },
  { id: '202', property_id: '2', unit_number: '202' },
  { id: '203', property_id: '2', unit_number: '203' },
  { id: '205', property_id: '2', unit_number: '205' },
  
  // Elm Gardens
  { id: '101', property_id: '3', unit_number: '101' },
  { id: '102', property_id: '3', unit_number: '102' },
  { id: '201', property_id: '3', unit_number: '201' },
  { id: '202', property_id: '3', unit_number: '202' },
  { id: '301', property_id: '3', unit_number: '301' },
  { id: '302', property_id: '3', unit_number: '302' },
  
  // Pine Ridge
  { id: '101', property_id: '4', unit_number: '101' },
  { id: '102', property_id: '4', unit_number: '102' },
  { id: '201', property_id: '4', unit_number: '201' },
  { id: '202', property_id: '4', unit_number: '202' },
  { id: '301', property_id: '4', unit_number: '301' },
  { id: '401', property_id: '4', unit_number: '401' },
  { id: '402', property_id: '4', unit_number: '402' },
  
  // Maple Heights
  { id: '101', property_id: '5', unit_number: '101' },
  { id: '102', property_id: '5', unit_number: '102' },
  { id: '103', property_id: '5', unit_number: '103' },
  { id: '104', property_id: '5', unit_number: '104' },
]

export const commonAreaOptions = [
  'Common Area',
  'Basement',
  'Building Exterior',
  'Parking Lot',
  'Lobby',
  'Hallway',
  'Laundry Room',
  'Storage Room',
]
