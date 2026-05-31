import { supabase } from '../lib/supabase'
import { db } from '../db/database'
import type { Usuario } from '../lib/types'

export async function createAuthUser(data: {
  email: string
  password: string
  nombre: string
  telefono: string
  rolId: string
}): Promise<{ id: string }> {
  // Usar Edge Function create-user (usa service_role, no cambia la sesión actual)
  const { data: result, error } = await supabase.functions.invoke('create-user', {
    body: { email: data.email, password: data.password, nombre: data.nombre, telefono: data.telefono, rolId: 'instructor' },
  })
  if (error) throw new Error(error.message)

  const uid = result.id

  const usuario: Usuario = { id: uid, nombre: data.nombre, email: data.email, telefono: data.telefono, rolId: 'instructor' }
  await db.usuarios.put(usuario)

  return { id: uid }
}
