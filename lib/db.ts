// Wrapper para elegir entre Mock DB y Supabase
// Cambia USE_SUPABASE en .env.local para alternar

import * as supabaseDb from './supabase-db'
import { mockDb as mockDbInstance } from './mock-db'

const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'

// Log para debug
if (typeof window !== 'undefined') {
  const config = {
    USE_SUPABASE,
    envValue: process.env.NEXT_PUBLIC_USE_SUPABASE,
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    usingSupabase: USE_SUPABASE ? 'SÍ ✅' : 'NO ❌ (usando Mock DB)'
  }
  
  console.log('🔍 [DB] Configuración:', config)
  
  if (!USE_SUPABASE) {
    console.error('❌ [DB] ERROR: Estás usando Mock DB. Los datos NO se guardarán en Supabase.')
    console.error('❌ [DB] Solución: Configura NEXT_PUBLIC_USE_SUPABASE=true en Vercel y haz redeploy')
  } else {
    console.log('✅ [DB] Usando Supabase correctamente')
  }
}

// Crear objeto mockDb compatible según la configuración
export const mockDb = USE_SUPABASE ? {
  // Users
  getUserById: supabaseDb.getUserById,
  getUserByEmail: supabaseDb.getUserByEmail,
  createUser: supabaseDb.createUser,
  updateUser: supabaseDb.updateUser,
  deleteUser: supabaseDb.deleteUser,
  getAllUsers: async () => {
    const { createClient } = await import('@/lib/supabase/client-dev')
    const supabase = createClient()
    const { data } = await supabase.from('users').select('*')
    return (data || []) as any[]
  },
  
  // Organizations
  getOrganizationById: supabaseDb.getOrganizationById,
  getUserOrganizations: supabaseDb.getUserOrganizations,
  createOrganization: supabaseDb.createOrganization,
  updateOrganization: supabaseDb.updateOrganization,
  deleteOrganization: supabaseDb.deleteOrganization,
  ensureUserHasOrganization: supabaseDb.ensureUserHasOrganization,
  
  // Organization Members
  getOrganizationMembers: supabaseDb.getOrganizationMembers,
  getUserRoleInOrganization: supabaseDb.getUserRoleInOrganization,
  addMemberToOrganization: supabaseDb.addMemberToOrganization,
  updateMemberRole: supabaseDb.updateMemberRole,
  
  // Time Entries
  createTimeEntry: supabaseDb.createTimeEntry,
  getTimeEntries: supabaseDb.getTimeEntries,
  getLastTimeEntry: supabaseDb.getLastTimeEntry,
  
  // Incidents
  createIncident: supabaseDb.createIncident,
  getIncidents: supabaseDb.getIncidents,
  updateIncident: supabaseDb.updateIncident,
  
  // Scheduled Times
  createScheduledTime: supabaseDb.createScheduledTime,
  getScheduledTimes: supabaseDb.getScheduledTimes,
  deleteScheduledTime: supabaseDb.deleteScheduledTime,
} : mockDbInstance

// Re-exportar funciones individuales como wrappers
// Solo exportar las que existen en ambos módulos
export const getUserById = USE_SUPABASE ? supabaseDb.getUserById : (...args: Parameters<typeof mockDbInstance.getUserById>) => mockDbInstance.getUserById(...args)
export const getUserByEmail = USE_SUPABASE ? supabaseDb.getUserByEmail : (...args: Parameters<typeof mockDbInstance.getUserByEmail>) => mockDbInstance.getUserByEmail(...args)
export const createUser = USE_SUPABASE ? supabaseDb.createUser : (...args: Parameters<typeof mockDbInstance.createUser>) => mockDbInstance.createUser(...args)
export const updateUser = USE_SUPABASE ? supabaseDb.updateUser : (...args: Parameters<typeof mockDbInstance.updateUser>) => mockDbInstance.updateUser(...args)
export const deleteUser = USE_SUPABASE ? supabaseDb.deleteUser : (...args: Parameters<typeof mockDbInstance.deleteUser>) => mockDbInstance.deleteUser(...args)
export const getAllUsers = USE_SUPABASE ? (async () => {
  // En Supabase, obtener todos los usuarios
  const { createClient } = await import('@/lib/supabase/client-dev')
  const supabase = createClient()
  const { data } = await supabase.from('users').select('*')
  return (data || []) as any[]
}) : (...args: Parameters<typeof mockDbInstance.getAllUsers>) => mockDbInstance.getAllUsers(...args)
export const getOrganizationById = USE_SUPABASE ? supabaseDb.getOrganizationById : (...args: Parameters<typeof mockDbInstance.getOrganizationById>) => mockDbInstance.getOrganizationById(...args)
export const getUserOrganizations = USE_SUPABASE ? supabaseDb.getUserOrganizations : (...args: Parameters<typeof mockDbInstance.getUserOrganizations>) => mockDbInstance.getUserOrganizations(...args)
export const createOrganization = USE_SUPABASE ? supabaseDb.createOrganization : (...args: Parameters<typeof mockDbInstance.createOrganization>) => mockDbInstance.createOrganization(...args)
export const updateOrganization = USE_SUPABASE ? supabaseDb.updateOrganization : (...args: Parameters<typeof mockDbInstance.updateOrganization>) => mockDbInstance.updateOrganization(...args)
export const deleteOrganization = USE_SUPABASE ? supabaseDb.deleteOrganization : (...args: Parameters<typeof mockDbInstance.deleteOrganization>) => mockDbInstance.deleteOrganization(...args)
export const ensureUserHasOrganization = USE_SUPABASE ? supabaseDb.ensureUserHasOrganization : (...args: Parameters<typeof mockDbInstance.ensureUserHasOrganization>) => mockDbInstance.ensureUserHasOrganization(...args)
export const getOrganizationMembers = USE_SUPABASE ? supabaseDb.getOrganizationMembers : (...args: Parameters<typeof mockDbInstance.getOrganizationMembers>) => mockDbInstance.getOrganizationMembers(...args)
export const getUserRoleInOrganization = USE_SUPABASE ? supabaseDb.getUserRoleInOrganization : (...args: Parameters<typeof mockDbInstance.getUserRoleInOrganization>) => mockDbInstance.getUserRoleInOrganization(...args)
export const addMemberToOrganization = USE_SUPABASE ? supabaseDb.addMemberToOrganization : (...args: Parameters<typeof mockDbInstance.addMemberToOrganization>) => mockDbInstance.addMemberToOrganization(...args)
export const updateMemberRole = USE_SUPABASE ? supabaseDb.updateMemberRole : (...args: Parameters<typeof mockDbInstance.updateMemberRole>) => mockDbInstance.updateMemberRole(...args)
export const createTimeEntry = USE_SUPABASE ? supabaseDb.createTimeEntry : (...args: Parameters<typeof mockDbInstance.createTimeEntry>) => mockDbInstance.createTimeEntry(...args)
export const getTimeEntries = USE_SUPABASE ? supabaseDb.getTimeEntries : (...args: Parameters<typeof mockDbInstance.getTimeEntries>) => mockDbInstance.getTimeEntries(...args)
export const getLastTimeEntry = USE_SUPABASE ? supabaseDb.getLastTimeEntry : (...args: Parameters<typeof mockDbInstance.getLastTimeEntry>) => mockDbInstance.getLastTimeEntry(...args)
export const createIncident = USE_SUPABASE ? supabaseDb.createIncident : (...args: Parameters<typeof mockDbInstance.createIncident>) => mockDbInstance.createIncident(...args)
export const getIncidents = USE_SUPABASE ? supabaseDb.getIncidents : (...args: Parameters<typeof mockDbInstance.getIncidents>) => mockDbInstance.getIncidents(...args)
// updateIncident puede no existir en mock-db, usar updateIncidentStatus si existe
export const updateIncident = USE_SUPABASE ? supabaseDb.updateIncident : (...args: Parameters<typeof mockDbInstance.updateIncident>) => mockDbInstance.updateIncident(...args)
export const createScheduledTime = USE_SUPABASE ? supabaseDb.createScheduledTime : (...args: Parameters<typeof mockDbInstance.createScheduledTime>) => mockDbInstance.createScheduledTime(...args)
export const getScheduledTimes = USE_SUPABASE ? supabaseDb.getScheduledTimes : (...args: Parameters<typeof mockDbInstance.getScheduledTimes>) => mockDbInstance.getScheduledTimes(...args)
export const deleteScheduledTime = USE_SUPABASE ? supabaseDb.deleteScheduledTime : (...args: Parameters<typeof mockDbInstance.deleteScheduledTime>) => mockDbInstance.deleteScheduledTime(...args)
