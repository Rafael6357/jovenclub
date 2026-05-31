import { useState, useEffect } from 'react'
import { getAllUsers } from '../../services/userService'
import { Card } from '../../components/ui/Card'
import { Avatar } from '../../components/ui/Avatar'
import { Badge } from '../../components/ui/Badge'
import { EmptyState } from '../../components/ui/EmptyState'
import { Search, BookUser, Phone, Mail } from 'lucide-react'

export function PersonnelDirectory() {
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterRol, setFilterRol] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAllUsers().then(u => { setUsers(u); setLoading(false) })
  }, [])

  const filtered = users.filter(u => {
    const matchSearch = u.nombre.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRol = !filterRol || u.rolId === filterRol
    return matchSearch && matchRol
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-100">Directorio del Personal</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text" placeholder="Buscar por nombre o email..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-100 focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <select value={filterRol} onChange={e => setFilterRol(e.target.value)} className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-900 text-gray-100">
          <option value="">Todos los roles</option>
          <option value="admin">Administrador</option>
          <option value="instructor">Instructor</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<BookUser className="w-12 h-12" />} title="No hay personal" description="No se encontraron miembros del personal" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(u => (
            <Card key={u.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <Avatar name={u.nombre} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-100 truncate">{u.nombre}</h3>
                    <Badge variant={u.rolId === 'admin' ? 'info' : 'default'}>
                      {u.rolId === 'admin' ? 'Administrador' : 'Instructor'}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-400">
                    <div className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /><span className="truncate">{u.email}</span></div>
                    {u.telefono && <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /><span>{u.telefono}</span></div>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}


