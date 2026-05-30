import { db } from '../db/database'
import type { SolicitudCambioTurno } from '../lib/types'
import { generateId, nowISO } from '../lib/utils'
import { addToSyncQueue } from './syncService'

export async function getAllSolicitudes(): Promise<SolicitudCambioTurno[]> {
  return db.solicitudesCambio.toArray()
}

export async function getSolicitudesByEstado(estado: string): Promise<SolicitudCambioTurno[]> {
  return db.solicitudesCambio.where('estado').equals(estado).toArray()
}

export async function getSolicitudesBySolicitante(solicitanteId: string): Promise<SolicitudCambioTurno[]> {
  return db.solicitudesCambio.where('solicitanteId').equals(solicitanteId).toArray()
}

export async function createSolicitud(data: Omit<SolicitudCambioTurno, 'id' | 'fechaSolicitud' | 'estado'>): Promise<string> {
  const id = generateId()
  const solicitud: SolicitudCambioTurno = {
    ...data,
    id,
    fechaSolicitud: nowISO(),
    estado: 'pendiente',
  }
  await db.solicitudesCambio.add(solicitud)
  await addToSyncQueue('solicitudesCambio', id, 'INSERT', solicitud)
  return id
}

export async function aprobarSolicitud(id: string): Promise<void> {
  await db.solicitudesCambio.update(id, { estado: 'aprobada' })
  await addToSyncQueue('solicitudesCambio', id, 'UPDATE', { id, estado: 'aprobada' })
}

export async function rechazarSolicitud(id: string): Promise<void> {
  await db.solicitudesCambio.update(id, { estado: 'rechazada' })
  await addToSyncQueue('solicitudesCambio', id, 'UPDATE', { id, estado: 'rechazada' })
}

export async function deleteSolicitud(id: string): Promise<void> {
  await db.solicitudesCambio.delete(id)
  await addToSyncQueue('solicitudesCambio', id, 'DELETE', { id })
}
