import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Eye, EyeOff, QrCode } from 'lucide-react'

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
      const msg = err instanceof Error ? err.message : ''
      const friendly =
        msg.includes('Invalid login credentials') ? 'Usuario o contraseña incorrectos. Intente de nuevo.' :
        msg.includes('Email not confirmed') ? 'Correo electrónico no confirmado. Revise su bandeja de entrada.' :
        msg.includes('User already registered') ? 'Ya existe una cuenta con ese correo electrónico.' :
        msg.includes('rate limit') ? 'Demasiados intentos. Espere un momento e intente de nuevo.' :
        msg.includes('network') || msg.includes('fetch') ? 'Error de conexión. Verifique su internet e intente de nuevo.' :
        msg.includes('timeout') ? 'La conexión tardó demasiado. Intente de nuevo.' :
        msg.includes('Invalid email') ? 'El formato del correo electrónico no es válido.' :
        'Ocurrió un error al iniciar sesión. Intente de nuevo.'
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
          <h1 className="text-2xl font-bold text-primary-200 drop-shadow-lg">COMUNICA-JC</h1>
          <p className="text-primary-300 mt-1 drop-shadow-md">Joven Club de Computación y Electrónica</p>
          <p className="text-primary-400 text-sm drop-shadow">San Luis, Santiago de Cuba</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-gray-800 rounded-xl shadow-xl shadow-black/30 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-100 text-center">Iniciar Sesión</h2>
          {error && <div className="bg-red-900/30 text-red-300 text-sm p-3 rounded-lg">{error}</div>}
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
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-3 py-2 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors pr-10 bg-gray-900 text-gray-100"
              />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" loading={loading} className="w-full">
            Entrar
          </Button>
          <div className="text-center text-sm text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary-400 hover:underline font-medium">Regístrate</Link>
          </div>
          <div className="pt-4 border-t border-gray-700 text-center">
            <Link to="/tablero" className="text-primary-400 hover:text-primary-300 text-sm flex items-center justify-center gap-1.5 transition-colors">
              <QrCode className="w-4 h-4" /> Entrar como invitado
            </Link>
          </div>
          <div className="text-xs text-gray-400 text-center mt-2">
            <p>Autenticación mediante Supabase</p>
          </div>
        </form>
      </div>
    </div>
  )
}

