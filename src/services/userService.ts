import { db } from '../db/database'
import { supabase } from '../lib/supabase'
import type { Usuario } from '../lib/types'
import { generateId } from '../lib/utils'
import { addToSyncQueue } from './syncService'
import { useAuthStore } from '../stores/authStore'

export async function getAllUsers(): Promise<Usuario[]> {
  return db.usuarios.toArray()
}

export async function getUserById(id: string): Promise<Usuario | undefined> {
  return db.usuarios.get(id)
}

export async function getUserByEmail(email: string): Promise<Usuario | undefined> {
  return db.usuarios.where('email').equals(email).first()
}

export async function createUser(data: Omit<Usuario, 'id'> & { id?: string }): Promise<string> {
  const id = data.id ?? generateId()
  const user: Usuario = { ...data, id }
  await db.usuarios.add(user)
  await addToSyncQueue('usuarios', id, 'INSERT', user)
  return id
}

export async function updateUser(id: string, data: Partial<Usuario>): Promise<void> {
  await db.usuarios.update(id, data)
  await addToSyncQueue('usuarios', id, 'UPDATE', { ...data, id })
}

export async function deleteUser(id: string): Promise<void> {
  const currentUser = useAuthStore.getState().usuario
  if (currentUser && id === currentUser.id) {
    throw new Error('No puedes eliminarte a ti mismo')
  }

  // Eliminar datos relacionados en cascada
  const horarios = await db.horarios.where('usuarioId').equals(id).toArray()
  for (const h of horarios) {
    await db.horarios.delete(h.id)
    await addToSyncQueue('horarios', h.id, 'DELETE', { id: h.id })
  }

  const solicitudes = await db.solicitudesCambio
    .filter(s => s.solicitanteId === id || s.reemplazanteId === id)
    .toArray()
  for (const s of solicitudes) {
    await db.solicitudesCambio.delete(s.id)
    await addToSyncQueue('solicitudesCambio', s.id, 'DELETE', { id: s.id })
  }

  const reservas = await db.reservas.where('usuarioId').equals(id).toArray()
  for (const r of reservas) {
    await db.reservas.delete(r.id)
    await addToSyncQueue('reservas', r.id, 'DELETE', { id: r.id })
  }

  const lecturas = await db.lecturasAnuncio.where('usuarioId').equals(id).toArray()
  for (const l of lecturas) {
    await db.lecturasAnuncio.delete([l.anuncioId, l.usuarioId])
    await addToSyncQueue('lecturasAnuncio', `${l.anuncioId}_${l.usuarioId}`, 'DELETE', { anuncioId: l.anuncioId, usuarioId: l.usuarioId })
  }

  await db.usuarios.delete(id)
  await addToSyncQueue('usuarios', id, 'DELETE', { id })

  // Eliminar usuario de Supabase Auth (si hay conexión)
  try {
    await supabase.functions.invoke('delete-user', { body: { id } })
  } catch {
    await addToSyncQueue('_auth_user', id, 'DELETE', { id })
  }
}

export async function getUsersByRol(rolId: string): Promise<Usuario[]> {
  return db.usuarios.where('rolId').equals(rolId).toArray()
}

export async function searchUsers(query: string): Promise<Usuario[]> {
  const all = await db.usuarios.toArray()
  const q = query.toLowerCase()
  return all.filter(u =>
    u.nombre.toLowerCase().includes(q) ||
    u.email.toLowerCase().includes(q) ||
    u.telefono.includes(q)
  )
}
