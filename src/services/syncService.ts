import { supabase } from '../lib/supabase'
import { db } from '../db/database'
import type { ColaSincronizacion } from '../lib/types'
import { generateId, nowISO } from '../lib/utils'

const MAX_RETRIES = 5

function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
}

async function pushToSupabase(
  tabla: string, registroId: string, accion: 'INSERT' | 'UPDATE' | 'DELETE', datos: unknown
): Promise<void> {
  if (accion === 'DELETE') {
    const { error } = await supabase.from(tabla).delete().eq('id', registroId)
    if (error) throw error
  } else {
    const { error } = await supabase.from(tabla).upsert(datos as any, { onConflict: 'id' })
    if (error) throw error
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
  if (tabla === '_auth_user') {
    return
  }
  if (tabla === 'usuarios' && !isValidUUID(registroId)) {
    return
  }
  try {
    await pushToSupabase(tabla, registroId, accion, datos)
    await db.colaSincronizacion.delete(entry.id)
  } catch {
    // Failed (offline) - stays in queue
  }
}

export async function procesarCola(callback?: (procesados: number) => void): Promise<number> {
  const cola = await db.colaSincronizacion.orderBy('fechaCreacion').toArray()
  let procesados = 0
  for (const entry of cola) {
    if (entry.tabla === 'usuarios' && !isValidUUID(entry.registroId)) {
      await db.colaSincronizacion.delete(entry.id)
      continue
    }
    if (entry.tabla === '_auth_user') {
      try {
        const { error } = await supabase.functions.invoke('delete-user', { body: { id: entry.registroId } })
        if (error) throw new Error(error)
        await db.colaSincronizacion.delete(entry.id)
        procesados++
      } catch (err) {
        await db.colaSincronizacion.update(entry.id, {
          intentado: entry.intentado + 1,
          lastError: String(err),
        })
      }
      continue
    }
    if (entry.intentado >= MAX_RETRIES) {
      // Mark as permanently failed and skip
      await db.colaSincronizacion.update(entry.id, { lastError: 'Máximo de reintentos alcanzado' })
      continue
    }
    try {
      const datos = JSON.parse(entry.datos)
      await pushToSupabase(entry.tabla, entry.registroId, entry.accion, datos)
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

const KEY_MAP: Record<string, Record<string, string>> = {
  horarios: { usuarioid: 'usuarioId', diasemana: 'diaSemana', horainicio: 'horaInicio', horafin: 'horaFin', validodesde: 'validoDesde', validohasta: 'validoHasta' },
  anuncios: { fechapublicacion: 'fechaPublicacion', fechaexpiracion: 'fechaExpiracion', autorid: 'autorId' },
  adjuntos: { anuncioid: 'anuncioId', nombrearchivo: 'nombreArchivo', tipomime: 'tipoMime', tamanobytes: 'tamanoBytes' },
  recursos: {},
  reservas: { recursioid: 'recursoId', usuarioid: 'usuarioId', tituloevento: 'tituloEvento', fechainicio: 'fechaInicio', fechafin: 'fechaFin' },
  solicitudesCambio: { solicitanteid: 'solicitanteId', reemplazanteid: 'reemplazanteId', fechasolicitud: 'fechaSolicitud', turnooriginal: 'turnoOriginal', turnopropuesto: 'turnoPropuesto' },
  lecturasAnuncio: { anuncioid: 'anuncioId', usuarioid: 'usuarioId', fechalectura: 'fechaLectura' },
  eventosReserva: { reservaid: 'reservaId', fecharegistro: 'fechaRegistro' },
}

function normalizeRecord(tabla: string, record: any): any {
  const map = KEY_MAP[tabla]
  if (!map) return record
  const out: any = { ...record }
  for (const [oldKey, newKey] of Object.entries(map)) {
    if (oldKey in out && !(newKey in out)) {
      out[newKey] = out[oldKey]
      delete out[oldKey]
    }
  }
  return out
}

const TABLES_ORDER = [
  'horarios', 'anuncios', 'adjuntos', 'recursos', 'reservas',
  'solicitudesCambio', 'lecturasAnuncio', 'eventosReserva',
] as const

export async function pushAllToSupabase(
  onProgress?: (table: string, current: number, total: number) => void
): Promise<void> {
  await clearSyncQueue()
  for (const name of TABLES_ORDER) {
    const records = await (db as any)[name].toArray()
    if (records.length === 0) continue
    const normalized = records.map((r: any) => normalizeRecord(name, r))
    onProgress?.(name, 0, normalized.length)
    const CHUNK = 100
    for (let i = 0; i < normalized.length; i += CHUNK) {
      const chunk = normalized.slice(i, i + CHUNK)
      const { error } = await supabase.from(name).upsert(chunk, { onConflict: 'id' })
      if (error) throw error
      onProgress?.(name, Math.min(i + CHUNK, normalized.length), normalized.length)
    }
  }
}

export async function initSupabaseSync(): Promise<void> {
  // Only sync if there are no pending local changes to avoid overwriting unsynced data
  const pendientes = await db.colaSincronizacion.count()
  if (pendientes > 0) return

  const collections = [
    'usuarios', 'horarios', 'anuncios', 'recursos', 'reservas',
    'solicitudesCambio', 'lecturasAnuncio', 'adjuntos', 'eventosReserva',
  ]
  for (const name of collections) {
    const { data, error } = await supabase.from(name).select('*')
    if (error || !data) continue
    for (const item of data) {
      if (name === 'usuarios') await db.usuarios.put(item as any)
      else if (name === 'horarios') await db.horarios.put(item as any)
      else if (name === 'anuncios') await db.anuncios.put(item as any)
      else if (name === 'recursos') await db.recursos.put(item as any)
      else if (name === 'reservas') await db.reservas.put(item as any)
      else if (name === 'solicitudesCambio') await db.solicitudesCambio.put(item as any)
      else if (name === 'lecturasAnuncio') await db.lecturasAnuncio.put(item as any)
      else if (name === 'adjuntos') await db.adjuntos.put(item as any)
      else if (name === 'eventosReserva') await db.eventosReserva.put(item as any)
    }
  }
}

// Auto-retry when browser comes back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    procesarCola((procesados) => {
      if (procesados > 0) {
        window.dispatchEvent(new CustomEvent('sync-complete', { detail: { procesados } }))
      }
    })
  })

  // Periodic retry of the queue (every 30s while there are pending items)
  async function autoRetry() {
    const count = await db.colaSincronizacion.count()
    if (count > 0) {
      const procesados = await procesarCola()
      if (procesados > 0) {
        window.dispatchEvent(new CustomEvent('sync-complete', { detail: { procesados } }))
      }
    }
  }
  setInterval(autoRetry, 30000)
}
