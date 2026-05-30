import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Monitor, Eye, EyeOff } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const authLogin = useAuthStore(s => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authLogin(email, password)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Credenciales inválidas')
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
          <h2 className="text-lg font-semibold text-gray-900 text-center">Iniciar Sesión</h2>
          {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">{error}</div>}
          <Input
            id="email"
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="usuario@jcsanluis.cu"
            required
          />
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
          <Button type="submit" loading={loading} className="w-full">
            Entrar
          </Button>
          <div className="text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-600 hover:underline font-medium">Regístrate</Link>
          </div>
          <div className="text-xs text-gray-400 text-center mt-2">
            <p>Autenticación mediante Firebase</p>
          </div>
        </form>
      </div>
    </div>
  )
}

