// Funciones para interactuar con Supabase
// Reemplaza el mock-db.ts cuando estés listo para usar Supabase real

import { createClient } from '@/lib/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  User,
  Organization,
  OrganizationMember,
  TimeEntry,
  Incident,
  ScheduledTime,
  UserRole,
} from '@/types'

// Función helper para obtener el cliente de Supabase
function getSupabaseClient(): SupabaseClient {
  return createClient()
}

// ============ USERS ============
export async function getUserById(userId: string): Promise<User | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null
  return data as User
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (error || !data) return null
  return data as User
}

export async function createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: user.email,
      full_name: user.full_name,
      password_hash: user.password_hash,
    })
    .select()
    .single()

  if (error) throw error
  return data as User
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error || !data) return null
  return data as User
}

export async function deleteUser(userId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  return !error
}

// ============ ORGANIZATIONS ============
export async function getOrganizationById(id: string): Promise<Organization | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data as Organization
}

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)

  if (error || !data || data.length === 0) return []

  const orgIds = data.map(m => m.organization_id)

  const { data: orgs, error: orgError } = await supabase
    .from('organizations')
    .select('*')
    .in('id', orgIds)

  if (orgError || !orgs) return []
  return orgs as Organization[]
}

export async function createOrganization(
  org: Omit<Organization, 'id' | 'created_at' | 'created_by'>,
  creatorUserId: string
): Promise<Organization> {
  const supabase = getSupabaseClient()
  // Crear organización
  const { data: newOrg, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name: org.name,
      address: org.address,
      latitude: org.latitude,
      longitude: org.longitude,
      allowed_radius: org.allowed_radius,
      timezone: org.timezone,
      created_by: creatorUserId,
    })
    .select()
    .single()

  if (orgError) throw orgError

  // Crear miembro ADMIN automáticamente
  await supabase
    .from('organization_members')
    .insert({
      organization_id: newOrg.id,
      user_id: creatorUserId,
      role: 'ADMIN',
    })

  return newOrg as Organization
}

export async function updateOrganization(
  organizationId: string,
  updates: Partial<Omit<Organization, 'id' | 'created_at' | 'created_by'>>
): Promise<Organization | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', organizationId)
    .select()
    .single()

  if (error || !data) return null
  return data as Organization
}

export async function deleteOrganization(organizationId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('organizations')
    .delete()
    .eq('id', organizationId)

  return !error
}

// ============ ORGANIZATION MEMBERS ============
export async function getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('organization_members')
    .select('*')
    .eq('organization_id', organizationId)

  if (error || !data) return []
  return data as OrganizationMember[]
}

export async function getUserRoleInOrganization(
  userId: string,
  organizationId: string
): Promise<UserRole | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .single()

  if (error || !data) return null
  return data.role as UserRole
}

export async function addMemberToOrganization(
  organizationId: string,
  userId: string,
  role: UserRole
): Promise<OrganizationMember> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('organization_members')
    .insert({
      organization_id: organizationId,
      user_id: userId,
      role,
    })
    .select()
    .single()

  if (error) throw error
  return data as OrganizationMember
}

export async function updateMemberRole(
  userId: string,
  organizationId: string,
  newRole: UserRole
): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('organization_members')
    .update({ role: newRole })
    .eq('user_id', userId)
    .eq('organization_id', organizationId)

  return !error
}

// ============ TIME ENTRIES ============
export async function createTimeEntry(entry: Omit<TimeEntry, 'id' | 'created_at'>): Promise<TimeEntry> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      organization_id: entry.organization_id,
      user_id: entry.user_id,
      type: entry.type,
      timestamp: entry.timestamp,
      latitude: entry.latitude,
      longitude: entry.longitude,
      device_info: entry.device_info,
    })
    .select()
    .single()

  if (error) throw error
  return data as TimeEntry
}

export async function getTimeEntries(
  organizationId: string,
  userId: string | null,
  startDate: string,
  endDate: string
): Promise<TimeEntry[]> {
  const supabase = getSupabaseClient()
  let query = supabase
    .from('time_entries')
    .select('*')
    .eq('organization_id', organizationId)
    .gte('timestamp', startDate)
    .lte('timestamp', endDate)
    .order('timestamp', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error || !data) return []
  return data as TimeEntry[]
}

export async function getLastTimeEntry(
  organizationId: string,
  userId: string
): Promise<TimeEntry | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('time_entries')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single()

  if (error || !data) return null
  return data as TimeEntry
}

// ============ INCIDENTS ============
export async function createIncident(incident: Omit<Incident, 'id' | 'created_at' | 'updated_at'>): Promise<Incident> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('incidents')
    .insert({
      organization_id: incident.organization_id,
      user_id: incident.user_id,
      type: incident.type,
      status: incident.status,
      date: incident.date,
      description: incident.description,
      approved_by: incident.approved_by,
      approved_at: incident.approved_at,
    })
    .select()
    .single()

  if (error) throw error
  return data as Incident
}

export async function getIncidents(
  organizationId: string,
  userId: string | null
): Promise<Incident[]> {
  const supabase = getSupabaseClient()
  let query = supabase
    .from('incidents')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query

  if (error || !data) return []
  return data as Incident[]
}

export async function updateIncident(
  incidentId: string,
  updates: Partial<Incident>
): Promise<Incident | null> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('incidents')
    .update(updates)
    .eq('id', incidentId)
    .select()
    .single()

  if (error || !data) return null
  return data as Incident
}

// ============ SCHEDULED TIMES ============
export async function createScheduledTime(
  scheduledTime: Omit<ScheduledTime, 'id' | 'created_at'>
): Promise<ScheduledTime> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('scheduled_times')
    .insert({
      user_id: scheduledTime.user_id,
      organization_id: scheduledTime.organization_id,
      day_of_week: scheduledTime.day_of_week,
      entry_time: scheduledTime.entry_time,
      is_active: scheduledTime.is_active,
    })
    .select()
    .single()

  if (error) throw error
  return data as ScheduledTime
}

export async function getScheduledTimes(
  userId: string,
  organizationId: string
): Promise<ScheduledTime[]> {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase
    .from('scheduled_times')
    .select('*')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('day_of_week', { ascending: true })
    .order('entry_time', { ascending: true })

  if (error || !data) return []
  return data as ScheduledTime[]
}

export async function deleteScheduledTime(scheduledTimeId: string): Promise<boolean> {
  const supabase = getSupabaseClient()
  const { error } = await supabase
    .from('scheduled_times')
    .delete()
    .eq('id', scheduledTimeId)

  return !error
}

// ============ UTILITY FUNCTIONS ============
export async function ensureUserHasOrganization(userId: string): Promise<void> {
  const orgs = await getUserOrganizations(userId)
  if (orgs.length === 0) {
    // Crear restaurante de prueba
    await createOrganization(
      {
        name: 'Restaurante de Prueba',
        address: 'Calle de Prueba, 1, Madrid, España',
        latitude: 40.4168,
        longitude: -3.7038,
        allowed_radius: 75,
        timezone: 'Europe/Madrid',
      },
      userId
    )
  }
}


