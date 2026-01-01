// Sistema de autenticación mock para desarrollo local
// Se reemplazará con Supabase Auth cuando esté listo

import { mockDb } from './db'
import type { User, UserRole } from '@/types'

// Simular sesión en memoria (en producción será con cookies/tokens)
let currentSession: { user: User; currentRole?: UserRole } | null = null

export async function signInMock(email: string, password: string): Promise<{ user: User } | null> {
  // Buscar usuario por email
  let user = await mockDb.getUserByEmail(email)
  
  if (!user) {
    // Si no existe, crear usuario automáticamente (solo para desarrollo/admin)
    // En producción esto no debería pasar
    user = await mockDb.createUser({
      email,
      full_name: email.split('@')[0],
      password_hash: password, // En producción esto será un hash
    })
  } else {
    // Verificar contraseña si el usuario tiene una
    if (user.password_hash && user.password_hash !== password) {
      return null // Contraseña incorrecta
    }
  }

  // Si estamos usando Supabase y el usuario tiene un ID de Mock DB, migrarlo a Supabase
  const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'
  if (USE_SUPABASE && user.id.startsWith('user-')) {
    console.log('🔄 [Auth] Usuario con ID Mock DB detectado, migrando a Supabase...', user.id)
    
    // Buscar si ya existe en Supabase por email
    const supabaseUser = await mockDb.getUserByEmail(email)
    
    if (supabaseUser && !supabaseUser.id.startsWith('user-')) {
      // Ya existe en Supabase con UUID válido
      console.log('✅ [Auth] Usuario ya existe en Supabase:', supabaseUser.id)
      user = supabaseUser
    } else {
      // Crear en Supabase para obtener UUID válido
      try {
        const newSupabaseUser = await mockDb.createUser({
          email: user.email,
          full_name: user.full_name || email.split('@')[0],
          password_hash: user.password_hash || password,
        })
        console.log('✅ [Auth] Usuario migrado a Supabase:', newSupabaseUser.id)
        user = newSupabaseUser
      } catch (error) {
        console.error('❌ [Auth] Error al migrar usuario a Supabase:', error)
        // Continuar con el usuario de Mock DB si falla
      }
    }
  }

  // Asegurar que el usuario tenga al menos un restaurante asignado
  await mockDb.ensureUserHasOrganization(user.id)

  currentSession = { user }
  
  // Guardar sesión en localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_session', JSON.stringify(currentSession))
    
    // Guardar credenciales para "recordar usuario" (opcional, solo si el usuario lo permite)
    // Por ahora, guardamos solo el email para facilitar el login
    localStorage.setItem('saved_email', email)
  }

  return currentSession
}

export async function signOutMock(): Promise<void> {
  currentSession = null
  if (typeof window !== 'undefined') {
    localStorage.removeItem('mock_session')
  }
}

export async function getCurrentUserMock(): Promise<User | null> {
  // Intentar recuperar de memoria
  if (currentSession) {
    // Si estamos usando Supabase y el usuario tiene ID de Mock DB, migrarlo
    const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'
    if (USE_SUPABASE && currentSession.user.id.startsWith('user-')) {
      const supabaseUser = await mockDb.getUserByEmail(currentSession.user.email)
      if (supabaseUser && !supabaseUser.id.startsWith('user-')) {
        currentSession.user = supabaseUser
        if (typeof window !== 'undefined') {
          localStorage.setItem('mock_session', JSON.stringify(currentSession))
        }
      }
    }
    return currentSession.user
  }

  // Intentar recuperar de localStorage (solo cliente)
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mock_session')
    if (stored) {
      try {
        const session = JSON.parse(stored)
        currentSession = session
        
        // Si estamos usando Supabase y el usuario tiene ID de Mock DB, migrarlo
        const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'
        if (USE_SUPABASE && session.user && session.user.id && session.user.id.startsWith('user-')) {
          const supabaseUser = await mockDb.getUserByEmail(session.user.email)
          if (supabaseUser && !supabaseUser.id.startsWith('user-')) {
            session.user = supabaseUser
            currentSession = session
            localStorage.setItem('mock_session', JSON.stringify(currentSession))
            return supabaseUser
          }
        }
        
        return session.user
      } catch {
        // Ignorar error
      }
    }
  }

  return null
}

export async function requireAuthMock(): Promise<User> {
  const user = await getCurrentUserMock()
  if (!user) {
    throw new Error('No autenticado')
  }
  return user
}

// Obtener el rol actual del usuario (para desarrollo)
export async function getCurrentRoleMock(): Promise<UserRole> {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mock_current_role')
    if (stored && (stored === 'EMPLOYEE' || stored === 'MANAGER' || stored === 'ADMIN')) {
      return stored as UserRole
    }
  }
  
  // Por defecto, si el usuario tiene organizaciones, usar el primer rol
  const user = await getCurrentUserMock()
  if (user) {
    const orgs = await mockDb.getUserOrganizations(user.id)
    if (orgs.length > 0) {
      const role = await mockDb.getUserRoleInOrganization(user.id, orgs[0].id)
      if (role) {
        setCurrentRoleMock(role)
        return role
      }
    }
  }
  
  // Si no hay rol guardado, usar EMPLOYEE por defecto
  const defaultRole: UserRole = 'EMPLOYEE'
  setCurrentRoleMock(defaultRole)
  return defaultRole
}

// Establecer el rol actual (para desarrollo)
export function setCurrentRoleMock(role: UserRole): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_current_role', role)
    if (currentSession) {
      currentSession.currentRole = role
    }
  }
}

// Obtener rol del usuario en una organización específica
export async function getUserRoleInOrganizationMock(
  userId: string,
  organizationId: string
): Promise<UserRole | null> {
  return await mockDb.getUserRoleInOrganization(userId, organizationId)
}

