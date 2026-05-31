import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { db } from '../db/database'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { formatDate, formatDateTime } from '../lib/utils'
import { Calendar, Megaphone, CalendarRange, Users, BookUser, ArrowLeftRight } from 'lucide-react'

export function Dashboard() {
  const { usuario, isAdmin } = useAuthStore()
  const [stats, setStats] = useState({ usuarios: 0, anuncios: 0, reservas: 0, horarios: 0 })
  const [recentAnuncios, setRecentAnuncios] = useState<any[]>([])
  const [misHorarios, setMisHorarios] = useState<any[]>([])
  const [pendientes, setPendientes] = useState(0)

  useEffect(() => {
    const load = async () => {
      const [u, a, r, h, s] = await Promise.all([
        db.usuarios.count(),
        db.anuncios.count(),
        db.reservas.where('estado').equals('confirmada').count(),
        db.horarios.count(),
        db.solicitudesCambio.where('estado').equals('pendiente').count(),
      ])
      setStats({ usuarios: u, anuncios: a, reservas: r, horarios: h })
      setPendientes(s)
      const anuncios = await db.anuncios.orderBy('fechaPublicacion').reverse().limit(3).toArray()
      setRecentAnuncios(anuncios)
      if (usuario) {
        const horarios = await db.horarios.where('usuarioId').equals(usuario.id).toArray()
        setMisHorarios(horarios)
      }
    }
    load()
  }, [usuario])

  const statCards = [
    ...(isAdmin() ? [{ label: 'Usuarios', value: stats.usuarios, icon: Users, color: 'text-blue-400 bg-blue-900/30', to: '/usuarios' }] : []),
    { label: 'Anuncios', value: stats.anuncios, icon: Megaphone, color: 'text-amber-400 bg-amber-900/30', to: '/anuncios' },
    { label: 'Reservas activas', value: stats.reservas, icon: CalendarRange, color: 'text-green-400 bg-green-900/30', to: '/reservas' },
    { label: 'Horarios', value: stats.horarios, icon: Calendar, color: 'text-purple-400 bg-purple-900/30', to: '/horarios' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Bienvenido, {usuario?.nombre}</h1>
        <p className="text-gray-400 text-sm mt-1">
          {isAdmin() ? 'Panel de administración del Joven Club de San Luis' : 'Tu panel de instructor del Joven Club de San Luis'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => (
          <Link key={card.to} to={card.to}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-100">{card.value}</p>
                  <p className="text-xs text-gray-400">{card.label}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-100 mb-3 flex items-center gap-2">
            <Megaphone className="w-4 h-4" /> Últimos Anuncios
          </h3>
          {recentAnuncios.length === 0 ? (
            <p className="text-sm text-gray-400">No hay anuncios</p>
          ) : (
            <div className="space-y-3">
              {recentAnuncios.map(a => (
                <Link key={a.id} to={`/anuncios/${a.id}`} className="block p-3 rounded-lg hover:bg-gray-700 border border-gray-700">
                  <p className="font-medium text-sm text-gray-100">{a.titulo}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(a.fechaPublicacion)}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-100 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Mis Horarios
          </h3>
          {misHorarios.length === 0 ? (
            <p className="text-sm text-gray-400">No tienes horarios asignados</p>
          ) : (
            <div className="space-y-2">
              {misHorarios.slice(0, 5).map(h => {
                const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
                return (
                  <div key={h.id} className="flex items-center justify-between p-2 rounded bg-gray-900 text-sm">
                    <span className="font-medium">{dias[h.diaSemana]}</span>
                    <span className="text-gray-400">{h.horaInicio} - {h.horaFin}</span>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {isAdmin() && pendientes > 0 && (
          <Card className="lg:col-span-2">
            <Link to="/horarios/cambios" className="flex items-center gap-3 p-3 rounded-lg bg-amber-900/30 hover:bg-amber-900/50 transition-colors">
              <ArrowLeftRight className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-medium text-sm text-amber-300">
                  {pendientes} solicitud{pendientes > 1 ? 'es' : ''} de cambio de turno pendiente{pendientes > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-amber-400">Haz clic para revisar</p>
              </div>
            </Link>
          </Card>
        )}
      </div>
    </div>
  )
}

