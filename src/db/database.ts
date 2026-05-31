import Dexie, { type Table } from 'dexie'
import type {
  Rol, Usuario, Horario, SolicitudCambioTurno,
  Anuncio, Adjunto, LecturaAnuncio,
  Recurso, Reserva, EventoReserva, ColaSincronizacion
} from '../lib/types'

export class ComunicaJCDB extends Dexie {
  roles!: Table<Rol>
  usuarios!: Table<Usuario>
  horarios!: Table<Horario>
  solicitudesCambio!: Table<SolicitudCambioTurno>
  anuncios!: Table<Anuncio>
  adjuntos!: Table<Adjunto>
  lecturasAnuncio!: Table<LecturaAnuncio>
  recursos!: Table<Recurso>
  reservas!: Table<Reserva>
  eventosReserva!: Table<EventoReserva>
  colaSincronizacion!: Table<ColaSincronizacion>

  constructor() {
    super('ComunicaJCDB')
    this.version(3).stores({
      roles: 'id',
      usuarios: 'id, email, rolId',
      horarios: 'id, usuarioId, diaSemana',
      solicitudesCambio: 'id, solicitanteId, reemplazanteId, estado',
      anuncios: 'id, autorId, fechaPublicacion, fechaExpiracion',
      adjuntos: 'id, anuncioId',
      lecturasAnuncio: '[anuncioId+usuarioId], anuncioId, usuarioId',
      recursos: 'id, tipo, disponible',
      reservas: 'id, recursoId, usuarioId, estado',
      eventosReserva: 'id, reservaId',
      colaSincronizacion: 'id, tabla, registroId, accion, fechaCreacion',
    }).upgrade(async trans => {
      await trans.table('roles').clear()
      await trans.table('usuarios').clear()
      await trans.table('horarios').clear()
      await trans.table('solicitudesCambio').clear()
      await trans.table('anuncios').clear()
      await trans.table('adjuntos').clear()
      await trans.table('lecturasAnuncio').clear()
      await trans.table('recursos').clear()
      await trans.table('reservas').clear()
      await trans.table('eventosReserva').clear()
      await trans.table('colaSincronizacion').clear()
    })
  }
}

export const db = new ComunicaJCDB()
