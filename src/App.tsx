import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AppRoutes } from './routes'
import { Loader2 } from 'lucide-react'

export default function App() {
  const init = useAuthStore(s => s.init)
  const loading = useAuthStore(s => s.loading)

  useEffect(() => {
    const unsubscribe = init()
    return () => unsubscribe()
  }, [init])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-400 mx-auto mb-4" />
          <p className="text-gray-100 text-lg font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
