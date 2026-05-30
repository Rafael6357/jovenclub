import { db } from '../db/database'
import type { Recurso } from '../lib/types'
import { generateId } from '../lib/utils'
import { addToSyncQueue } from './syncService'

export async function getAllRecursos(): Promise<Recurso[]> {
  return db.recursos.toArray()
}

export async function getRecursosDisponibles(): Promise<Recurso[]> {
  return db.recursos.where('disponible').equals(1).toArray()
}

export async function getRecursoById(id: string): Promise<Recurso | undefined> {
  return db.recursos.get(id)
}

export async function createRecurso(data: Omit<Recurso, 'id'>): Promise<string> {
  const id = generateId()
  const recurso: Recurso = { ...data, id }
  await db.recursos.add(recurso)
  await addToSyncQueue('recursos', id, 'INSERT', recurso)
  return id
}

export async function updateRecurso(id: string, data: Partial<Recurso>): Promise<void> {
  await db.recursos.update(id, data)
  await addToSyncQueue('recursos', id, 'UPDATE', { ...data, id })
}

export async function deleteRecurso(id: string): Promise<void> {
  await db.recursos.delete(id)
  await addToSyncQueue('recursos', id, 'DELETE', { id })
}
