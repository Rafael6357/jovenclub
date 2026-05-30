import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createRecurso, updateRecurso, getRecursoById } from '../../services/resourceService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Textarea } from '../../components/ui/Textarea'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TIPOS_RECURSO } from '../../lib/constants'

export function ResourceForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState({ nombre: '', tipo: 'Sala', descripcion: '', disponible: true })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit && id) {
      getRecursoById(id).then(r => {
        if (r) setForm({ nombre: r.nombre, tipo: r.tipo, descripcion: r.descripcion, disponible: r.disponible })
      })
    }
  }, [id, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    if (isEdit && id) { await updateRecurso(id, form) }
    else { await createRecurso(form) }
    navigate('/recursos')
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/recursos"><Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>Volver</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Recurso' : 'Nuevo Recurso'}</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="nombre" label="Nombre" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          <Select id="tipo" label="Tipo" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} options={TIPOS_RECURSO.map(t => ({ value: t, label: t }))} />
          <Textarea id="descripcion" label="Descripción" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={form.disponible} onChange={e => setForm(f => ({ ...f, disponible: e.target.checked }))} className="rounded" />
            Disponible
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Link to="/recursos"><Button variant="secondary" type="button">Cancelar</Button></Link>
            <Button type="submit" loading={loading}>{isEdit ? 'Guardar' : 'Crear'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


