// Funciones para interactuar con Supabase
// Reemplaza el mock-db.ts cuando estés listo para usar Supabase real

// Usar cliente de desarrollo que bypass RLS
import { createClient } from '@/lib/supabase/client-dev'
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
  
  console.log('🔵 [Supabase] Creando usuario:', {
    email: user.email,
    full_name: user.full_name,
    hasPassword: !!user.password_hash,
  })
  
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: user.email,
      full_name: user.full_name,
      password_hash: user.password_hash,
    })
    .select()
    .single()

  if (error) {
    console.error('❌ [Supabase] Error al crear usuario:', error)
    throw error
  }
  
  if (!data) {
    throw new Error('Usuario creado pero no se retornó ningún dato')
  }
  
  console.log('✅ [Supabase] Usuario creado exitosamente:', {
    id: data.id,
    email: data.email,
    full_name: data.full_name,
  })
  
  // Verificar que el usuario realmente se guardó en la base de datos
  // Esperar un momento para que la transacción se complete
  await new Promise(resolve => setTimeout(resolve, 100))
  
  const { data: verifyUser, error: verifyError } = await supabase
    .from('users')
    .select('id')
    .eq('id', data.id)
    .single()
  
  if (verifyError || !verifyUser) {
    console.error('❌ [Supabase] Usuario creado pero no se encuentra en la BD:', {
      userId: data.id,
      error: verifyError,
    })
    throw new Error('Usuario creado pero no se pudo verificar en la base de datos')
  }
  
  console.log('✅ [Supabase] Usuario verificado en la base de datos:', verifyUser.id)
  
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
  
  // Verificar que el userId sea un UUID válido (no un ID de Mock DB)
  if (creatorUserId.startsWith('user-') || creatorUserId.startsWith('org-')) {
    throw new Error(`ID inválido: ${creatorUserId}. Debe ser un UUID de Supabase, no un ID de Mock DB.`)
  }
  
  console.log('🔵 [Supabase] Creando organización...', {
    org,
    creatorUserId,
    isUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(creatorUserId),
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
  })
  
  // Preparar datos para insertar
  const insertData: any = {
    name: org.name,
    address: org.address || null,
    latitude: Number(org.latitude),
    longitude: Number(org.longitude),
    allowed_radius: org.allowed_radius || 75,
    timezone: org.timezone || 'Europe/Madrid',
    created_by: creatorUserId,
  }
  
  console.log('🔵 [Supabase] Datos a insertar:', JSON.stringify(insertData, null, 2))
  console.log('🔵 [Supabase] Tipos de datos:', {
    latitude: typeof insertData.latitude,
    longitude: typeof insertData.longitude,
    created_by: typeof insertData.created_by,
    created_by_value: insertData.created_by,
  })
  
  // Crear organización
  const { data: newOrg, error: orgError } = await supabase
    .from('organizations')
    .insert(insertData)
    .select()
    .single()

  if (orgError) {
    console.error('❌ [Supabase] Error al crear organización:', orgError)
    console.error('❌ [Supabase] Código de error:', orgError.code)
    console.error('❌ [Supabase] Mensaje:', orgError.message)
    console.error('❌ [Supabase] Detalles:', orgError.details)
    console.error('❌ [Supabase] Hint:', orgError.hint)
    console.error('❌ [Supabase] Datos enviados:', JSON.stringify(insertData, null, 2))
    
    // Si es error 400, puede ser problema de tipos o RLS
    if (orgError.code === 'PGRST116' || orgError.message?.includes('RLS')) {
      console.error('❌ [Supabase] Posible problema de RLS. Verifica que RLS esté desactivado en Supabase.')
    }
    
    throw orgError
  }

  console.log('✅ [Supabase] Organización creada:', newOrg)

  // Crear miembro ADMIN automáticamente
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: newOrg.id,
      user_id: creatorUserId,
      role: 'ADMIN',
    })

  if (memberError) {
    console.error('❌ [Supabase] Error al crear miembro:', memberError)
    // No lanzamos error aquí, la organización ya se creó
  } else {
    console.log('✅ [Supabase] Miembro ADMIN creado')
  }

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
  
  // Validar que el tipo sea uno de los permitidos
  const allowedTypes = ['FORGOT_ENTRY', 'LATE_ARRIVAL', 'NOT_WORKING']
  if (!allowedTypes.includes(incident.type)) {
    throw new Error(`Tipo de incidencia inválido: ${incident.type}. Debe ser uno de: ${allowedTypes.join(', ')}`)
  }
  
  // Validar que el status sea uno de los permitidos
  const allowedStatuses = ['PENDING', 'APPROVED', 'REJECTED']
  if (!allowedStatuses.includes(incident.status)) {
    throw new Error(`Estado de incidencia inválido: ${incident.status}. Debe ser uno de: ${allowedStatuses.join(', ')}`)
  }
  
  console.log('🔵 [Supabase] Creando incidencia:', {
    type: incident.type,
    status: incident.status,
    date: incident.date,
    hasDescription: !!incident.description,
  })
  
  const insertData = {
    organization_id: incident.organization_id,
    user_id: incident.user_id,
    type: incident.type,
    status: incident.status,
    date: incident.date,
    description: incident.description,
    time_entry_id: incident.time_entry_id || null,
    approved_by: incident.reviewed_by || null,
    approved_at: incident.reviewed_at || null,
  }
  
  console.log('🔵 [Supabase] Datos a insertar:', JSON.stringify(insertData, null, 2))
  
  const { data, error } = await supabase
    .from('incidents')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('❌ [Supabase] Error al crear incidencia:', error)
    console.error('❌ [Supabase] Detalles:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    })
    throw error
  }
  
  // Mapear los campos de la base de datos al tipo TypeScript
  const result = data as any
  return {
    ...result,
    reviewed_by: result.approved_by,
    reviewed_at: result.approved_at,
  } as Incident
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
  // Mapear los campos de la base de datos al tipo TypeScript
  return (data as any[]).map(item => ({
    ...item,
    reviewed_by: item.approved_by,
    reviewed_at: item.approved_at,
  })) as Incident[]
}

export async function updateIncident(
  incidentId: string,
  updates: Partial<Incident>
): Promise<Incident | null> {
  const supabase = getSupabaseClient()
  
  // Mapear los campos del tipo TypeScript a los campos de la base de datos
  const dbUpdates: any = { ...updates }
  if ('reviewed_by' in updates) {
    dbUpdates.approved_by = updates.reviewed_by
    delete dbUpdates.reviewed_by
  }
  if ('reviewed_at' in updates) {
    dbUpdates.approved_at = updates.reviewed_at
    delete dbUpdates.reviewed_at
  }
  
  const { data, error } = await supabase
    .from('incidents')
    .update(dbUpdates)
    .eq('id', incidentId)
    .select()
    .single()

  if (error || !data) return null
  
  // Mapear los campos de la base de datos al tipo TypeScript
  const result = data as any
  return {
    ...result,
    reviewed_by: result.approved_by,
    reviewed_at: result.approved_at,
  } as Incident
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
    // Verificar que el usuario existe antes de crear la organización
    const supabase = getSupabaseClient()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()
    
    if (userError || !user) {
      console.error('❌ [ensureUserHasOrganization] Usuario no encontrado:', {
        userId,
        error: userError,
      })
      throw new Error(`Usuario con ID ${userId} no existe en la base de datos. No se puede crear la organización.`)
    }
    
    console.log('✅ [ensureUserHasOrganization] Usuario verificado:', userId)
    
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

