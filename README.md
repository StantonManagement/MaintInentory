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

## Mock Data (Phase 1)

Currently uses hardcoded mock data:
- **Technicians:** PIN 1234=Stan, 5678=Javier
- **Properties:** 3 sample Hartford properties
- **Units:** 4 sample units per property
- **Inventory Items:** 5 sample items (plumbing, electrical, HVAC)

## Next Steps (Phase 2 - Backend Integration)

1. **Supabase Integration:**
   - Connect to `inv_items` table for real inventory
   - Query `properties` and `units` tables
   - Create `inv_transactions` on order completion
   - Implement tech PIN authentication via `users` table

2. **Barcode Scanning:**
   - Integrate `html5-qrcode` or `quagga2` library
   - Enable camera access for real barcode scanning
   - Match scanned SKU to inventory items

3. **Offline Mode:**
   - Implement IndexedDB caching
   - Queue transactions when offline
   - Sync when connection restored

4. **Invoice Generation:**
   - Generate PDF receipts
   - Email/print functionality
   - Transaction history

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
