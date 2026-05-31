import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { createReserva, validarOverlapReserva } from '../../services/bookingService'
import { getAllRecursos } from '../../services/resourceService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function BookingForm() {
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const [recursos, setRecursos] = useState<any[]>([])
  const [form, setForm] = useState({
    recursoId: '', tituloEvento: '', descripcion: '', fechaInicio: '', fechaFin: '', asistentes: '1',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAllRecursos().then(r => setRecursos(r.filter(x => x.disponible)))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const overlap = await validarOverlapReserva(form.recursoId, form.fechaInicio, form.fechaFin)
    if (overlap) {
      setError(`Conflicto: recurso ya reservado de ${overlap.fechaInicio.split('T')[1]?.slice(0, 5)} a ${overlap.fechaFin.split('T')[1]?.slice(0, 5)}`)
      setLoading(false)
      return
    }
    await createReserva({
      recursoId: form.recursoId,
      usuarioId: usuario!.id,
      tituloEvento: form.tituloEvento,
      fechaInicio: form.fechaInicio,
      fechaFin: form.fechaFin,
      asistentes: Number(form.asistentes),
    })
    navigate('/reservas')
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/reservas"><Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>Volver</Button></Link>
        <h1 className="text-2xl font-bold text-gray-100">Nueva Reserva</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-900/30 text-red-300 text-sm p-3 rounded-lg">{error}</div>}
          <Select
            id="recursoId" label="Recurso"
            value={form.recursoId}
            onChange={e => setForm(f => ({ ...f, recursoId: e.target.value }))}
            options={recursos.map(r => ({ value: r.id, label: `${r.nombre} (${r.tipo})` }))}
            placeholder="Seleccionar recurso"
            required
          />
          <Input id="tituloEvento" label="Título del evento" value={form.tituloEvento} onChange={e => setForm(f => ({ ...f, tituloEvento: e.target.value }))} required />
          <Textarea id="descripcion" label="Descripción" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="fechaInicio" label="Fecha y hora inicio" type="datetime-local" value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} required />
            <Input id="fechaFin" label="Fecha y hora fin" type="datetime-local" value={form.fechaFin} onChange={e => setForm(f => ({ ...f, fechaFin: e.target.value }))} required />
          </div>
          <Input id="asistentes" label="Número de asistentes" type="number" min="1" value={form.asistentes} onChange={e => setForm(f => ({ ...f, asistentes: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-4">
            <Link to="/reservas"><Button variant="secondary" type="button">Cancelar</Button></Link>
            <Button type="submit" loading={loading}>Crear Reserva</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


