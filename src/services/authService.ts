import { supabase } from '../lib/supabase'
import { db } from '../db/database'
import type { Usuario } from '../lib/types'

export async function login(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
}

export async function register(data: {
  nombre: string; email: string; telefono: string; password: string
}): Promise<void> {
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })
  if (signUpError) throw signUpError
  if (!authData.user) throw new Error('No se pudo crear el usuario. Verifica que la confirmación de email esté desactivada en Supabase.')

  const uid = authData.user.id

  const usuario: Usuario = {
    id: uid,
    nombre: data.nombre,
    email: data.email,
    telefono: data.telefono,
    rolId: 'admin',
  }

  // Save locally immediately so onAuthStateChange can find it
  await db.usuarios.put(usuario)

  // Sync to Supabase in background — never blocks registration
  supabase.from('usuarios').insert(usuario).then(({ error }) => {
    if (error) {
      import('./syncService').then(({ addToSyncQueue }) =>
        addToSyncQueue('usuarios', uid, 'INSERT', usuario)
      )
    }
  })

}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function onAuthChange(callback: (user: any) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}

export async function loadUserFromSupabase(uid: string): Promise<Usuario | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', uid)
    .single()
  if (error || !data) return null
  const user = data as Usuario
  await db.usuarios.put(user)
  return user
}
