import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { getAllRecursos, deleteRecurso } from '../../services/resourceService'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { Plus, Pencil, Trash2, Monitor } from 'lucide-react'

export function ResourceList() {
  const { isAdmin } = useAuthStore()
  const [recursos, setRecursos] = useState<any[]>([])
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const r = await getAllRecursos()
    setRecursos(r)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (deleteId) { await deleteRecurso(deleteId); setDeleteId(null); load() }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-100">Recursos</h1>
        {isAdmin() && (
          <Link to="/recursos/nuevo"><Button icon={<Plus className="w-4 h-4" />}>Nuevo Recurso</Button></Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando...</div>
      ) : recursos.length === 0 ? (
        <EmptyState icon={<Monitor className="w-12 h-12" />} title="No hay recursos" description="No se encontraron salas o equipos registrados" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recursos.map(r => (
            <Card key={r.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-100">{r.nombre}</h3>
                    <Badge variant={r.disponible ? 'success' : 'danger'}>
                      {r.disponible ? 'Disponible' : 'No disponible'}
                    </Badge>
                  </div>
                  <Badge variant="info" className="mb-2">{r.tipo}</Badge>
                  <p className="text-sm text-gray-400">{r.descripcion}</p>
                </div>
                {isAdmin() && (
                  <div className="flex gap-1">
                    <Link to={`/recursos/${r.id}/editar`}><Button variant="ghost" size="sm"><Pencil className="w-4 h-4" /></Button></Link>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(r.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar recurso" size="sm">
        <p className="text-gray-300 mb-4">¿Eliminar este recurso?</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}


