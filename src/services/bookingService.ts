import { db } from '../db/database'
import type { Reserva, EventoReserva } from '../lib/types'
import { generateId, nowISO } from '../lib/utils'
import { addToSyncQueue } from './syncService'

export async function getAllReservas(): Promise<Reserva[]> {
  return db.reservas.toArray()
}

export async function getReservasByUsuario(usuarioId: string): Promise<Reserva[]> {
  return db.reservas.where('usuarioId').equals(usuarioId).toArray()
}

export async function getReservasByRecurso(recursoId: string): Promise<Reserva[]> {
  return db.reservas.where('recursoId').equals(recursoId).toArray()
}

export async function getReservasActivas(): Promise<Reserva[]> {
  return db.reservas.where('estado').equals('confirmada').toArray()
}

export async function validarOverlapReserva(
  recursoId: string, fechaInicio: string, fechaFin: string, excludeId?: string
): Promise<Reserva | null> {
  const existentes = await db.reservas
    .where('recursoId').equals(recursoId)
    .and(r => r.estado === 'confirmada')
    .toArray()
  return existentes.find(r =>
    r.id !== excludeId && fechaInicio < r.fechaFin && fechaFin > r.fechaInicio
  ) || null
}

export async function createReserva(data: Omit<Reserva, 'id' | 'estado'>): Promise<string> {
  const id = generateId()
  const reserva: Reserva = { ...data, id, estado: 'confirmada' }
  await db.reservas.add(reserva)
  const evento: EventoReserva = {
    id: generateId(),
    reservaId: id,
    titulo: data.tituloEvento,
    descripcion: 'Reserva creada',
    fechaRegistro: nowISO(),
  }
  await db.eventosReserva.add(evento)
  await addToSyncQueue('reservas', id, 'INSERT', reserva)
  return id
}

export async function updateReserva(id: string, data: Partial<Reserva>): Promise<void> {
  await db.reservas.update(id, data)
  await addToSyncQueue('reservas', id, 'UPDATE', { ...data, id })
}

export async function cancelarReserva(id: string): Promise<void> {
  await db.reservas.update(id, { estado: 'cancelada' })
  const evento: EventoReserva = {
    id: generateId(),
    reservaId: id,
    titulo: 'Reserva cancelada',
    descripcion: 'Cancelada',
    fechaRegistro: nowISO(),
  }
  await db.eventosReserva.add(evento)
  await addToSyncQueue('reservas', id, 'UPDATE', { id, estado: 'cancelada' })
}
