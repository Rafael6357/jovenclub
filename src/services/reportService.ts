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

async function getUsuariosMap(): Promise<Map<string, string>> {
  const usuarios = await db.usuarios.toArray()
  return new Map(usuarios.map(u => [u.id, u.nombre]))
}

async function getRecursosMap(): Promise<Map<string, string>> {
  const recursos = await db.recursos.toArray()
  return new Map(recursos.map(r => [r.id, r.nombre]))
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
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
  const doc = new jsPDF()
  addPDFHeader(doc, 'Reporte de Horarios del Personal')
  const userMap = await getUsuariosMap()
  const horarios = await db.horarios.toArray()
  const data = horarios.map(h => [
    userMap.get(h.usuarioId) || h.usuarioId,
    DIAS_SEMANA.find(d => d.id === h.diaSemana)?.nombre || '',
    `${h.horaInicio} - ${h.horaFin}`,
    h.validoDesde,
    h.validoHasta,
    h.sede || '-',
  ])
  const tableOpts: AutoTableOptions = {
    head: [['Empleado', 'Día', 'Horario', 'Desde', 'Hasta', 'Sede']],
    body: data,
    startY: 38,
  }
  ;(doc as any).autoTable(tableOpts)
  downloadBlob(doc.output('blob'), 'reporte_horarios.pdf')
}

export async function reporteAnunciosPDF(): Promise<void> {
  const doc = new jsPDF()
  addPDFHeader(doc, 'Reporte de Anuncios')
  const userMap = await getUsuariosMap()
  const anuncios = await db.anuncios.toArray()
  const data = await Promise.all(anuncios.map(async a => {
    const leido = await db.lecturasAnuncio.where('anuncioId').equals(a.id).count()
    return [
      a.titulo,
      userMap.get(a.autorId) || a.autorId,
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
  const doc = new jsPDF()
  addPDFHeader(doc, 'Reporte de Reservas de Recursos')
  const userMap = await getUsuariosMap()
  const recursoMap = await getRecursosMap()
  const reservas = await db.reservas.toArray()
  const data = reservas.map(r => [
    recursoMap.get(r.recursoId) || r.recursoId,
    r.tituloEvento,
    userMap.get(r.usuarioId) || r.usuarioId,
    formatDate(r.fechaInicio),
    formatTime(r.fechaInicio.split('T')[1]),
    formatDate(r.fechaFin),
    formatTime(r.fechaFin.split('T')[1]),
    r.estado,
  ])
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
  const userMap = await getUsuariosMap()
  const horarios = await db.horarios.toArray()
  const data = horarios.map(h => ({
    Empleado: userMap.get(h.usuarioId) || h.usuarioId,
    Día: DIAS_SEMANA.find(d => d.id === h.diaSemana)?.nombre || '',
    HoraInicio: h.horaInicio,
    HoraFin: h.horaFin,
    Desde: h.validoDesde,
    Hasta: h.validoHasta,
    Sede: h.sede || '-',
  }))
  downloadFile(Papa.unparse(data), 'reporte_horarios.csv', 'text/csv')
}

export async function reporteAnunciosCSV(): Promise<void> {
  const userMap = await getUsuariosMap()
  const anuncios = await db.anuncios.toArray()
  const data = []
  for (const a of anuncios) {
    const leidos = await db.lecturasAnuncio.where('anuncioId').equals(a.id).count()
    data.push({
      Título: a.titulo,
      Autor: userMap.get(a.autorId) || a.autorId,
      Publicación: formatDate(a.fechaPublicacion),
      Expiración: formatDate(a.fechaExpiracion),
      Lecturas: leidos,
    })
  }
  downloadFile(Papa.unparse(data), 'reporte_anuncios.csv', 'text/csv')
}

export async function reporteReservasCSV(): Promise<void> {
  const userMap = await getUsuariosMap()
  const recursoMap = await getRecursosMap()
  const reservas = await db.reservas.toArray()
  const data = reservas.map(r => ({
    Recurso: recursoMap.get(r.recursoId) || r.recursoId,
    Evento: r.tituloEvento,
    Solicitante: userMap.get(r.usuarioId) || r.usuarioId,
    FechaInicio: r.fechaInicio,
    FechaFin: r.fechaFin,
    Asistentes: r.asistentes,
    Estado: r.estado,
  }))
  downloadFile(Papa.unparse(data), 'reporte_reservas.csv', 'text/csv')
}

// --- REPORTES POR USUARIO ---

export async function reporteUsuarioHorariosPDF(usuarioId: string): Promise<void> {
  const doc = new jsPDF()
  addPDFHeader(doc, 'Mi Horario Personal')
  const userMap = await getUsuariosMap()
  const nombre = userMap.get(usuarioId) || usuarioId
  doc.setFontSize(10)
  doc.text(`Empleado: ${nombre}`, 14, 38)
  const horarios = await db.horarios.where('usuarioId').equals(usuarioId).toArray()
  const data = horarios.map(h => [
    DIAS_SEMANA.find(d => d.id === h.diaSemana)?.nombre || '',
    `${h.horaInicio} - ${h.horaFin}`,
    h.validoDesde,
    h.validoHasta,
    h.sede || '-',
  ])
  const tableOpts: AutoTableOptions = {
    head: [['Día', 'Horario', 'Desde', 'Hasta', 'Sede']],
    body: data,
    startY: 42,
  }
  ;(doc as any).autoTable(tableOpts)
  downloadBlob(doc.output('blob'), 'mi_horario.pdf')
}
