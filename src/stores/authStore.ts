import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { db } from '../db/database'
import { initFirestoreListener } from '../services/syncService'
import { login as authLogin, register as authRegister, logout as authLogout, loadUserFromFirestore } from '../services/authService'
import type { Usuario } from '../lib/types'

interface AuthState {
  usuario: Usuario | null
  isAuthenticated: boolean
  loading: boolean
  init: () => () => void
  login: (email: string, password: string) => Promise<void>
  register: (data: { nombre: string; email: string; telefono: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  usuario: null,
  isAuthenticated: false,
  loading: true,

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let user: Usuario | null = (await db.usuarios.get(firebaseUser.uid)) ?? null
        if (!user) {
          user = await loadUserFromFirestore(firebaseUser.uid)
        }
        if (user) {
          set({ usuario: user, isAuthenticated: true, loading: false })
          initFirestoreListener().catch(() => {})
        } else {
          set({ usuario: null, isAuthenticated: false, loading: false })
        }
      } else {
        set({ usuario: null, isAuthenticated: false, loading: false })
      }
    })
    return unsubscribe
  },

  login: async (email: string, password: string) => {
    await authLogin(email, password)
  },

  register: async (data) => {
    await authRegister(data)
  },

  logout: async () => {
    await authLogout()
  },

  isAdmin: () => get().usuario?.rolId === 'admin',
}))
