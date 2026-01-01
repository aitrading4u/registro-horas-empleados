// Tipos principales de la aplicación

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN'

export interface User {
  id: string
  email: string
  full_name: string | null
  password_hash?: string // Hash de contraseña (solo para mock, en producción será en Supabase)
  created_at: string
}

export interface ScheduledTime {
  id: string
  user_id: string
  organization_id: string
  day_of_week: number // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  entry_time: string // Formato HH:mm (ej: "09:00")
  is_active: boolean
  created_at: string
}

export interface Organization {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  allowed_radius: number // en metros (50-100m)
  timezone: string
  created_at: string
  created_by: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: UserRole
  created_at: string
  // Relaciones
  user?: User
  organization?: Organization
}

export type TimeEntryType = 'ENTRY' | 'EXIT'

export interface TimeEntry {
  id: string
  organization_id: string
  user_id: string
  type: TimeEntryType
  timestamp: string
  latitude: number | null
  longitude: number | null
  device_info: string | null
  created_at: string
  // Relaciones
  user?: User
  organization?: Organization
}

export type IncidentType = 
  | 'FORGOT_ENTRY'
  | 'LATE_ARRIVAL'
  | 'NOT_WORKING'

export type IncidentStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Incident {
  id: string
  organization_id: string
  user_id: string
  type: IncidentType
  status: IncidentStatus
  date: string
  description: string
  time_entry_id: string | null // Si modifica un fichaje existente
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  // Relaciones
  user?: User
  organization?: Organization
  reviewer?: User
}

export interface AuditLog {
  id: string
  organization_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  changes: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// Tipos para formularios
export interface CreateOrganizationInput {
  name: string
  address?: string
  latitude?: number
  longitude?: number
  allowed_radius: number
  timezone: string
}

export interface CreateIncidentInput {
  organization_id: string
  type: IncidentType
  date: string
  description: string
  time_entry_id?: string
}

// Tipos para reportes
export interface TimeReport {
  date: string
  entries: TimeEntry[]
  total_hours: number | null
  status: 'COMPLETE' | 'INCOMPLETE' | 'PENDING_INCIDENT'
}

