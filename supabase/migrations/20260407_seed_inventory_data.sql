-- =====================================================
-- Truck Inventory System - Seed Data
-- =====================================================
-- This file seeds initial data for trucks, catalog items, and technician PINs

-- =====================================================
-- 1. INSERT TRUCK
-- =====================================================
INSERT INTO inv_trucks (id, name, description, license_plate, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Main Truck #1',
  'Primary maintenance truck',
  'CT-ABC-123',
  true
);

-- =====================================================
-- 2. INSERT CATALOG ITEMS
-- =====================================================

-- Plumbing Items (A)
INSERT INTO inv_catalog (sku, name, description, category, shelf_zone, barcode, unit_cost, unit_of_measure, min_quantity, max_quantity, supplier) VALUES
('PLM-001', 'PVC Pipe 1/2"', '1/2 inch PVC pipe, 10ft', 'plumbing', 'A', '1234567890001', 3.50, 'EA', 5, 20, 'Home Depot'),
('PLM-002', 'PVC Pipe 3/4"', '3/4 inch PVC pipe, 10ft', 'plumbing', 'A', '1234567890002', 4.25, 'EA', 5, 15, 'Home Depot'),
('PLM-003', 'PVC Elbow 90° 1/2"', 'PVC elbow fitting', 'plumbing', 'A', '1234567890003', 0.75, 'EA', 20, 50, 'Home Depot'),
('PLM-004', 'PVC Elbow 90° 3/4"', 'PVC elbow fitting', 'plumbing', 'A', '1234567890004', 0.95, 'EA', 20, 50, 'Home Depot'),
('PLM-005', 'Copper Pipe 1/2"', '1/2 inch copper pipe, 10ft', 'plumbing', 'A', '1234567890005', 12.50, 'EA', 3, 10, 'Ferguson'),
('PLM-006', 'Copper Elbow 90°', 'Copper elbow fitting', 'plumbing', 'A', '1234567890006', 2.25, 'EA', 10, 30, 'Ferguson'),
('PLM-007', 'Pipe Wrench 14"', '14 inch pipe wrench', 'plumbing', 'A', '1234567890007', 28.99, 'EA', 1, 2, 'Home Depot'),
('PLM-008', 'Plumbers Putty', 'Waterproof plumbers putty', 'plumbing', 'A', '1234567890008', 3.99, 'EA', 3, 10, 'Home Depot'),
('PLM-009', 'Teflon Tape', 'Thread seal tape', 'plumbing', 'A', '1234567890009', 1.50, 'EA', 10, 30, 'Home Depot'),
('PLM-010', 'Drain Snake 25ft', '25 foot drain snake', 'plumbing', 'A', '1234567890010', 15.99, 'EA', 1, 3, 'Home Depot');

-- Electrical Items (B)
INSERT INTO inv_catalog (sku, name, description, category, shelf_zone, barcode, unit_cost, unit_of_measure, min_quantity, max_quantity, supplier) VALUES
('ELC-001', 'Wire Nuts (Pack of 10)', 'Twist-on wire connectors', 'electrical', 'B', '1234567890011', 4.99, 'PK', 5, 15, 'Lowes'),
('ELC-002', 'Light Switch', 'Single pole light switch', 'electrical', 'B', '1234567890012', 1.50, 'EA', 10, 30, 'Lowes'),
('ELC-003', 'Outlet 15A', '15 amp electrical outlet', 'electrical', 'B', '1234567890013', 2.25, 'EA', 10, 30, 'Lowes'),
('ELC-004', 'Wire 12/2 NM-B', '12-2 Romex wire, 25ft', 'electrical', 'B', '1234567890014', 18.50, 'EA', 3, 10, 'Lowes'),
('ELC-005', 'Wire 14/2 NM-B', '14-2 Romex wire, 25ft', 'electrical', 'B', '1234567890015', 15.99, 'EA', 3, 10, 'Lowes'),
('ELC-006', 'Circuit Breaker 15A', '15 amp circuit breaker', 'electrical', 'B', '1234567890016', 8.50, 'EA', 3, 10, 'Lowes'),
('ELC-007', 'Circuit Breaker 20A', '20 amp circuit breaker', 'electrical', 'B', '1234567890017', 9.50, 'EA', 3, 10, 'Lowes'),
('ELC-008', 'Wire Stripper', 'Multi-purpose wire stripper', 'electrical', 'B', '1234567890018', 12.99, 'EA', 1, 2, 'Lowes'),
('ELC-009', 'Voltage Tester', 'Non-contact voltage tester', 'electrical', 'B', '1234567890019', 15.99, 'EA', 1, 3, 'Lowes'),
('ELC-010', 'Electrical Tape', 'Black electrical tape', 'electrical', 'B', '1234567890020', 2.99, 'EA', 5, 15, 'Lowes');

-- Safety Items (C)
INSERT INTO inv_catalog (sku, name, description, category, shelf_zone, barcode, unit_cost, unit_of_measure, min_quantity, max_quantity, supplier) VALUES
('SFT-001', 'Work Gloves', 'Heavy duty work gloves', 'safety', 'C', '1234567890021', 6.99, 'PR', 5, 15, 'Home Depot'),
('SFT-002', 'Safety Glasses', 'ANSI approved safety glasses', 'safety', 'C', '1234567890022', 4.50, 'EA', 5, 15, 'Home Depot'),
('SFT-003', 'Dust Mask (Box of 20)', 'Disposable dust masks', 'safety', 'C', '1234567890023', 12.99, 'BX', 2, 5, 'Home Depot'),
('SFT-004', 'Hard Hat', 'OSHA approved hard hat', 'safety', 'C', '1234567890024', 18.99, 'EA', 2, 5, 'Home Depot'),
('SFT-005', 'First Aid Kit', 'Portable first aid kit', 'safety', 'C', '1234567890025', 24.99, 'EA', 1, 2, 'Amazon');

-- Hardware Items (D)
INSERT INTO inv_catalog (sku, name, description, category, shelf_zone, barcode, unit_cost, unit_of_measure, min_quantity, max_quantity, supplier) VALUES
('HRD-001', 'Wood Screws #8 x 2"', 'Box of 100 wood screws', 'hardware', 'D', '1234567890026', 8.99, 'BX', 3, 10, 'Home Depot'),
('HRD-002', 'Drywall Screws 1-1/4"', 'Box of 100 drywall screws', 'hardware', 'D', '1234567890027', 7.99, 'BX', 3, 10, 'Home Depot'),
('HRD-003', 'Nails 16d Common', '5 lb box of common nails', 'hardware', 'D', '1234567890028', 12.50, 'BX', 2, 5, 'Home Depot'),
('HRD-004', 'Bolts 1/4" x 2"', 'Pack of 25 bolts with nuts', 'hardware', 'D', '1234567890029', 9.99, 'PK', 3, 10, 'Home Depot'),
('HRD-005', 'Anchors Plastic', 'Pack of 50 wall anchors', 'hardware', 'D', '1234567890030', 6.50, 'PK', 3, 10, 'Home Depot'),
('HRD-006', 'Duct Tape', 'Heavy duty duct tape', 'hardware', 'D', '1234567890031', 5.99, 'EA', 5, 15, 'Home Depot'),
('HRD-007', 'Measuring Tape 25ft', '25 foot measuring tape', 'hardware', 'D', '1234567890032', 9.99, 'EA', 2, 5, 'Home Depot'),
('HRD-008', 'Utility Knife', 'Retractable utility knife', 'hardware', 'D', '1234567890033', 7.50, 'EA', 2, 5, 'Home Depot'),
('HRD-009', 'Level 24"', '24 inch spirit level', 'hardware', 'D', '1234567890034', 15.99, 'EA', 1, 3, 'Home Depot'),
('HRD-010', 'Hammer 16oz', '16 ounce claw hammer', 'hardware', 'D', '1234567890035', 12.99, 'EA', 2, 5, 'Home Depot');

-- Paint Items (E)
INSERT INTO inv_catalog (sku, name, description, category, shelf_zone, barcode, unit_cost, unit_of_measure, min_quantity, max_quantity, supplier) VALUES
('PNT-001', 'Paint White Gallon', 'Interior white paint, 1 gallon', 'paint', 'E', '1234567890036', 28.99, 'GA', 2, 8, 'Sherwin Williams'),
('PNT-002', 'Paint Beige Gallon', 'Interior beige paint, 1 gallon', 'paint', 'E', '1234567890037', 28.99, 'GA', 2, 8, 'Sherwin Williams'),
('PNT-003', 'Primer Gallon', 'Interior primer, 1 gallon', 'paint', 'E', '1234567890038', 24.99, 'GA', 2, 6, 'Sherwin Williams'),
('PNT-004', 'Paint Roller Kit', 'Paint roller with tray', 'paint', 'E', '1234567890039', 8.99, 'EA', 3, 10, 'Home Depot'),
('PNT-005', 'Paint Brush 3"', '3 inch paint brush', 'paint', 'E', '1234567890040', 4.50, 'EA', 5, 15, 'Home Depot'),
('PNT-006', 'Painters Tape 2"', '2 inch blue painters tape', 'paint', 'E', '1234567890041', 6.99, 'EA', 3, 10, 'Home Depot'),
('PNT-007', 'Caulk White', 'White latex caulk', 'paint', 'E', '1234567890042', 3.99, 'EA', 5, 15, 'Home Depot'),
('PNT-008', 'Spackle Paste', 'Interior spackle paste', 'paint', 'E', '1234567890043', 5.99, 'EA', 3, 10, 'Home Depot'),
('PNT-009', 'Sandpaper Assortment', 'Assorted grit sandpaper pack', 'paint', 'E', '1234567890044', 7.50, 'PK', 3, 10, 'Home Depot'),
('PNT-010', 'Putty Knife 3"', '3 inch putty knife', 'paint', 'E', '1234567890045', 4.99, 'EA', 3, 10, 'Home Depot');

-- HVAC Items (F)
INSERT INTO inv_catalog (sku, name, description, category, shelf_zone, barcode, unit_cost, unit_of_measure, min_quantity, max_quantity, supplier) VALUES
('HVA-001', 'HVAC Filter 16x20', '16x20 HVAC filter', 'hvac', 'F', '1234567890046', 12.99, 'EA', 5, 20, 'Home Depot'),
('HVA-002', 'HVAC Filter 16x25', '16x25 HVAC filter', 'hvac', 'F', '1234567890047', 13.99, 'EA', 5, 20, 'Home Depot'),
('HVA-003', 'HVAC Filter 20x20', '20x20 HVAC filter', 'hvac', 'F', '1234567890048', 14.99, 'EA', 5, 20, 'Home Depot'),
('HVA-004', 'Refrigerant R-410A', 'R-410A refrigerant, 25lb', 'hvac', 'F', '1234567890049', 180.00, 'EA', 1, 3, 'Ferguson'),
('HVA-005', 'HVAC Tape Aluminum', 'Aluminum HVAC tape', 'hvac', 'F', '1234567890050', 8.99, 'EA', 3, 10, 'Home Depot');

-- Lighting Items (G)
INSERT INTO inv_catalog (sku, name, description, category, shelf_zone, barcode, unit_cost, unit_of_measure, min_quantity, max_quantity, supplier) VALUES
('LGT-001', 'LED Bulb 60W', 'LED bulb 60W equivalent', 'lighting', 'G', '1234567890051', 3.99, 'EA', 10, 30, 'Home Depot'),
('LGT-002', 'LED Bulb 100W', 'LED bulb 100W equivalent', 'lighting', 'G', '1234567890052', 5.99, 'EA', 10, 30, 'Home Depot'),
('LGT-003', 'Fluorescent Tube 4ft', '4 foot fluorescent tube', 'lighting', 'G', '1234567890053', 4.50, 'EA', 10, 20, 'Home Depot'),
('LGT-004', 'Light Fixture Ceiling', 'Basic ceiling light fixture', 'lighting', 'G', '1234567890054', 24.99, 'EA', 2, 5, 'Home Depot'),
('LGT-005', 'Ballast Fluorescent', 'Fluorescent light ballast', 'lighting', 'G', '1234567890055', 15.99, 'EA', 3, 8, 'Home Depot');

-- Cleaning Supplies (Other - X)
INSERT INTO inv_catalog (sku, name, description, category, shelf_zone, barcode, unit_cost, unit_of_measure, min_quantity, max_quantity, supplier) VALUES
('CLN-001', 'All-Purpose Cleaner', 'Multi-surface cleaner spray', 'cleaning', 'X', '1234567890056', 4.99, 'EA', 5, 15, 'Costco'),
('CLN-002', 'Bleach Gallon', 'Household bleach, 1 gallon', 'cleaning', 'X', '1234567890057', 3.50, 'GA', 3, 10, 'Costco'),
('CLN-003', 'Paper Towels', 'Paper towels, 6 roll pack', 'cleaning', 'X', '1234567890058', 12.99, 'PK', 2, 8, 'Costco'),
('CLN-004', 'Trash Bags 33gal', '33 gallon trash bags, 50 count', 'cleaning', 'X', '1234567890059', 15.99, 'BX', 2, 6, 'Costco'),
('CLN-005', 'Mop and Bucket', 'Commercial mop with bucket', 'cleaning', 'X', '1234567890060', 28.99, 'EA', 1, 3, 'Home Depot');

-- =====================================================
-- 3. INSERT INITIAL STOCK LEVELS
-- =====================================================
-- Initialize stock for Main Truck #1 with starting quantities
INSERT INTO inv_stock_levels (truck_id, catalog_item_id, current_quantity, last_counted_at, last_counted_by)
SELECT
  '00000000-0000-0000-0000-000000000001',
  id,
  FLOOR(RANDOM() * (max_quantity - min_quantity + 1) + min_quantity)::INTEGER,
  NOW() - INTERVAL '7 days',
  'System'
FROM inv_catalog
WHERE is_active = true;

-- =====================================================
-- 4. INSERT TECHNICIAN PINS
-- =====================================================
-- PIN: 1234 for Stan (hash is SHA-256 of '1234')
INSERT INTO inv_technician_pins (technician_id, technician_name, pin_hash, truck_id, is_active)
VALUES (
  'tech-001',
  'Stan',
  '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4',
  '00000000-0000-0000-0000-000000000001',
  true
);

-- PIN: 5678 for Javier (hash is SHA-256 of '5678')
INSERT INTO inv_technician_pins (technician_id, technician_name, pin_hash, truck_id, is_active)
VALUES (
  'tech-002',
  'Javier',
  '4d79e8897bb61d86c2f43992ec50d7d2d5415d0b2c30f4f5c35e3e47b5c8c8b0',
  '00000000-0000-0000-0000-000000000001',
  true
);

-- =====================================================
-- 5. CREATE INITIAL RESTOCK ALERTS
-- =====================================================
-- Automatically create alerts for items below minimum
INSERT INTO inv_restock_alerts (truck_id, catalog_item_id, current_quantity, min_quantity, alert_date)
SELECT
  sl.truck_id,
  sl.catalog_item_id,
  sl.current_quantity,
  c.min_quantity,
  NOW()
FROM inv_stock_levels sl
JOIN inv_catalog c ON sl.catalog_item_id = c.id
WHERE sl.current_quantity <= c.min_quantity
AND c.is_active = true;
