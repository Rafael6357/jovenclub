import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { getAllAnuncios, deleteAnuncio } from '../../services/announcementService'
import { getAllUsers } from '../../services/userService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDateTime } from '../../lib/utils'
import { Plus, Pencil, Trash2, Megaphone, ChevronRight } from 'lucide-react'

export function AnnouncementList() {
  const { usuario, isAdmin } = useAuthStore()
  const [anuncios, setAnuncios] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const [anun, users] = await Promise.all([getAllAnuncios(), getAllUsers()])
    setAnuncios(anun)
    setUsuarios(users)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const userMap = new Map(usuarios.map(u => [u.id, u.nombre]))

  const handleDelete = async () => {
    if (deleteId) { await deleteAnuncio(deleteId); setDeleteId(null); load() }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Anuncios Oficiales</h1>
        {isAdmin() && (
          <Link to="/anuncios/nuevo">
            <Button icon={<Plus className="w-4 h-4" />}>Publicar Anuncio</Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando...</div>
      ) : anuncios.length === 0 ? (
        <EmptyState icon={<Megaphone className="w-12 h-12" />} title="No hay anuncios" description="No se han publicado anuncios aún" />
      ) : (
        <div className="space-y-3">
          {anuncios.map(a => (
            <Link key={a.id} to={`/anuncios/${a.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{a.titulo}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.contenido}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">Por {userMap.get(a.autorId) || 'Desconocido'}</span>
                      <span className="text-xs text-gray-400">{formatDateTime(a.fechaPublicacion)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {isAdmin() && (
                      <>
                        <Link to={`/anuncios/${a.id}/editar`} onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="sm"><Pencil className="w-4 h-4" /></Button>
                        </Link>
                        <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); setDeleteId(a.id) }}>
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar anuncio" size="sm">
        <p className="text-gray-600 mb-4">¿Eliminar este anuncio? No se podrá recuperar.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}


