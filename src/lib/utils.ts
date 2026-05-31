import { format, parseISO, isValid, startOfWeek, endOfWeek, addDays } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'dd/MM/yyyy') : ''
  } catch { return '' }
}

export function formatDateTime(dateStr: string): string {
  if (!dateStr) return ''
  try {
    const d = parseISO(dateStr)
    return isValid(d) ? format(d, 'dd/MM/yyyy HH:mm') : ''
  } catch { return '' }
}

export function formatTime(dateOrTimeStr: string | undefined): string {
  if (!dateOrTimeStr) return ''
  const timePart = dateOrTimeStr.includes('T') ? dateOrTimeStr.split('T')[1] : dateOrTimeStr
  if (!timePart) return ''
  const match = timePart.match(/^(\d{2}:\d{2})/)
  return match ? match[1] : timePart.slice(0, 5)
}

export function getInitials(nombre: string): string {
  if (!nombre?.trim()) return '??'
  return nombre.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function checkOverlap(
  newStart: string, newEnd: string,
  existStart: string, existEnd: string
): boolean {
  return newStart < existEnd && newEnd > existStart
}

export function nowISO(): string {
  return new Date().toISOString()
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

export function isExpiringSoon(dateStr: string, days: number = 3): boolean {
  if (!dateStr) return false
  const d = parseISO(dateStr)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  return diff > 0 && diff <= days * 86400000
}

export function isExpired(dateStr: string): boolean {
  if (!dateStr) return false
  return parseISO(dateStr).getTime() < Date.now()
}

export function getDiasSemana(): number[] {
  return [1, 2, 3, 4, 5, 6, 7]
}
