import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import { useNavigate } from 'react-router-dom'
import { SyncIndicator } from './SyncIndicator'
import { LogOut, Menu } from 'lucide-react'

export function Header() {
  const { usuario, logout } = useAuthStore()
  const { toggleSidebar } = useUIStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-4 lg:px-6">
      <button onClick={toggleSidebar} className="p-2 hover:bg-gray-800 rounded-lg lg:hidden text-gray-400 focus-visible:ring-2 focus-visible:ring-primary-500" aria-label="Abrir menú">
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <SyncIndicator />
        <div className="h-6 w-px bg-gray-700" />
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors focus-visible:ring-2 focus-visible:ring-red-400 rounded px-1"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>
    </header>
  )
}
