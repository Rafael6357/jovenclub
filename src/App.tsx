import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { AppRoutes } from './routes'

export default function App() {
  const init = useAuthStore(s => s.init)

  useEffect(() => {
    const unsubscribe = init()
    return () => unsubscribe()
  }, [init])

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
