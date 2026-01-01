import { mockDb } from './db'
import type { Organization } from '@/types'

export async function getUserOrganizations(userId: string): Promise<Organization[]> {
  return await mockDb.getUserOrganizations(userId)
}

export async function getOrganizationById(id: string): Promise<Organization | null> {
  return await mockDb.getOrganizationById(id)
}

