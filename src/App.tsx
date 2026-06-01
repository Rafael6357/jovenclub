import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AppRoutes } from './routes'
import { FullScreenLoader } from './components/ui/Spinner'

export default function App() {
  const init = useAuthStore(s => s.init)
  const loading = useAuthStore(s => s.loading)

  useEffect(() => {
    const unsubscribe = init()
    return () => unsubscribe()
  }, [init])

  if (loading) {
    return <FullScreenLoader />
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
