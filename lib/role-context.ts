// Utilidades para trabajar con roles en la aplicación

import { getCurrentRoleMock, getUserRoleInOrganizationMock } from './auth-mock'
import { getCurrentUserMock } from './auth-mock'
import type { UserRole } from '@/types'

export async function getCurrentRole(): Promise<UserRole> {
  const role = await getCurrentRoleMock()
  return role || 'EMPLOYEE'
}

export async function getUserRoleInOrganization(
  organizationId: string
): Promise<UserRole | null> {
  const user = await getCurrentUserMock()
  if (!user) return null
  
  return await getUserRoleInOrganizationMock(user.id, organizationId)
}

export function canManageOrganization(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MANAGER'
}

export function canApproveIncidents(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'MANAGER'
}

export function canCreateOrganization(role: UserRole): boolean {
  return role === 'ADMIN'
}


