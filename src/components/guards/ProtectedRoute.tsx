import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Loader2 } from 'lucide-react'

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuthStore()
  if (loading) return <div className="flex items-center justify-center h-screen"><Loader2 className="w-8 h-8 animate-spin text-primary-600" /></div>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}
