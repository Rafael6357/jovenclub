import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { db } from '../../db/database'
import { useNavigate } from 'react-router-dom'
import { updateUser } from '../../services/userService'
import { procesarCola, getColaCount, clearSyncQueue } from '../../services/syncService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { BRAND } from '../../lib/constants'
import { Modal } from '../../components/ui/Modal'
import { Settings as SettingsIcon, RefreshCw, Trash2, User, QrCode } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'
import { useLiveQuery } from '../../hooks/useLiveQuery'
import QRCode from 'qrcode'

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
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    const url = `${window.location.origin}/tablero`
    QRCode.toDataURL(url, { width: 250, margin: 2, color: { dark: '#e5e7eb', light: '#1f2937' } }).then(setQrDataUrl)
  }, [])

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
    setShowClearConfirm(false)
    setMsg('Cola de sincronización limpiada')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-100">Configuración</h1>

      {msg && (
        <div className="bg-green-900/30 text-green-300 text-sm p-3 rounded-lg flex items-center justify-between">
          {msg}
          <button onClick={() => setMsg('')} className="text-green-400 hover:text-green-200">✕</button>
        </div>
      )}

      <Card>
        <h3 className="font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <User className="w-4 h-4" /> Mi Perfil
        </h3>
        <div className="space-y-4">
          <Input id="nombre" label="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
          <Input id="telefono" label="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />
          <Input id="email" label="Correo electrónico" value={usuario?.email || ''} disabled />
          <Badge variant={usuario?.rolId === 'admin' ? 'info' : 'default'}>
            {usuario?.rolId === 'admin' ? 'Administrador' : 'Instructor'}
          </Badge>
          <Button onClick={handleSave} loading={loading}>Guardar Cambios</Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <SettingsIcon className="w-4 h-4" /> Sincronización
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">Estado:</span>
            <Badge variant={isOnline ? 'success' : 'danger'}>
              {isOnline ? 'Conectado' : 'Sin conexión'}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-300">Cambios pendientes:</span>
            <Badge variant={colaCount > 0 ? 'warning' : 'default'}>{colaCount}</Badge>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSync} loading={syncing} icon={<RefreshCw className="w-4 h-4" />} variant="secondary">
              Sincronizar ahora
            </Button>
            {isAdmin() && (
              <Button onClick={() => setShowClearConfirm(true)} icon={<Trash2 className="w-4 h-4" />} variant="ghost">
                Limpiar cola
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <QrCode className="w-4 h-4" /> Tablero Público
        </h3>
        <div className="space-y-3">
          <p className="text-sm text-gray-300">
            Escanee este código QR con su teléfono para ver los anuncios, horarios del personal y reservas disponibles.
          </p>
          <div className="flex justify-center">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="QR Tablero Público" className="rounded-lg" />
            ) : (
              <div className="w-[250px] h-[250px] bg-gray-800 rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Generando QR...</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 text-center break-all">
            {window.location.origin}/tablero
          </p>
          <Button
            variant="secondary"
            onClick={() => window.open('/tablero', '_blank')}
          >
            Abrir tablero público
          </Button>
        </div>
      </Card>

      <Modal open={showClearConfirm} onClose={() => setShowClearConfirm(false)} title="Limpiar cola de sincronización" size="sm">
        <p className="text-gray-300 mb-4">¿Estás seguro de limpiar la cola? Los cambios pendientes no se enviarán a la nube y se perderán.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowClearConfirm(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleClearQueue}>Limpiar</Button>
        </div>
      </Modal>

      <Card>
        <h3 className="font-semibold text-gray-100 mb-2">Acerca de</h3>
        <div className="text-sm text-gray-300 space-y-1">
          <p><strong>{BRAND.name}</strong> v{BRAND.version}</p>
          <p>{BRAND.fullName} de {BRAND.location}</p>
          <p>Santiago de Cuba</p>
          <p className="text-xs text-gray-400 mt-2">Aplicación web con arquitectura offline-first</p>
        </div>
      </Card>
    </div>
  )
}



