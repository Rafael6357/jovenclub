import jsPDF from 'jspdf'
import 'jspdf-autotable'
import Papa from 'papaparse'
import { db } from '../db/database'
import { formatDate, formatTime } from '../lib/utils'
import { DIAS_SEMANA } from '../lib/constants'

type AutoTableOptions = {
  head?: string[][]
  body?: (string | number)[][]
  startY?: number
  styles?: Record<string, unknown>
  headStyles?: Record<string, unknown>
}

const _userCache = new Map<string, string>()

async function getUserName(id: string): Promise<string> {
  if (_userCache.has(id)) return _userCache.get(id)!
  const user = await db.usuarios.get(id)
  const name = user?.nombre || id
  _userCache.set(id, name)
  return name
}

async function getRecursosMap(): Promise<Map<string, string>> {
  const recursos = await db.recursos.toArray()
  return new Map(recursos.map(r => [r.id, r.nombre]))
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(['\uFEFF' + content], { type: `${mimeType};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function addPDFHeader(doc: jsPDF, title: string, subtitle?: string) {
  doc.setFontSize(16)
  doc.text('Joven Club de Computación y Electrónica - San Luis', 14, 15)
  doc.setFontSize(12)
  doc.text(title, 14, 23)
  if (subtitle) {
    doc.setFontSize(9)
    doc.text(subtitle, 14, 29)
  }
  doc.setFontSize(8)
  doc.text(`Generado: ${new Date().toLocaleDateString('es-ES')}`, 14, subtitle ? 35 : 29)
}

// --- REPORTES PDF ---

export async function reporteHorariosPDF(): Promise<void> {
  const horarios = await db.horarios.toArray()
  if (horarios.length === 0) throw new Error('No hay horarios registrados para exportar.')
  const doc = new jsPDF()
  addPDFHeader(doc, 'Reporte de Horarios del Personal')
  const data = await Promise.all(horarios.map(async h => [
    await getUserName(h.usuarioId),
    DIAS_SEMANA.find(d => d.id === h.diaSemana)?.nombre || '',
    `${h.horaInicio} - ${h.horaFin}`,
    formatDate(h.validoDesde),
    formatDate(h.validoHasta),
  ]))
  const tableOpts: AutoTableOptions = {
    head: [['Empleado', 'Día', 'Horario', 'Desde', 'Hasta']],
    body: data,
    startY: 38,
  }
  ;(doc as any).autoTable(tableOpts)
  downloadBlob(doc.output('blob'), 'reporte_horarios.pdf')
}

export async function reporteAnunciosPDF(): Promise<void> {
  const anuncios = await db.anuncios.toArray()
  if (anuncios.length === 0) throw new Error('No hay anuncios registrados para exportar.')
  const doc = new jsPDF()
  addPDFHeader(doc, 'Reporte de Anuncios')
  const data = await Promise.all(anuncios.map(async a => {
    const leido = await db.lecturasAnuncio.where('anuncioId').equals(a.id).count()
    return [
      a.titulo,
      await getUserName(a.autorId),
      formatDate(a.fechaPublicacion),
      formatDate(a.fechaExpiracion),
      `${leido} leídos`,
    ]
  }))
  const tableOpts: AutoTableOptions = {
    head: [['Título', 'Autor', 'Publicación', 'Expiración', 'Lecturas']],
    body: data,
    startY: 38,
  }
  ;(doc as any).autoTable(tableOpts)
  downloadBlob(doc.output('blob'), 'reporte_anuncios.pdf')
}

export async function reporteReservasPDF(): Promise<void> {
  const reservas = await db.reservas.toArray()
  if (reservas.length === 0) throw new Error('No hay reservas registradas para exportar.')
  const doc = new jsPDF()
  addPDFHeader(doc, 'Reporte de Reservas de Recursos')
  const recursoMap = await getRecursosMap()
  const data = await Promise.all(reservas.map(async r => [
    recursoMap.get(r.recursoId) || r.recursoId,
    r.tituloEvento,
    await getUserName(r.usuarioId),
    formatDate(r.fechaInicio),
    formatTime(r.fechaInicio),
    formatDate(r.fechaFin),
    formatTime(r.fechaFin),
    r.estado,
  ]))
  const tableOpts: AutoTableOptions = {
    head: [['Recurso', 'Evento', 'Solicita', 'Fecha Ini.', 'Hora Ini.', 'Fecha Fin.', 'Hora Fin.', 'Estado']],
    body: data,
    startY: 38,
  }
  ;(doc as any).autoTable(tableOpts)
  downloadBlob(doc.output('blob'), 'reporte_reservas.pdf')
}

// --- REPORTES CSV ---

export async function reporteHorariosCSV(): Promise<void> {
  const horarios = await db.horarios.toArray()
  if (horarios.length === 0) throw new Error('No hay horarios registrados para exportar.')
  const data = await Promise.all(horarios.map(async h => ({
    Empleado: await getUserName(h.usuarioId),
    Día: DIAS_SEMANA.find(d => d.id === h.diaSemana)?.nombre || '',
    HoraInicio: h.horaInicio,
    HoraFin: h.horaFin,
    Desde: formatDate(h.validoDesde),
    Hasta: formatDate(h.validoHasta),
  })))
  downloadFile(Papa.unparse(data), 'reporte_horarios.csv', 'text/csv')
}

export async function reporteAnunciosCSV(): Promise<void> {
  const anuncios = await db.anuncios.toArray()
  if (anuncios.length === 0) throw new Error('No hay anuncios registrados para exportar.')
  const data = []
  for (const a of anuncios) {
    const leidos = await db.lecturasAnuncio.where('anuncioId').equals(a.id).count()
    data.push({
      Título: a.titulo,
      Autor: await getUserName(a.autorId),
      Publicación: formatDate(a.fechaPublicacion),
      Expiración: formatDate(a.fechaExpiracion),
      Lecturas: leidos,
    })
  }
  downloadFile(Papa.unparse(data), 'reporte_anuncios.csv', 'text/csv')
}

export async function reporteReservasCSV(): Promise<void> {
  const reservas = await db.reservas.toArray()
  if (reservas.length === 0) throw new Error('No hay reservas registradas para exportar.')
  const recursoMap = await getRecursosMap()
  const data = await Promise.all(reservas.map(async r => ({
    Recurso: recursoMap.get(r.recursoId) || r.recursoId,
    Evento: r.tituloEvento,
    Solicitante: await getUserName(r.usuarioId),
    'Fecha Inicio': formatDate(r.fechaInicio),
    'Hora Inicio': formatTime(r.fechaInicio),
    'Fecha Fin': formatDate(r.fechaFin),
    'Hora Fin': formatTime(r.fechaFin),
    Asistentes: r.asistentes,
    Estado: r.estado,
  })))
  downloadFile(Papa.unparse(data), 'reporte_reservas.csv', 'text/csv')
}

export async function reporteUsuarioHorariosCSV(usuarioId: string): Promise<void> {
  const horarios = await db.horarios.where('usuarioId').equals(usuarioId).toArray()
  if (horarios.length === 0) throw new Error('No tienes horarios registrados.')
  const nombre = await getUserName(usuarioId)
  const data = horarios.map(h => ({
    Día: DIAS_SEMANA.find(d => d.id === h.diaSemana)?.nombre || '',
    'Hora Inicio': h.horaInicio,
    'Hora Fin': h.horaFin,
    Desde: formatDate(h.validoDesde),
    Hasta: formatDate(h.validoHasta),
  }))
  downloadFile(Papa.unparse(data), `horario_${nombre.replace(/\s+/g, '_')}.csv`, 'text/csv')
}

// --- REPORTES POR USUARIO ---

export async function reporteUsuarioHorariosPDF(usuarioId: string): Promise<void> {
  const horarios = await db.horarios.where('usuarioId').equals(usuarioId).toArray()
  if (horarios.length === 0) throw new Error('No tienes horarios registrados.')
  const doc = new jsPDF()
  addPDFHeader(doc, 'Mi Horario Personal')
  const nombre = await getUserName(usuarioId)
  doc.setFontSize(10)
  doc.text(`Empleado: ${nombre}`, 14, 38)
  const data = horarios.map(h => [
    DIAS_SEMANA.find(d => d.id === h.diaSemana)?.nombre || '',
    `${h.horaInicio} - ${h.horaFin}`,
    formatDate(h.validoDesde),
    formatDate(h.validoHasta),
  ])
  const tableOpts: AutoTableOptions = {
    head: [['Día', 'Horario', 'Desde', 'Hasta']],
    body: data,
    startY: 42,
  }
  ;(doc as any).autoTable(tableOpts)
  downloadBlob(doc.output('blob'), 'mi_horario.pdf')
}
