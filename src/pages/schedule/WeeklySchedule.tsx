import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { getAllHorarios, getHorariosByUsuario, deleteHorario } from '../../services/scheduleService'
import { getAllUsers } from '../../services/userService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageLoader } from '../../components/ui/Spinner'
import { DIAS_SEMANA } from '../../lib/constants'
import { Plus, Pencil, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

export function WeeklySchedule() {
  const { usuario, isAdmin } = useAuthStore()
  const [horarios, setHorarios] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!usuario && !isAdmin()) return
    const all = isAdmin() ? await getAllHorarios() : await getHorariosByUsuario(usuario!.id)
    setHorarios(all)
    const users = await getAllUsers()
    setUsuarios(users)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const userMap = new Map(usuarios.map(u => [u.id, u.nombre]))

  const getWeekDates = () => {
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - now.getDay() + 1 + weekOffset * 7)
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d
    })
  }

  const weekDates = getWeekDates()

  const handleDelete = async () => {
    if (deleteId) { await deleteHorario(deleteId); setDeleteId(null); load() }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-100">Horarios Semanales</h1>
        {isAdmin() && (
          <Link to="/horarios/nuevo">
            <Button icon={<Plus className="w-4 h-4" />}>Asignar Horario</Button>
          </Link>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset(w => w - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <span className="text-sm font-medium text-gray-200">
          {weekDates[0].toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setWeekOffset(w => w + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {loading ? (
        <PageLoader />
      ) : horarios.length === 0 ? (
        <EmptyState icon={<Calendar className="w-12 h-12" />} title="No hay horarios" description="No se encontraron horarios para este período" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDates.map((date, i) => {
            const diaSemana = i + 1
            const dayHorarios = horarios.filter(h => h.diaSemana === diaSemana)
            return (
              <div key={i} className="space-y-2">
                <div className="text-center">
                  <p className="text-xs text-gray-400 uppercase">{DIAS_SEMANA[i]?.abbr}</p>
                  <p className="text-lg font-bold text-gray-100">{date.getDate()}</p>
                </div>
                {dayHorarios.length === 0 ? (
                  <div className="text-xs text-gray-500 text-center py-4">Sin turnos</div>
                ) : (
                  dayHorarios.map(h => (
                    <div key={h.id} className="bg-gray-800 border border-gray-700 rounded-lg p-2 text-xs space-y-1">
                      <p className="font-semibold text-primary-300 truncate">{userMap.get(h.usuarioId) || 'N/D'}</p>
                      <p className="text-primary-400">{h.horaInicio} - {h.horaFin}</p>

                      {isAdmin() && (
                        <div className="flex gap-1 pt-1">
                          <Link to={`/horarios/${h.id}/editar`} className="text-primary-400 hover:text-primary-300 focus-visible:ring-2 focus-visible:ring-primary-500 rounded" aria-label="Editar horario">
                            <Pencil className="w-3 h-3" />
                          </Link>
                          <button onClick={() => setDeleteId(h.id)} className="text-red-400 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-400 rounded" aria-label="Eliminar horario">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar horario" size="sm">
        <p className="text-gray-300 mb-4">¿Eliminar este horario?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}


