import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wkwmxxlfheywwbgdbzxe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indrd214eGxmaGV5d3diZ2RienhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTcxOTIsImV4cCI6MjA3OTQ1NzE5Mn0.G4UyeP2BVuGG35oGDXMJcgbSCVVtBhSO6WddG-b6bm4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Testing Supabase connection...\n');

// Test 1: Check if inv_technician_pins table exists
console.log('1. Checking inv_technician_pins table...');
const { data: pins, error: pinsError } = await supabase
  .from('inv_technician_pins')
  .select('*');

if (pinsError) {
  console.error('❌ Error accessing inv_technician_pins:', pinsError.message);
  console.log('\n⚠️  The table might not exist. Please run the migration SQL in Supabase dashboard:');
  console.log('   File: supabase/migrations/20260407_create_inventory_tables.sql');
} else {
  console.log('✅ Table exists!');
  console.log(`   Found ${pins.length} PIN records`);
  if (pins.length > 0) {
    console.log('   PINs:', pins.map(p => `${p.technician_name} (${p.technician_id})`).join(', '));
  }
}

// Test 2: Check if inv_catalog table exists
console.log('\n2. Checking inv_catalog table...');
const { data: catalog, error: catalogError } = await supabase
  .from('inv_catalog')
  .select('*')
  .limit(5);

if (catalogError) {
  console.error('❌ Error accessing inv_catalog:', catalogError.message);
} else {
  console.log('✅ Table exists!');
  console.log(`   Found ${catalog.length} catalog items (showing first 5)`);
  if (catalog.length > 0) {
    catalog.forEach(item => {
      console.log(`   - ${item.sku}: ${item.name} ($${item.unit_cost})`);
    });
  }
}

// Test 3: Try to authenticate with PIN 1234
console.log('\n3. Testing PIN authentication (1234)...');
const pinToTest = '1234';
const encoder = new TextEncoder();
const data = encoder.encode(pinToTest);
const hashBuffer = await crypto.subtle.digest('SHA-256', data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const pinHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

console.log('   PIN Hash:', pinHash);

const { data: authResult, error: authError } = await supabase
  .from('inv_technician_pins')
  .select('technician_id, technician_name, truck_id, is_active')
  .eq('pin_hash', pinHash)
  .eq('is_active', true)
  .single();

if (authError) {
  console.error('❌ Authentication failed:', authError.message);
  if (authError.code === 'PGRST116') {
    console.log('\n⚠️  No matching PIN found in database. Please run the seed data SQL:');
    console.log('   File: supabase/migrations/20260407_seed_inventory_data.sql');
  }
} else {
  console.log('✅ Authentication successful!');
  console.log('   Technician:', authResult.technician_name);
  console.log('   Truck ID:', authResult.truck_id);
}

console.log('\n--- Test Complete ---');
