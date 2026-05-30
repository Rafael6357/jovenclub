import { db } from '../db/database'
import type { Usuario } from '../lib/types'
import { generateId, nowISO } from '../lib/utils'
import { addToSyncQueue } from './syncService'

export async function getAllUsers(): Promise<Usuario[]> {
  return db.usuarios.toArray()
}

export async function getUserById(id: string): Promise<Usuario | undefined> {
  return db.usuarios.get(id)
}

export async function getUserByEmail(email: string): Promise<Usuario | undefined> {
  return db.usuarios.where('email').equals(email).first()
}

export async function createUser(data: Omit<Usuario, 'id'>): Promise<string> {
  const id = generateId()
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
  await db.usuarios.delete(id)
  await addToSyncQueue('usuarios', id, 'DELETE', { id })
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
