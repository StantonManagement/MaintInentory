import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PinLogin } from './pages/PinLogin'
import { Home } from './pages/Home'
import { LocationSelect } from './pages/LocationSelect'
import { Scanner } from './pages/Scanner'
import { OrderComplete } from './pages/OrderComplete'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PinLogin />} />
        <Route path="/home" element={<Home />} />
        <Route path="/location-select" element={<LocationSelect />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/order-complete" element={<OrderComplete />} />
        {/* Catch all - redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
