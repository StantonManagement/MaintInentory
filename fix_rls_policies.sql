-- Fix RLS policies for inv_technician_pins table
-- Run this in Supabase SQL Editor if you're getting 406 errors

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow anon read access to technician pins" ON inv_technician_pins;

-- Recreate policy with explicit permissions
CREATE POLICY "Allow anon read access to technician pins"
  ON inv_technician_pins FOR SELECT
  TO anon, authenticated
  USING (true);

-- Also add policy to allow updating last_login_at
DROP POLICY IF EXISTS "Allow anon update technician pins" ON inv_technician_pins;

CREATE POLICY "Allow anon update technician pins"
  ON inv_technician_pins FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'inv_technician_pins';

-- List all policies on the table
SELECT * FROM pg_policies WHERE tablename = 'inv_technician_pins';
