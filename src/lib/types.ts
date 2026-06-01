export interface Rol {
  id: string
  nombre: string
  descripcion: string
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  rolId: string
  fotoURL?: string
  telefono: string
}

export interface Horario {
  id: string
  usuarioId: string
  diaSemana: number
  horaInicio: string
  horaFin: string
  validoDesde: string
  validoHasta: string
}

export interface SolicitudCambioTurno {
  id: string
  solicitanteId: string
  reemplazanteId: string
  fechaSolicitud: string
  horarioId?: string
  turnoOriginal: string
  turnoPropuesto: string
  diaPropuesto?: number
  horaInicioPropuesto?: string
  horaFinPropuesto?: string
  estado: 'pendiente' | 'aprobada' | 'rechazada'
  motivo?: string
}

export interface Anuncio {
  id: string
  titulo: string
  contenido: string
  fechaPublicacion: string
  fechaExpiracion: string
  autorId: string
}

export interface Adjunto {
  id: string
  anuncioId: string
  url: string
  nombreArchivo: string
  tipoMime: string
  tamanoBytes: number
}

export interface LecturaAnuncio {
  anuncioId: string
  usuarioId: string
  fechaLectura: string
}

export interface Recurso {
  id: string
  nombre: string
  tipo: string
  descripcion: string
  disponible: boolean
}

export interface Reserva {
  id: string
  recursoId: string
  usuarioId: string
  tituloEvento: string
  fechaInicio: string
  fechaFin: string
  asistentes: number
  estado: 'confirmada' | 'cancelada'
}

export interface EventoReserva {
  id: string
  reservaId: string
  titulo: string
  descripcion: string
  fechaRegistro: string
}

export interface ColaSincronizacion {
  id: string
  tabla: string
  registroId: string
  accion: 'INSERT' | 'UPDATE' | 'DELETE'
  datos: string
  fechaCreacion: string
  intentado: number
  lastError: string | null
}
