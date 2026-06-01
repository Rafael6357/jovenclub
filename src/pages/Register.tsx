import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { PasswordInput } from '../components/ui/PasswordInput'
import { BRAND } from '../lib/constants'

export function Register() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const authRegister = useAuthStore(s => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Las contraseñas no coinciden'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true)
    try {
      await authRegister({ nombre, email, telefono, password })
      navigate('/')
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      const friendly =
        msg.includes('User already registered') ? 'Ya existe una cuenta con ese correo electrónico.' :
        msg.includes('Invalid login credentials') ? 'Correo o contraseña inválidos.' :
        msg.includes('Email not confirmed') ? 'Correo electrónico no confirmado. Revise su bandeja de entrada.' :
        msg.includes('rate limit') ? 'Demasiados intentos. Espere un momento e intente de nuevo.' :
        msg.includes('network') || msg.includes('fetch') ? 'Error de conexión. Verifique su internet e intente de nuevo.' :
        msg.includes('timeout') ? 'La conexión tardó demasiado. Intente de nuevo.' :
        msg.includes('Invalid email') ? 'El formato del correo electrónico no es válido.' :
        msg.includes('password') ? 'La contraseña debe tener al menos 6 caracteres.' :
        `Error: ${msg}`
      setError(friendly)
    } finally {
      setLoading(false)
    }
  }

  const bgUrl = 'https://npdsdfjzftyhlqhyspko.supabase.co/storage/v1/object/sign/images%20jovenclub/photo_2026-05-30_18-30-00.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9hYjQ1OTkwOS1hYzRhLTQ5ZGYtODM0NC05YTIwN2FmNTM1MzgiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMgam92ZW5jbHViL3Bob3RvXzIwMjYtMDUtMzBfMTgtMzAtMDAuanBnIiwiaWF0IjoxNzgwMTgwMzgyLCJleHAiOjQ5MDIyNDQzODJ9.wQrJFUNsdHo3pxYmZiUCCfjkbsorsY8_9hx5hkZ9QKQ'

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-primary-900"
      style={{ backgroundImage: `url(${bgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/80 via-black/60 to-black/70 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-2xl mx-auto mb-4 shadow-lg overflow-hidden">
            <img src={bgUrl} alt="Joven Club" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-primary-200 drop-shadow-lg">{BRAND.name}</h1>
          <p className="text-primary-300 mt-1 drop-shadow-md">{BRAND.fullName}</p>
          <p className="text-primary-400 text-sm drop-shadow">{BRAND.location}, Santiago de Cuba</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-xl shadow-black/30 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100 text-center">Crear Cuenta</h2>
          <p className="text-xs text-gray-400 text-center">Se registrará como <strong>Administrador</strong> del sistema</p>
          {error && <div className="bg-red-900/30 text-red-300 text-sm p-3 rounded-lg">{error}</div>}
          <Input id="nombre" label="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} required />
          <Input id="email" label="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input id="telefono" label="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} required />
          <PasswordInput
            id="password"
            label="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <PasswordInput
            id="confirm"
            label="Confirmar contraseña"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />
          <Button type="submit" loading={loading} className="w-full">Registrarse</Button>
          <div className="text-center text-sm text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-400 hover:underline font-medium">Inicia Sesión</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
