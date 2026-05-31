import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { updateUser, getUserById } from '../../services/userService'
import { createAuthUser } from '../../services/adminService'
import { useAuthStore } from '../../stores/authStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Link } from 'react-router-dom'

export function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const currentUser = useAuthStore(s => s.usuario)
  const isEdit = !!id
  const isSelf = isEdit && currentUser?.id === id
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', rolId: 'instructor', password: '',
  })
  const [originalRolId, setOriginalRolId] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit && id) {
      getUserById(id).then(u => {
        if (u) { setForm(f => ({ ...f, nombre: u.nombre, email: u.email, telefono: u.telefono, rolId: u.rolId })); setOriginalRolId(u.rolId) }
      })
    }
  }, [id, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isEdit && id) {
        const updates: any = { nombre: form.nombre, email: form.email, telefono: form.telefono }
        if (!isSelf && originalRolId === 'admin') {
          updates.rolId = form.rolId
        } else if (!isSelf && originalRolId) {
          updates.rolId = originalRolId
        }
        await updateUser(id, updates)
      } else {
        if (!form.password) { setError('La contraseña es requerida'); setLoading(false); return }
        await createAuthUser({
          email: form.email, password: form.password,
          nombre: form.nombre, telefono: form.telefono, rolId: form.rolId,
        })
      }
      navigate('/usuarios')
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.includes('already registered')) {
        setError('Ya existe un usuario con ese correo electrónico.')
      } else if (msg.includes('password')) {
        setError('La contraseña debe tener al menos 6 caracteres.')
      } else {
        setError('Ocurrió un error al guardar el usuario. Intente de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link to="/usuarios"><Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>Volver</Button></Link>
        <h1 className="text-2xl font-bold text-gray-100">{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h1>
      </div>
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-900/30 text-red-300 text-sm p-3 rounded-lg">{error}</div>}
          <Input id="nombre" label="Nombre completo" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} required />
          <Input id="email" label="Correo electrónico" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          <Input id="telefono" label="Teléfono" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />
          {isSelf ? (
            <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded-lg">
              No puedes cambiar tu propio rol de administrador.
            </div>
          ) : isEdit && originalRolId === 'instructor' ? (
            <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded-lg">
              No puedes cambiar el rol de un instructor a administrador.
            </div>
          ) : (
            <Select
              id="rolId"
              label="Rol"
              value={form.rolId}
              onChange={e => setForm(f => ({ ...f, rolId: e.target.value }))}
              options={isEdit
                ? [
                    { value: 'admin', label: 'Administrador' },
                    { value: 'instructor', label: 'Instructor' },
                  ]
                : [
                    { value: 'instructor', label: 'Instructor' },
                  ]}
            />
          )}
          {isEdit ? (
            <div className="text-sm text-gray-300 bg-gray-900 p-3 rounded-lg">
              La contraseña no se puede cambiar desde aquí. El usuario debe iniciar sesión y cambiarla en su perfil.
            </div>
          ) : (
            <div className="w-full">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors pr-10 bg-gray-900 text-gray-100"
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Link to="/usuarios"><Button variant="secondary" type="button">Cancelar</Button></Link>
            <Button type="submit" loading={loading}>{isEdit ? 'Guardar Cambios' : 'Crear Usuario'}</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
