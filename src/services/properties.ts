// import { supabase } from '@/lib/supabase'

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

// TODO: Connect to real properties table when available
// For now, using hardcoded data that matches the structure
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
 * Fetch all properties
 * TODO: Replace with actual Supabase query when properties table is available
 */
export async function getProperties(): Promise<Property[]> {
  try {
    // Attempt to fetch from Supabase
    // const { data, error } = await supabase
    //   .from('properties')
    //   .select('id, name, address')
    //   .eq('is_active', true)
    //   .order('name')

    // if (error) throw error
    // return data || []

    // For now, return mock data
    return Promise.resolve(MOCK_PROPERTIES)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return MOCK_PROPERTIES
  }
}

/**
 * Fetch units for a specific property
 * TODO: Replace with actual Supabase query when units table is available
 */
export async function getUnitsByProperty(propertyId: string): Promise<Unit[]> {
  try {
    // Attempt to fetch from Supabase
    // const { data, error } = await supabase
    //   .from('units')
    //   .select('id, property_id, unit_number')
    //   .eq('property_id', propertyId)
    //   .eq('is_active', true)
    //   .order('unit_number')

    // if (error) throw error
    // return data || []

    // For now, return filtered mock data
    return Promise.resolve(
      MOCK_UNITS.filter(unit => unit.property_id === propertyId)
    )
  } catch (error) {
    console.error('Error fetching units:', error)
    return MOCK_UNITS.filter(unit => unit.property_id === propertyId)
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
