import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createUser, updateUser, getUserById } from '../../services/userService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', rolId: 'instructor', password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit && id) {
      getUserById(id).then(u => {
        if (u) setForm({ nombre: u.nombre, email: u.email, telefono: u.telefono, rolId: u.rolId, password: '' })
      })
    }
  }, [id, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit && id) {
        const updateData: any = { nombre: form.nombre, email: form.email, telefono: form.telefono, rolId: form.rolId }
        if (form.password) updateData.password = form.password
        await updateUser(id, updateData)
      } else {
        if (!form.password) { setError('La contraseña es requerida'); setLoading(false); return }
        await createUser({
          nombre: form.nombre, email: form.email, telefono: form.telefono,
          rolId: form.rolId, password: form.password, fotoURL: '',
        })
      }
      navigate('/usuarios')
    } catch (err) {
      setError('Error al guardar: ' + String(err))
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/usuarios"><Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>Volver</Button></Link>
        <h1 className="text-2xl font-bold text-gray-900">{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          <Input id="nombre" label="Nombre completo" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          <Input id="email" label="Correo electrónico" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input id="telefono" label="Teléfono" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
          <Select
            id="rolId"
            label="Rol"
            value={form.rolId}
            onChange={e => setForm(f => ({ ...f, rolId: e.target.value }))}
            options={[
              { value: 'admin', label: 'Administrador' },
              { value: 'instructor', label: 'Instructor' },
            ]}
          />
          <Input
            id="password"
            label={isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            type="password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
            required={!isEdit}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Link to="/usuarios"><Button variant="secondary" type="button">Cancelar</Button></Link>
            <Button type="submit" loading={loading}>{isEdit ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}


