import { useState, useEffect } from 'react'
import { db } from '../../db/database'

export function SyncIndicator() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const load = async () => {
      const c = await db.colaSincronizacion.count()
      setCount(c)
    }
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [])

  const isOnline = navigator.onLine

  if (!isOnline) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
        <span className="w-2 h-2 rounded-full bg-gray-400" />
        Sin conexión
      </span>
    )
  }

  if (count > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-600">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        {count} pendiente{count > 1 ? 's' : ''}
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-green-600">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      Sincronizado
    </span>
  )
}
