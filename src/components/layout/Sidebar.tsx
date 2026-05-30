import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useUIStore } from '../../stores/uiStore'
import {
  LayoutDashboard, Users, Calendar, ArrowLeftRight, BookUser,
  Megaphone, Monitor, CalendarRange, FileText, Settings, X
} from 'lucide-react'
import { classNames } from '../../lib/utils'

const allLinks = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
  { to: '/usuarios', icon: Users, label: 'Usuarios', adminOnly: true },
  { to: '/horarios', icon: Calendar, label: 'Horarios', adminOnly: false },
  { to: '/horarios/cambios', icon: ArrowLeftRight, label: 'Cambios Turno', adminOnly: false },
  { to: '/directorio', icon: BookUser, label: 'Directorio', adminOnly: false },
  { to: '/anuncios', icon: Megaphone, label: 'Anuncios', adminOnly: false },
  { to: '/recursos', icon: Monitor, label: 'Recursos', adminOnly: false },
  { to: '/reservas', icon: CalendarRange, label: 'Reservas', adminOnly: false },
  { to: '/reportes', icon: FileText, label: 'Reportes', adminOnly: false },
  { to: '/configuracion', icon: Settings, label: 'Configuración', adminOnly: false },
]

export function Sidebar() {
  const { usuario, isAdmin } = useAuthStore()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const admin = isAdmin()
  const links = allLinks.filter(l => !l.adminOnly || admin)

  return (
    <>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={classNames(
        'fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-gray-200 transform transition-transform lg:translate-x-0 lg:static lg:z-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-3 px-6 py-4 border-b">
          <div className="w-10 h-10 rounded-xl bg-primary-800 flex items-center justify-center">
            <span className="text-white font-bold text-sm">JC</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary-800 truncate">COMUNICA-JC</p>
            <p className="text-xs text-gray-500 truncate">Joven Club San Luis</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="p-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => classNames(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-800'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <link.icon className="w-5 h-5 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t bg-gray-50">
          <div className="flex items-center gap-3 px-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-800 flex items-center justify-center text-xs font-semibold">
              {usuario?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-gray-900 truncate">{usuario?.nombre}</p>
              <p className="text-xs text-gray-500 capitalize">{usuario?.rolId === 'admin' ? 'Administrador' : 'Instructor'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
