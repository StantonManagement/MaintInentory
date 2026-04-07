import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PinLogin } from './pages/PinLogin'
import { Home } from './pages/Home'
import { LocationSelect } from './pages/LocationSelect'
import { Scanner } from './pages/Scanner'
import { OrderComplete } from './pages/OrderComplete'
import { ReturnLocationSelect } from './pages/ReturnLocationSelect'
import { ReturnScanner } from './pages/ReturnScanner'
import { ReturnComplete } from './pages/ReturnComplete'
import { ManagementLayout } from './components/management/Layout'
import { Dashboard } from './pages/management/Dashboard'
import { TransactionsPage } from './pages/management/Transactions'
import { CatalogPage } from './pages/management/Catalog'
import { RestockPage } from './pages/management/Restock'
import { TrucksPage } from './pages/management/Trucks'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Tablet App Routes */}
        <Route path="/" element={<PinLogin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/location-select" element={<LocationSelect />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/order-complete" element={<OrderComplete />} />
        
        {/* Return Flow Routes */}
        <Route path="/return" element={<ReturnLocationSelect />} />
        <Route path="/return-scanner" element={<ReturnScanner />} />
        <Route path="/return-complete" element={<ReturnComplete />} />
        
        {/* Management Interface Routes */}
        <Route element={<ManagementLayout />}>
          <Route path="/inventory" element={<Dashboard />} />
          <Route path="/inventory/transactions" element={<TransactionsPage />} />
          <Route path="/inventory/catalog" element={<CatalogPage />} />
          <Route path="/inventory/restock" element={<RestockPage />} />
          <Route path="/inventory/trucks" element={<TrucksPage />} />
        </Route>
        
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
