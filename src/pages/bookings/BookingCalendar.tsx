import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { getAllReservas, cancelarReserva } from '../../services/bookingService'
import { getAllRecursos } from '../../services/resourceService'
import { getAllUsers } from '../../services/userService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate, formatTime } from '../../lib/utils'
import { Plus, CalendarRange, X as XIcon } from 'lucide-react'

export function BookingCalendar() {
  const { usuario, isAdmin } = useAuthStore()
  const [reservas, setReservas] = useState<any[]>([])
  const [recursos, setRecursos] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [cancelId, setCancelId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [r, rec, users] = await Promise.all([getAllReservas(), getAllRecursos(), getAllUsers()])
    const filtered = isAdmin() ? r : r.filter(rv => rv.usuarioId === usuario?.id)
    setReservas(filtered)
    setRecursos(rec)
    setUsuarios(users)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const recursoMap = new Map(recursos.map(r => [r.id, r.nombre]))
  const userMap = new Map(usuarios.map(u => [u.id, u.nombre]))

  const handleCancel = async () => {
    if (cancelId) { await cancelarReserva(cancelId); setCancelId(null); load() }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Reservas de Recursos</h1>
        <Link to="/reservas/nueva"><Button icon={<Plus className="w-4 h-4" />}>Nueva Reserva</Button></Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando...</div>
      ) : reservas.length === 0 ? (
        <EmptyState icon={<CalendarRange className="w-12 h-12" />} title="No hay reservas" description="No se encontraron reservas de recursos" />
      ) : (
        <div className="space-y-3">
          {reservas.map(r => (
            <Card key={r.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{r.tituloEvento}</h3>
                    <Badge variant={r.estado === 'confirmada' ? 'success' : 'danger'}>
                      {r.estado === 'confirmada' ? 'Confirmada' : 'Cancelada'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">Recurso: {recursoMap.get(r.recursoId) || 'N/A'}</p>
                  <p className="text-sm text-gray-500">Solicitante: {userMap.get(r.usuarioId) || 'N/A'}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(r.fechaInicio)} | {r.fechaInicio.split('T')[1]?.slice(0, 5)} - {r.fechaFin.split('T')[1]?.slice(0, 5)} | {r.asistentes} asistente{r.asistentes !== 1 ? 's' : ''}
                  </p>
                </div>
                {r.estado === 'confirmada' && (isAdmin() || r.usuarioId === usuario?.id) && (
                  <Button variant="danger" size="sm" onClick={() => setCancelId(r.id)} icon={<XIcon className="w-4 h-4" />}>Cancelar</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!cancelId} onClose={() => setCancelId(null)} title="Cancelar reserva" size="sm">
        <p className="text-gray-600 mb-4">¿Cancelar esta reserva? Esta acción quedará registrada.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setCancelId(null)}>No, mantener</Button>
          <Button variant="danger" onClick={handleCancel}>Sí, cancelar</Button>
        </div>
      </Modal>
    </div>
  )
}


