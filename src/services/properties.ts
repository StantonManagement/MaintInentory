import { supabase } from '@/lib/supabase'

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

// Fallback mock data if database tables don't exist
const MOCK_PROPERTIES: Property[] = [
  { id: '1', name: '123 Main St', address: '123 Main St, Hartford, CT 06103' },
  { id: '2', name: '456 Oak Ave', address: '456 Oak Ave, Hartford, CT 06106' },
  { id: '3', name: '789 Elm Rd', address: '789 Elm Rd, West Hartford, CT 06107' },
]

const MOCK_UNITS: Unit[] = [
  { id: '1-101', property_id: '1', unit_number: '101' },
  { id: '1-102', property_id: '1', unit_number: '102' },
  { id: '1-201', property_id: '1', unit_number: '201' },
  { id: '1-202', property_id: '1', unit_number: '202' },
  { id: '2-101', property_id: '2', unit_number: '101' },
  { id: '2-102', property_id: '2', unit_number: '102' },
  { id: '2-201', property_id: '2', unit_number: '201' },
  { id: '2-202', property_id: '2', unit_number: '202' },
  { id: '3-101', property_id: '3', unit_number: '101' },
  { id: '3-102', property_id: '3', unit_number: '102' },
  { id: '3-201', property_id: '3', unit_number: '201' },
  { id: '3-202', property_id: '3', unit_number: '202' },
]

/**
 * Fetch all properties from database
 * Tries multiple table names and falls back to mock data if none exist
 */
export async function getProperties(): Promise<Property[]> {
  try {
    // Try different possible table names in order of preference
    const tableNames = ['af_properties', 'properties', 'inv_properties']

    for (const tableName of tableNames) {
      try {
        // Try to query this table
        const { data, error } = await supabase
          .from(tableName)
          .select('id, property_name, address')
          .eq('is_active', true)
          .order('property_name')
          .limit(100)

        if (!error && data && data.length > 0) {
          // Successfully found data - map to our interface
          return data.map(prop => ({
            id: String(prop.id),
            name: prop.property_name || String(prop.id),
            address: prop.address || 'N/A',
          }))
        }
      } catch (tableError) {
        // Table doesn't exist or query failed, try next one
        continue
      }
    }

    // No tables found or no data, use mock data
    console.log('No property tables found in database, using mock data')
    return MOCK_PROPERTIES
  } catch (error) {
    console.error('Error fetching properties:', error)
    return MOCK_PROPERTIES
  }
}

/**
 * Fetch units for a specific property from database
 * Tries multiple table names and falls back to mock data if none exist
 * Always includes common areas at the top of the list
 */
export async function getUnitsByProperty(propertyId: string): Promise<Unit[]> {
  try {
    // Common areas that should appear for all properties
    const commonAreas: Unit[] = [
      { id: `${propertyId}-common-area`, property_id: propertyId, unit_number: 'Common Area' },
      { id: `${propertyId}-basement`, property_id: propertyId, unit_number: 'Basement' },
      { id: `${propertyId}-exterior`, property_id: propertyId, unit_number: 'Building Exterior' },
      { id: `${propertyId}-parking`, property_id: propertyId, unit_number: 'Parking Lot' },
      { id: `${propertyId}-laundry`, property_id: propertyId, unit_number: 'Laundry Room' },
      { id: `${propertyId}-mailroom`, property_id: propertyId, unit_number: 'Mailroom' },
      { id: `${propertyId}-roof`, property_id: propertyId, unit_number: 'Roof' },
    ]

    // Try different possible table names in order of preference
    const tableNames = ['af_units', 'units', 'inv_units']

    for (const tableName of tableNames) {
      try {
        // Try to query this table
        const { data, error } = await supabase
          .from(tableName)
          .select('id, property_id, unit_number')
          .eq('property_id', propertyId)
          .eq('is_active', true)
          .order('unit_number')
          .limit(200)

        if (!error && data && data.length > 0) {
          // Successfully found data - map to our interface
          const regularUnits = data.map(unit => ({
            id: String(unit.id),
            property_id: String(unit.property_id),
            unit_number: unit.unit_number || String(unit.id),
          }))

          // Return common areas first, then regular units
          return [...commonAreas, ...regularUnits]
        }
      } catch (tableError) {
        // Table doesn't exist or query failed, try next one
        continue
      }
    }

    // No tables found or no data, use mock data
    console.log('No unit tables found in database, using mock data')
    const regularUnits = MOCK_UNITS.filter(unit => unit.property_id === propertyId)
    return [...commonAreas, ...regularUnits]
  } catch (error) {
    console.error('Error fetching units:', error)
    const regularUnits = MOCK_UNITS.filter(unit => unit.property_id === propertyId)
    const commonAreas: Unit[] = [
      { id: `${propertyId}-common-area`, property_id: propertyId, unit_number: 'Common Area' },
      { id: `${propertyId}-basement`, property_id: propertyId, unit_number: 'Basement' },
      { id: `${propertyId}-exterior`, property_id: propertyId, unit_number: 'Building Exterior' },
      { id: `${propertyId}-parking`, property_id: propertyId, unit_number: 'Parking Lot' },
      { id: `${propertyId}-laundry`, property_id: propertyId, unit_number: 'Laundry Room' },
      { id: `${propertyId}-mailroom`, property_id: propertyId, unit_number: 'Mailroom' },
      { id: `${propertyId}-roof`, property_id: propertyId, unit_number: 'Roof' },
    ]
    return [...commonAreas, ...regularUnits]
  }
}

/**
 * Get property by ID
 */
export async function getPropertyById(propertyId: string): Promise<Property | null> {
  const properties = await getProperties()
  return properties.find(p => p.id === propertyId) || null
}

/**
 * Get unit by ID
 */
export async function getUnitById(unitId: string): Promise<Unit | null> {
  const allUnits = await Promise.all(
    MOCK_PROPERTIES.map(p => getUnitsByProperty(p.id))
  )
  const units = allUnits.flat()
  return units.find(u => u.id === unitId) || null
}
