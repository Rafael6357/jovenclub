import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { db } from '../db/database'
import { login as authLogin, register as authRegister, logout as authLogout, loadUserFromSupabase } from '../services/authService'
import { initSupabaseSync } from '../services/syncService'
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
    // Safety timeout — 5s max loading screen
    const timeout = setTimeout(() => set({ loading: false }), 5000)

    // 1) Try to recover existing session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { clearTimeout(timeout); set({ loading: false }); return }
      resolveSession(session.user.id)
    }).catch(() => { clearTimeout(timeout); set({ loading: false }) })

    // 2) Subscribe to future auth events (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      clearTimeout(timeout)
      if (session?.user) {
        resolveSession(session.user.id)
      } else {
        set({ usuario: null, isAuthenticated: false, loading: false })
      }
    })

    async function resolveSession(uid: string) {
      try {
        let user: Usuario | null = (await db.usuarios.get(uid)) ?? null
        if (!user) {
          // Retry once — da tiempo a que adminService guarde el usuario localmente
          await new Promise(r => setTimeout(r, 300))
          user = (await db.usuarios.get(uid)) ?? null
        }
        if (!user) user = await loadUserFromSupabase(uid)
        if (user) {
          set({ usuario: user, isAuthenticated: true, loading: false })
          initSupabaseSync().catch(() => {})
          return
        }
      } catch {}
      set({ usuario: null, isAuthenticated: false, loading: false })
    }

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
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
