export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
} as const

export type RolId = typeof ROLES[keyof typeof ROLES]

export const ROLES_MAP: Record<string, { nombre: string; descripcion: string }> = {
  [ROLES.ADMIN]: { nombre: 'Administrador', descripcion: 'Gestión total del sistema' },
  [ROLES.INSTRUCTOR]: { nombre: 'Instructor', descripcion: 'Uso básico del sistema' },
}

export const DIAS_SEMANA = [
  { id: 1, nombre: 'Lunes', abbr: 'Lun' },
  { id: 2, nombre: 'Martes', abbr: 'Mar' },
  { id: 3, nombre: 'Miércoles', abbr: 'Mié' },
  { id: 4, nombre: 'Jueves', abbr: 'Jue' },
  { id: 5, nombre: 'Viernes', abbr: 'Vie' },
  { id: 6, nombre: 'Sábado', abbr: 'Sáb' },
  { id: 7, nombre: 'Domingo', abbr: 'Dom' },
]

export const TIPOS_RECURSO = ['Sala', 'Proyector', 'Computadora', 'Otros']

export const ESTADOS_RESERVA = {
  CONFIRMADA: 'confirmada',
  CANCELADA: 'cancelada',
} as const

export const ESTADOS_SOLICITUD = {
  PENDIENTE: 'pendiente',
  APROBADA: 'aprobada',
  RECHAZADA: 'rechazada',
} as const

export const SEDES: string[] = []

export const BRAND = {
  name: 'COMUNICA-JC',
  fullName: 'Joven Club de Computación y Electrónica',
  location: 'San Luis',
  version: '1.0.0',
  logoUrl: '/logo.svg',
} as const
