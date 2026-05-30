import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Monitor, Eye, EyeOff } from 'lucide-react'

export function Register() {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [telefono, setTelefono] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
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
      setError(err instanceof Error ? err.message : 'Error al registrarse')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-800 to-primary-600 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Monitor className="w-10 h-10 text-primary-800" />
          </div>
          <h1 className="text-2xl font-bold text-white">COMUNICA-JC</h1>
          <p className="text-primary-200 mt-1">Joven Club de Computación y Electrónica</p>
          <p className="text-primary-300 text-sm">San Luis, Santiago de Cuba</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 text-center">Crear Cuenta</h2>
          <p className="text-xs text-gray-500 text-center">Se registrará como <strong>Administrador</strong> del sistema</p>
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          <Input id="nombre" label="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} required />
          <Input id="email" label="Correo electrónico" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <Input id="telefono" label="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />
          <div className="w-full">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors pr-10"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="w-full">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors pr-10"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full">Registrarse</Button>
          <div className="text-center text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 hover:underline font-medium">Inicia Sesión</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
