import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { Toast } from '../ui/Toast'
import { useNotificationStore } from '../../stores/notificationStore'

export function AppShell() {
  const add = useNotificationStore(s => s.add)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.procesados > 0) {
        add(`${detail.procesados} cambio(s) sincronizado(s) correctamente`, 'success')
      }
    }
    window.addEventListener('sync-complete', handler)
    return () => window.removeEventListener('sync-complete', handler)
  }, [add])

  return (
    <div className="flex h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  )
}
