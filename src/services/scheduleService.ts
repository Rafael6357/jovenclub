import { db } from '../db/database'
import type { Horario } from '../lib/types'
import { generateId } from '../lib/utils'
import { addToSyncQueue } from './syncService'

export async function getAllHorarios(): Promise<Horario[]> {
  return db.horarios.toArray()
}

export async function getHorariosByUsuario(usuarioId: string): Promise<Horario[]> {
  return db.horarios.where('usuarioId').equals(usuarioId).toArray()
}

export async function getHorarioById(id: string): Promise<Horario | undefined> {
  return db.horarios.get(id)
}

export async function getHorariosByDia(diaSemana: number): Promise<Horario[]> {
  return db.horarios.where('diaSemana').equals(diaSemana).toArray()
}

export async function getHorarioVigente(usuarioId: string, diaSemana: number, fecha: string): Promise<Horario | undefined> {
  const horarios = await db.horarios
    .where('usuarioId').equals(usuarioId)
    .and(h => h.diaSemana === diaSemana && h.validoDesde <= fecha && h.validoHasta >= fecha)
    .first()
  return horarios
}

export async function validarOverlap(h: { id?: string; usuarioId: string; diaSemana: number; horaInicio: string; horaFin: string; validoDesde: string; validoHasta: string }): Promise<Horario | null> {
  const existentes = await db.horarios
    .where('usuarioId').equals(h.usuarioId)
    .and(ho => ho.diaSemana === h.diaSemana)
    .toArray()
  return existentes.find(ho =>
    ho.id !== h.id &&
    h.horaInicio < ho.horaFin && h.horaFin > ho.horaInicio &&
    h.validoDesde <= ho.validoHasta && h.validoHasta >= ho.validoDesde
  ) || null
}

export async function createHorario(data: Omit<Horario, 'id'>): Promise<string> {
  const id = generateId()
  const horario: Horario = { ...data, id }
  await db.horarios.add(horario)
  await addToSyncQueue('horarios', id, 'INSERT', horario)
  return id
}

export async function updateHorario(id: string, data: Partial<Horario>): Promise<void> {
  await db.horarios.update(id, data)
  await addToSyncQueue('horarios', id, 'UPDATE', { ...data, id })
}

export async function deleteHorario(id: string): Promise<void> {
  await db.horarios.delete(id)
  await addToSyncQueue('horarios', id, 'DELETE', { id })
}
