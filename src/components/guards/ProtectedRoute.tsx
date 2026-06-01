import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { FullScreenLoader } from '../ui/Spinner'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuthStore()
  if (loading) return <FullScreenLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
