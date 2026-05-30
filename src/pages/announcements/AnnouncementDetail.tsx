import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { getAnuncioById, marcarLeido, getLectoresAnuncio, getEstadisticasLectura } from '../../services/announcementService'
import { getAllUsers } from '../../services/userService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { ArrowLeft, CheckCheck, Users } from 'lucide-react'
import { formatDateTime } from '../../lib/utils'

export function AnnouncementDetail() {
  const { id } = useParams()
  const { usuario, isAdmin } = useAuthStore()
  const [anuncio, setAnuncio] = useState<any>(null)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [lectores, setLectores] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, leidos: 0, porcentaje: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !usuario) return
    const load = async () => {
      const anun = await getAnuncioById(id)
      setAnuncio(anun)
      await marcarLeido(id, usuario.id)
      const [lect, users, st] = await Promise.all([
        getLectoresAnuncio(id),
        getAllUsers(),
        getEstadisticasLectura(id),
      ])
      setLectores(lect)
      setUsuarios(users)
      setStats(st)
      setLoading(false)
    }
    load()
  }, [id, usuario])

  const userMap = new Map(usuarios.map(u => [u.id, u.nombre]))

  if (loading) return <div className="text-center py-10 text-gray-400">Cargando...</div>
  if (!anuncio) return <div className="text-center py-10 text-gray-500">Anuncio no encontrado</div>

  return (
    <div className="space-y-6 max-w-3xl">
      <Link to="/anuncios"><Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>Volver</Button></Link>
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{anuncio.titulo}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="success"><CheckCheck className="w-3 h-3 mr-1" /> Leído</Badge>
              <span className="text-sm text-gray-500">Por {userMap.get(anuncio.autorId) || 'Desconocido'}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-6">
          <span>Publicado: {formatDateTime(anuncio.fechaPublicacion)}</span>
          {anuncio.fechaExpiracion && <span>Expira: {formatDateTime(anuncio.fechaExpiracion)}</span>}
        </div>
        <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{anuncio.contenido}</div>
      </Card>

      {isAdmin() && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Reporte de Lecturas ({stats.leidos}/{stats.total} - {stats.porcentaje}%)
          </h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-green-500 h-2.5 rounded-full transition-all" style={{ width: `${stats.porcentaje}%` }} />
          </div>
          {lectores.length === 0 ? (
            <p className="text-sm text-gray-400">Nadie ha leído este anuncio aún</p>
          ) : (
            <div className="space-y-2">
              {lectores.map(l => (
                <div key={`${l.anuncioId}_${l.usuarioId}`} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                  <Avatar nombre={l.nombreUsuario || 'N/A'} size="sm" />
                  <div>
                    <p className="text-sm font-medium">{l.nombreUsuario || l.usuarioId}</p>
                    <p className="text-xs text-gray-400">{formatDateTime(l.fechaLectura)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  )
}


