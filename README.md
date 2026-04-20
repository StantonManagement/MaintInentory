# Stanton Truck Tablet - Inventory Management PWA

A touch-optimized Progressive Web App for managing inventory transactions from the supply truck.

## Overview

This tablet application serves as a mobile point-of-sale system for technicians to:
- Log in with a 4-digit PIN
- Select property and unit locations
- Scan or search for inventory items
- Build orders with quantity adjustments
- Complete transactions that bill to properties

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 5.4** - Build tool (compatible with Node 20.16)
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Lucide React** - Icons

## Project Structure

```
truck-tablet/
├── src/
│   ├── pages/
│   │   ├── PinLogin.tsx          # 4-digit PIN authentication
│   │   ├── Home.tsx               # Main menu (New Order / Return Items)
│   │   ├── LocationSelect.tsx    # Property + Unit selection
│   │   ├── Scanner.tsx            # Barcode scanning + cart management
│   │   └── OrderComplete.tsx     # Order confirmation screen
│   ├── App.tsx                    # Router configuration
│   └── index.css                  # Global styles (tablet-optimized)
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## User Flow

1. **PIN Login** → Tech enters 4-digit PIN (Demo: 1234=Stan, 5678=Javier)
2. **Home Screen** → Large "New Order" button
3. **Location Select** → Choose Property and Unit from dropdowns
4. **Scanner/Cart** → Scan items or search manually, adjust quantities
5. **Order Complete** → Confirmation with receipt option

## Touch-Optimized Features

- **48px minimum touch targets** for all interactive elements
- **Large buttons** (h-20 = 80px) for numeric keypad and primary actions
- **Disabled text selection** to prevent accidental highlights on double-tap
- **Active scale animations** (active:scale-95/98) for tactile feedback
- **No tap highlight colors** for cleaner interaction

## Database Integration

**Fully Connected:**
- **Technicians:** PIN authentication via `inv_technician_pins` table
- **Inventory Items:** Real catalog from `inv_catalog` table (60+ items)
- **Transactions:** Saved to `inv_transactions` and `inv_transaction_lines`
- **Stock Levels:** Auto-updated in `inv_stock_levels`
- **Restock Alerts:** Calculated from real stock data
- **Trucks:** Managed via `inv_trucks` table

**Smart Fallback:**
- **Properties/Units:** Tries multiple table names (af_properties, properties, inv_properties)
  - Falls back to mock data if tables don't exist
  - Includes common areas (Common Area, Basement, Exterior, etc.)

## Next Steps (Future Enhancements)

1. **Barcode Scanning:**
   - Integrate `html5-qrcode` or `quagga2` library
   - Enable camera access for real barcode scanning
   - Currently simulated (adds random item)

2. **Admin Authentication:**
   - Protect `/inventory/*` management routes
   - PIN or password-based authentication for admin users

3. **Offline Mode:**
   - Implement IndexedDB caching
   - Queue transactions when offline
   - Sync when connection restored

4. **Invoice PDF Generation:**
   - Generate PDF receipts for orders
   - Email/print functionality
   - Transaction history export

## Development

```bash
# Install dependencies
npm install

# Start dev server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Notes

- Built to work with **Node.js 20.16.0** (downgraded Vite from 8.x to 5.4.x)
- Uses **Vite 5.4** and **@vitejs/plugin-react 4.3.0** for compatibility
- Designed for **tablet mounting in truck** - landscape orientation recommended
- This is a **separate app** from MaintOC (not a new page/module)

## Related Documentation

See parent directory for:
- `TRUCK_INVENTORY_PRD_ANALYSIS.md` - Full requirements analysis
- Backend implementation will live in `/Users/zeff/Desktop/Work/stanton/MaintOC`
