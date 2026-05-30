import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { db } from '../../db/database'
import { useNavigate } from 'react-router-dom'
import { updateUser } from '../../services/userService'
import { procesarCola, getColaCount, clearSyncQueue } from '../../services/syncService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Settings as SettingsIcon, RefreshCw, Trash2, User } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useLiveQuery } from '../../hooks/useLiveQuery'

export function Settings() {
  const { usuario, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const isOnline = useOnlineStatus()
  const colaCount = useLiveQuery(() => getColaCount(), []) ?? 0
  const [nombre, setNombre] = useState(usuario?.nombre || '')
  const [telefono, setTelefono] = useState(usuario?.telefono || '')
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [msg, setMsg] = useState('')

  const handleSave = async () => {
    if (!usuario) return
    setLoading(true)
    await updateUser(usuario.id, { nombre, telefono })
    const updated = await db.usuarios.get(usuario.id)
    if (updated) useAuthStore.setState({ usuario: updated })
    setMsg('Perfil actualizado correctamente')
    setLoading(false)
  }

  const handleSync = async () => {
    setSyncing(true)
    const procesados = await procesarCola()
    setMsg(`Sincronización completada: ${procesados} cambios procesados`)
    setSyncing(false)
  }

  const handleClearQueue = async () => {
    await clearSyncQueue()
    setMsg('Cola de sincronización limpiada')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>

      {msg && (
        <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg flex items-center justify-between">
          {msg}
          <button onClick={() => setMsg('')} className="text-green-500 hover:text-green-700">✕</button>
        </div>
      )}

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Mi Perfil
        </h3>
        <div className="space-y-4">
          <Input id="nombre" label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
          <Input id="telefono" label="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />
          <Input id="email" label="Email" value={usuario?.email || ''} disabled />
          <Badge variant={usuario?.rolId === 'admin' ? 'info' : 'default'}>
            {usuario?.rolId === 'admin' ? 'Administrador' : 'Instructor'}
          </Badge>
          <Button onClick={handleSave} loading={loading}>Guardar Cambios</Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4" /> Sincronización
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Estado:</span>
            <Badge variant={isOnline ? 'success' : 'danger'}>
              {isOnline ? 'Conectado' : 'Sin conexión'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600">Cambios pendientes:</span>
            <Badge variant={colaCount > 0 ? 'warning' : 'default'}>{colaCount}</Badge>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSync} loading={syncing} icon={<RefreshCw className="w-4 h-4" />} variant="secondary">
              Sincronizar ahora
            </Button>
            {isAdmin() && (
              <Button onClick={handleClearQueue} icon={<Trash2 className="w-4 h-4" />} variant="ghost">
                Limpiar cola
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-900 mb-2">Acerca de</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>COMUNICA-JC</strong> v1.0.0</p>
          <p>Joven Club de Computación y Electrónica de San Luis</p>
          <p>Santiago de Cuba</p>
          <p className="text-xs text-gray-400 mt-2">Aplicación web con arquitectura offline-first</p>
        </div>
      </Card>
    </div>
  )
}



