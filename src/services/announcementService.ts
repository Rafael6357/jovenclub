import { db } from '../db/database'
import type { Anuncio, Adjunto, LecturaAnuncio } from '../lib/types'
import { generateId, nowISO } from '../lib/utils'
import { addToSyncQueue } from './syncService'

export async function getAllAnuncios(): Promise<Anuncio[]> {
  return db.anuncios.orderBy('fechaPublicacion').reverse().toArray()
}

export async function getAnunciosVigentes(): Promise<Anuncio[]> {
  const now = nowISO()
  return db.anuncios.where('fechaExpiracion').above(now).reverse().sortBy('fechaPublicacion')
}

export async function getAnuncioById(id: string): Promise<Anuncio | undefined> {
  return db.anuncios.get(id)
}

export async function createAnuncio(data: Omit<Anuncio, 'id' | 'fechaPublicacion'>): Promise<string> {
  const id = generateId()
  const anuncio: Anuncio = { ...data, id, fechaPublicacion: nowISO() }
  await db.anuncios.add(anuncio)
  await addToSyncQueue('anuncios', id, 'INSERT', anuncio)
  return id
}

export async function updateAnuncio(id: string, data: Partial<Anuncio>): Promise<void> {
  await db.anuncios.update(id, data)
  await addToSyncQueue('anuncios', id, 'UPDATE', { ...data, id })
}

export async function deleteAnuncio(id: string): Promise<void> {
  await db.adjuntos.where('anuncioId').equals(id).delete()
  await db.lecturasAnuncio.where('anuncioId').equals(id).delete()
  await db.anuncios.delete(id)
  await addToSyncQueue('anuncios', id, 'DELETE', { id })
}

export async function marcarLeido(anuncioId: string, usuarioId: string): Promise<void> {
  const existing = await db.lecturasAnuncio.get([anuncioId, usuarioId])
  if (!existing) {
    const lectura: LecturaAnuncio = { anuncioId, usuarioId, fechaLectura: nowISO() }
    await db.lecturasAnuncio.add(lectura)
    await addToSyncQueue('lecturasAnuncio', `${anuncioId}_${usuarioId}`, 'INSERT', lectura)
  }
}

export async function getLectoresAnuncio(anuncioId: string): Promise<LecturaAnuncio[]> {
  return db.lecturasAnuncio.where('anuncioId').equals(anuncioId).toArray()
}

export async function haLeido(anuncioId: string, usuarioId: string): Promise<boolean> {
  const lectura = await db.lecturasAnuncio.get([anuncioId, usuarioId])
  return !!lectura
}

export async function addAdjunto(adjunto: Omit<Adjunto, 'id'>): Promise<string> {
  const id = generateId()
  await db.adjuntos.add({ ...adjunto, id })
  return id
}

export async function getAdjuntosByAnuncio(anuncioId: string): Promise<Adjunto[]> {
  return db.adjuntos.where('anuncioId').equals(anuncioId).toArray()
}

export async function getLecturasConUsuarios(): Promise<(LecturaAnuncio & { nombreUsuario?: string })[]> {
  const lecturas = await db.lecturasAnuncio.toArray()
  const usuarios = await db.usuarios.toArray()
  const userMap = new Map(usuarios.map(u => [u.id, u.nombre]))
  return lecturas.map(l => ({ ...l, nombreUsuario: userMap.get(l.usuarioId) }))
}

export async function getEstadisticasLectura(anuncioId: string): Promise<{ total: number; leidos: number; porcentaje: number }> {
  const total = await db.usuarios.count()
  const leidos = await db.lecturasAnuncio.where('anuncioId').equals(anuncioId).count()
  return { total, leidos, porcentaje: total > 0 ? Math.round((leidos / total) * 100) : 0 }
}
