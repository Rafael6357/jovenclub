import { doc, setDoc, deleteDoc, getDocs, collection, writeBatch } from 'firebase/firestore'
import { firestore } from '../lib/firebase'
import { db } from '../db/database'
import type { ColaSincronizacion } from '../lib/types'
import { generateId, nowISO } from '../lib/utils'

async function pushToFirestore(
  tabla: string, registroId: string, accion: 'INSERT' | 'UPDATE' | 'DELETE', datos: unknown
): Promise<void> {
  const ref = doc(firestore, tabla, registroId)
  if (accion === 'DELETE') {
    await deleteDoc(ref)
  } else {
    await setDoc(ref, JSON.parse(JSON.stringify(datos)), { merge: true })
  }
}

export async function addToSyncQueue(
  tabla: string, registroId: string, accion: 'INSERT' | 'UPDATE' | 'DELETE', datos: unknown
): Promise<void> {
  const entry: ColaSincronizacion = {
    id: generateId(),
    tabla,
    registroId,
    accion,
    datos: JSON.stringify(datos),
    fechaCreacion: nowISO(),
    intentado: 0,
    lastError: null,
  }
  await db.colaSincronizacion.add(entry)
  try {
    await pushToFirestore(tabla, registroId, accion, datos)
    await db.colaSincronizacion.delete(entry.id)
  } catch {
    // Failed (offline) - stays in queue
  }
}

export async function procesarCola(callback?: (procesados: number) => void): Promise<number> {
  const cola = await db.colaSincronizacion.orderBy('fechaCreacion').toArray()
  let procesados = 0
  for (const entry of cola) {
    try {
      const datos = JSON.parse(entry.datos)
      await pushToFirestore(entry.tabla, entry.registroId, entry.accion, datos)
      await db.colaSincronizacion.delete(entry.id)
      procesados++
    } catch (err) {
      await db.colaSincronizacion.update(entry.id, {
        intentado: entry.intentado + 1,
        lastError: String(err),
      })
    }
  }
  callback?.(procesados)
  return procesados
}

export async function getAllCola(): Promise<ColaSincronizacion[]> {
  return db.colaSincronizacion.orderBy('fechaCreacion').toArray()
}

export async function getColaCount(): Promise<number> {
  return db.colaSincronizacion.count()
}

export async function clearSyncQueue(): Promise<void> {
  await db.colaSincronizacion.clear()
}

export async function initFirestoreListener(): Promise<void> {
  const collections = [
    'usuarios', 'horarios', 'anuncios', 'recursos', 'reservas',
    'solicitudesCambio', 'lecturasAnuncio', 'adjuntos', 'eventosReserva',
  ]
  for (const name of collections) {
    const snap = await getDocs(collection(firestore, name))
    for (const docSnap of snap.docs) {
      const data = docSnap.data()
      if (name === 'usuarios') await db.usuarios.put(data as any)
      else if (name === 'horarios') await db.horarios.put(data as any)
      else if (name === 'anuncios') await db.anuncios.put(data as any)
      else if (name === 'recursos') await db.recursos.put(data as any)
      else if (name === 'reservas') await db.reservas.put(data as any)
      else if (name === 'solicitudesCambio') await db.solicitudesCambio.put(data as any)
      else if (name === 'lecturasAnuncio') await db.lecturasAnuncio.put(data as any)
      else if (name === 'adjuntos') await db.adjuntos.put(data as any)
      else if (name === 'eventosReserva') await db.eventosReserva.put(data as any)
    }
  }
}
