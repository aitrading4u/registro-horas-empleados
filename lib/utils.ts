import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    EMPLOYEE: 'Empleado',
    MANAGER: 'Encargado',
    ADMIN: 'Administrador',
  }
  return labels[role] || role
}

export function getIncidentTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    FORGOT_ENTRY: 'Olvidé fichar mi entrada',
    LATE_ARRIVAL: 'Llegué Tarde',
    NOT_WORKING: 'No voy a trabajar',
  }
  return labels[type] || type
}

export function getIncidentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
  }
  return labels[status] || status
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3 // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Distancia en metros
}

export function calculateHours(entries: Array<{ type: string; timestamp: string }>): number | null {
  // Ordenar por timestamp
  const sorted = [...entries].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  let totalMinutes = 0
  let lastEntry: { type: string; timestamp: string } | null = null

  for (const entry of sorted) {
    if (entry.type === 'ENTRY') {
      lastEntry = entry
    } else if (entry.type === 'EXIT' && lastEntry) {
      const entryTime = new Date(lastEntry.timestamp).getTime()
      const exitTime = new Date(entry.timestamp).getTime()
      totalMinutes += (exitTime - entryTime) / (1000 * 60)
      lastEntry = null
    }
  }

  return totalMinutes > 0 ? totalMinutes / 60 : null
}

