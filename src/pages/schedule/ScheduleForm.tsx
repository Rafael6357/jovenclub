import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createHorario, updateHorario, getHorarioById, validarOverlap } from '../../services/scheduleService'
import { getAllUsers } from '../../services/userService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DIAS_SEMANA, SEDES } from '../../lib/constants'

export function ScheduleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [form, setForm] = useState({
    usuarioId: '', diaSemana: '1', horaInicio: '08:00', horaFin: '16:00',
    validoDesde: new Date().toISOString().split('T')[0],
    validoHasta: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
    sede: SEDES[0],
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const users = await getAllUsers()
      setUsuarios(users)
      if (isEdit && id) {
        const horario = await getHorarioById(id)
        if (horario) setForm({
          usuarioId: horario.usuarioId,
          diaSemana: String(horario.diaSemana),
          horaInicio: horario.horaInicio,
          horaFin: horario.horaFin,
          validoDesde: horario.validoDesde,
          validoHasta: horario.validoHasta,
          sede: horario.sede || SEDES[0],
        })
      }
    }
    init()
  }, [id, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const overlap = await validarOverlap({
      ...(isEdit && id ? { id } : {}),
      ...form, diaSemana: Number(form.diaSemana),
    })
    if (overlap) {
      setError(`Conflicto: ya existe un turno el día ${DIAS_SEMANA.find(d => d.id === overlap.diaSemana)?.nombre} de ${overlap.horaInicio} a ${overlap.horaFin}`)
      setLoading(false)
      return
    }
    if (isEdit && id) {
      await updateHorario(id, { ...form, diaSemana: Number(form.diaSemana) })
    } else {
      await createHorario({ ...form, diaSemana: Number(form.diaSemana) })
    }
    navigate('/horarios')
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/horarios"><Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>Volver</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Horario' : 'Asignar Horario'}</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          <Select
            id="usuarioId" label="Instructor"
            value={form.usuarioId}
            onChange={e => setForm(f => ({ ...f, usuarioId: e.target.value }))}
            options={usuarios.filter(u => u.rolId === 'instructor').map(u => ({ value: u.id, label: u.nombre }))}
            placeholder="Seleccionar instructor"
            required
          />
          <Select
            id="diaSemana" label="Día de la semana"
            value={form.diaSemana}
            onChange={e => setForm(f => ({ ...f, diaSemana: e.target.value }))}
            options={DIAS_SEMANA.map(d => ({ value: String(d.id), label: d.nombre }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input id="horaInicio" label="Hora inicio" type="time" value={form.horaInicio} onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))} />
            <Input id="horaFin" label="Hora fin" type="time" value={form.horaFin} onChange={e => setForm(f => ({ ...f, horaFin: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input id="validoDesde" label="Válido desde" type="date" value={form.validoDesde} onChange={e => setForm(f => ({ ...f, validoDesde: e.target.value }))} />
            <Input id="validoHasta" label="Válido hasta" type="date" value={form.validoHasta} onChange={e => setForm(f => ({ ...f, validoHasta: e.target.value }))} />
          </div>
          <Select
            id="sede" label="Sede"
            value={form.sede}
            onChange={e => setForm(f => ({ ...f, sede: e.target.value }))}
            options={SEDES.map(s => ({ value: s, label: s }))}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Link to="/horarios"><Button variant="secondary" type="button">Cancelar</Button></Link>
            <Button type="submit" loading={loading}>{isEdit ? 'Guardar Cambios' : 'Asignar Horario'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


