import { Navigate } from 'react-router-dom'
import { isAdminAuthenticated } from '@/services/adminAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute component
 * Redirects to admin login if user is not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticated = isAdminAuthenticated()

  if (!isAuthenticated) {
    // Redirect to admin login if not authenticated
    return <Navigate to="/admin-login" replace />
  }

  return <>{children}</>
}
