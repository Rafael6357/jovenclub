import { create } from 'zustand'

interface Notification {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface NotificationState {
  notifications: Notification[]
  add: (message: string, type?: 'success' | 'error' | 'info') => void
  remove: (id: string) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  add: (message, type = 'success') => {
    const id = Date.now().toString()
    set(s => ({ notifications: [...s.notifications, { id, message, type }] }))
    setTimeout(() => {
      set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }))
    }, 4000)
  },
  remove: (id) => set(s => ({ notifications: s.notifications.filter(n => n.id !== id) })),
}))
