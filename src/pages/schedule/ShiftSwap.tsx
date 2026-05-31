import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { getAllSolicitudes, getSolicitudesBySolicitante, createSolicitud, aprobarSolicitud, rechazarSolicitud } from '../../services/shiftSwapService'
import { getAllUsers } from '../../services/userService'
import { getHorariosByUsuario } from '../../services/scheduleService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { DIAS_SEMANA } from '../../lib/constants'
import { ArrowLeftRight, Check, X as XIcon, Clock, Calendar } from 'lucide-react'

export function ShiftSwap() {
  const { usuario, isAdmin } = useAuthStore()
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [misHorarios, setMisHorarios] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    turnoOriginalId: '', turnoOriginalTexto: '',
    diaPropuesto: '1', horaInicioPropuesto: '08:00', horaFinPropuesto: '16:00',
    reemplazanteId: '', motivo: '',
  })
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!usuario && !isAdmin()) return
    const [sols, users, horarios] = await Promise.all([
      isAdmin() ? getAllSolicitudes() : getSolicitudesBySolicitante(usuario!.id),
      getAllUsers(),
      usuario ? getHorariosByUsuario(usuario.id) : Promise.resolve([]),
    ])
    setSolicitudes(sols)
    setUsuarios(users)
    setMisHorarios(horarios)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const userMap = new Map(usuarios.map(u => [u.id, u.nombre]))

  const resetForm = () => setForm({
    turnoOriginalId: '', turnoOriginalTexto: '',
    diaPropuesto: '1', horaInicioPropuesto: '08:00', horaFinPropuesto: '16:00',
    reemplazanteId: '', motivo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const diaNombre = DIAS_SEMANA.find(d => d.id === Number(form.diaPropuesto))?.nombre || ''
    const turnoPropuesto = `${diaNombre} ${form.horaInicioPropuesto}-${form.horaFinPropuesto}`
    if (!usuario) return
    await createSolicitud({
      solicitanteId: usuario.id,
      reemplazanteId: form.reemplazanteId,
      turnoOriginal: form.turnoOriginalTexto,
      turnoPropuesto,
      motivo: form.motivo,
    })
    setShowForm(false)
    resetForm()
    load()
  }

  const handleAprobar = async (id: string) => { await aprobarSolicitud(id); load() }
  const handleRechazar = async (id: string) => { await rechazarSolicitud(id); load() }

  const estadoVariant = (e: string) => {
    if (e === 'aprobada') return 'success'
    if (e === 'rechazada') return 'danger'
    return 'warning'
  }

  const selectHorario = (h: any) => {
    const diaNombre = DIAS_SEMANA.find(d => d.id === h.diaSemana)?.nombre || ''
    setForm(f => ({
      ...f,
      turnoOriginalId: h.id,
      turnoOriginalTexto: `${diaNombre} ${h.horaInicio}-${h.horaFin}`,
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-100">Solicitudes de Cambio de Turno</h1>
        <Button onClick={() => { resetForm(); setShowForm(true) }} icon={<ArrowLeftRight className="w-4 h-4" />}>Nueva Solicitud</Button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando...</div>
      ) : solicitudes.length === 0 ? (
        <EmptyState icon={<ArrowLeftRight className="w-12 h-12" />} title="No hay solicitudes" description="No se encontraron solicitudes de cambio" />
      ) : (
        <div className="space-y-3">
          {solicitudes.map(s => (
            <Card key={s.id}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{userMap.get(s.solicitanteId) || 'Desconocido'}</p>
                    <Badge variant={estadoVariant(s.estado)}>{s.estado}</Badge>
                  </div>
                  <p className="text-sm text-gray-400">Turno original: {s.turnoOriginal}</p>
                  <p className="text-sm text-gray-400">Turno propuesto: {s.turnoPropuesto}</p>
                  {s.reemplazanteId && <p className="text-xs text-gray-400">Reemplazante: {userMap.get(s.reemplazanteId)}</p>}
                  {s.motivo && <p className="text-xs text-gray-400 italic">Motivo: {s.motivo}</p>}
                </div>
                {isAdmin() && s.estado === 'pendiente' && (
                  <div className="flex gap-2">
                    <Button variant="success" size="sm" onClick={() => handleAprobar(s.id)} icon={<Check className="w-4 h-4" />}>Aprobar</Button>
                    <Button variant="danger" size="sm" onClick={() => handleRechazar(s.id)} icon={<XIcon className="w-4 h-4" />}>Rechazar</Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nueva Solicitud de Cambio" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Turno Actual
            </label>
            {misHorarios.length === 0 ? (
              <p className="text-sm text-gray-400 bg-gray-900 rounded-lg p-3">No tienes horarios asignados</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {misHorarios.map(h => {
                  const diaNombre = DIAS_SEMANA.find(d => d.id === h.diaSemana)?.nombre || ''
                  const label = `${diaNombre} ${h.horaInicio}-${h.horaFin}`
                  return (
                    <div
                      key={h.id}
                      onClick={() => selectHorario(h)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all text-sm ${
                        form.turnoOriginalId === h.id
                          ? 'border-primary-500 bg-gray-800 ring-1 ring-primary-500'
                          : 'border-gray-700 hover:border-gray-600 bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-4 h-4 ${form.turnoOriginalId === h.id ? 'text-primary-400' : 'text-gray-500'}`} />
                        <span className={form.turnoOriginalId === h.id ? 'font-medium text-primary-200' : 'text-gray-400'}>{label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {form.turnoOriginalTexto && (
              <p className="text-xs text-primary-400 mt-1">Seleccionado: {form.turnoOriginalTexto}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1.5">
              <ArrowLeftRight className="w-4 h-4" /> Turno Propuesto
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Select
                id="diaPropuesto" label="Día"
                value={form.diaPropuesto}
                onChange={e => setForm(f => ({ ...f, diaPropuesto: e.target.value }))}
                options={DIAS_SEMANA.map(d => ({ value: String(d.id), label: d.nombre }))}
              />
              <Input id="horaInicioPropuesto" label="Hora inicio" type="time" value={form.horaInicioPropuesto} onChange={e => setForm(f => ({ ...f, horaInicioPropuesto: e.target.value }))} />
              <Input id="horaFinPropuesto" label="Hora fin" type="time" value={form.horaFinPropuesto} onChange={e => setForm(f => ({ ...f, horaFinPropuesto: e.target.value }))} />
            </div>
            {form.diaPropuesto && (
              <p className="text-xs text-gray-400 mt-1">
                Propuesto: {DIAS_SEMANA.find(d => d.id === Number(form.diaPropuesto))?.nombre} {form.horaInicioPropuesto}-{form.horaFinPropuesto}
              </p>
            )}
          </div>

          <Select
            id="reemplazante" label="Reemplazante (opcional)"
            value={form.reemplazanteId}
            onChange={e => setForm(f => ({ ...f, reemplazanteId: e.target.value }))}
            options={usuarios.filter(u => u.rolId === 'instructor' && u.id !== usuario?.id).map(u => ({ value: u.id, label: u.nombre }))}
            placeholder="Seleccionar compañero"
          />
          <Input id="motivo" label="Motivo (opcional)" value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button type="submit" disabled={!form.turnoOriginalTexto}>Enviar Solicitud</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}


