import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createAnuncio, updateAnuncio, getAnuncioById } from '../../services/announcementService'
import { useAuthStore } from '../../stores/authStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Textarea } from '../../components/ui/Textarea'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { nowISO } from '../../lib/utils'
import { useEffect } from 'react'

export function AnnouncementForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuthStore()
  const isEdit = !!id
  const [form, setForm] = useState({
    titulo: '', contenido: '', fechaExpiracion: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit && id) {
      getAnuncioById(id).then(a => {
        if (a) setForm({ titulo: a.titulo, contenido: a.contenido, fechaExpiracion: a.fechaExpiracion.split('T')[0] })
      })
    }
  }, [id, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit && id) {
        await updateAnuncio(id, { ...form, fechaExpiracion: form.fechaExpiracion + 'T23:59:59' })
      } else {
        await createAnuncio({
          ...form,
          fechaExpiracion: form.fechaExpiracion ? form.fechaExpiracion + 'T23:59:59' : new Date(Date.now() + 30 * 86400000).toISOString(),
          autorId: usuario!.id,
        })
      }
      navigate('/anuncios')
    } catch (err) {
      setError('Error al guardar: ' + String(err))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/anuncios"><Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>Volver</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Anuncio' : 'Publicar Anuncio'}</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          <Input id="titulo" label="Título del anuncio" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} required />
          <Textarea id="contenido" label="Contenido" value={form.contenido} onChange={e => setForm(f => ({ ...f, contenido: e.target.value }))} required />
          <Input id="fechaExpiracion" label="Fecha de expiración" type="date" value={form.fechaExpiracion} onChange={e => setForm(f => ({ ...f, fechaExpiracion: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-4">
            <Link to="/anuncios"><Button variant="secondary" type="button">Cancelar</Button></Link>
            <Button type="submit" loading={loading}>{isEdit ? 'Guardar Cambios' : 'Publicar'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


