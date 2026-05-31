import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllUsers, deleteUser } from '../../services/userService'
import { useAuthStore } from '../../stores/authStore'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Avatar } from '../../components/ui/Avatar'
import { Modal } from '../../components/ui/Modal'
import { Input } from '../../components/ui/Input'
import { EmptyState } from '../../components/ui/EmptyState'
import { Plus, Pencil, Trash2, Search, Users } from 'lucide-react'

export function UserList() {
  const currentUser = useAuthStore(s => s.usuario)
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [deleteModal, setDeleteModal] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteError, setDeleteError] = useState('')

  const load = async () => {
    const all = await getAllUsers()
    setUsers(all)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async () => {
    if (!deleteModal) return
    if (currentUser && deleteModal === currentUser.id) {
      setDeleteError('No puedes eliminarte a ti mismo')
      return
    }
    setDeleteError('')
    try {
      await deleteUser(deleteModal)
      setDeleteModal(null)
      load()
    } catch (err: any) {
      setDeleteError(err?.message || 'Error al eliminar usuario')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-100">Gestión de Usuarios</h1>
        <Link to="/usuarios/nuevo">
          <Button icon={<Plus className="w-4 h-4" />}>Nuevo Usuario</Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2 bg-gray-900 text-gray-100 border border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users className="w-12 h-12" />} title="No hay usuarios" description="Crea el primer usuario del sistema" />
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-900 text-gray-300 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Rol</th>
                  <th className="text-left px-4 py-3 font-medium">Teléfono</th>
                  <th className="text-right px-4 py-3 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-700">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.nombre} size="sm" />
                        <span className="font-medium">{u.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.rolId === 'admin' ? 'info' : 'default'}>
                        {u.rolId === 'admin' ? 'Administrador' : 'Instructor'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{u.telefono}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/usuarios/${u.id}/editar`}>
                          <Button variant="ghost" size="sm" icon={<Pencil className="w-4 h-4" />}>Editar</Button>
                        </Link>
                        {currentUser && u.id !== currentUser.id && (
                          <Button variant="ghost" size="sm" icon={<Trash2 className="w-4 h-4 text-red-400" />} onClick={() => { setDeleteError(''); setDeleteModal(u.id) }} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Modal open={!!deleteModal} onClose={() => { setDeleteError(''); setDeleteModal(null) }} title="Confirmar eliminación" size="sm">
        <p className="text-gray-300 mb-4">¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.</p>
        {deleteError && <p className="text-red-400 text-sm mb-4">{deleteError}</p>}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => { setDeleteError(''); setDeleteModal(null) }}>Cancelar</Button>
          <Button variant="danger" onClick={handleDelete}>Eliminar</Button>
        </div>
      </Modal>
    </div>
  )
}


