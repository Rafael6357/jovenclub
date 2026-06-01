import { useNotificationStore } from '../../stores/notificationStore'
import { X } from 'lucide-react'

export function Toast() {
  const { notifications, remove } = useNotificationStore()
  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      {notifications.map(n => (
        <div
          key={n.id}
          className={`flex items-start gap-2 p-3 rounded-lg shadow-lg text-sm animate-slide-in ${
            n.type === 'success' ? 'bg-green-900/90 text-green-200 border border-green-700' :
            n.type === 'error' ? 'bg-red-900/90 text-red-200 border border-red-700' :
            'bg-blue-900/90 text-blue-200 border border-blue-700'
          }`}
        >
          <span className="flex-1">{n.message}</span>
          <button onClick={() => remove(n.id)} className="opacity-60 hover:opacity-100 shrink-0 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white" aria-label="Cerrar notificación">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
