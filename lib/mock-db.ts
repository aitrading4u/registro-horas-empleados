// Base de datos mock en memoria para desarrollo local
// Se reemplazará con Supabase cuando esté listo

import type {
  User,
  Organization,
  OrganizationMember,
  TimeEntry,
  Incident,
  ScheduledTime,
  UserRole,
  TimeEntryType,
  IncidentType,
  IncidentStatus,
} from '@/types'

class MockDatabase {
  private users: Map<string, User> = new Map()
  private organizations: Map<string, Organization> = new Map()
  private organizationMembers: Map<string, OrganizationMember> = new Map()
  private timeEntries: Map<string, TimeEntry> = new Map()
  private incidents: Map<string, Incident> = new Map()
  private scheduledTimes: Map<string, ScheduledTime> = new Map()

  // Inicializar con datos de ejemplo
  constructor() {
    this.loadFromStorage()
    this.initializeMockData()
  }

  // Cargar datos desde localStorage si existen
  private loadFromStorage() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('mock_db_data')
      if (stored) {
        const data = JSON.parse(stored)
        if (data.users) this.users = new Map(data.users)
        if (data.organizations) this.organizations = new Map(data.organizations)
        if (data.organizationMembers) this.organizationMembers = new Map(data.organizationMembers)
        if (data.timeEntries) this.timeEntries = new Map(data.timeEntries)
        if (data.incidents) this.incidents = new Map(data.incidents)
        if (data.scheduledTimes) this.scheduledTimes = new Map(data.scheduledTimes)
        return // Si hay datos guardados, no inicializar con datos de ejemplo
      }
    } catch (error) {
      console.error('Error loading from storage:', error)
    }
  }

  // Guardar datos en localStorage
  private saveToStorage() {
    if (typeof window === 'undefined') return

    try {
      const data = {
        users: Array.from(this.users.entries()),
        organizations: Array.from(this.organizations.entries()),
        organizationMembers: Array.from(this.organizationMembers.entries()),
        timeEntries: Array.from(this.timeEntries.entries()),
        incidents: Array.from(this.incidents.entries()),
        scheduledTimes: Array.from(this.scheduledTimes.entries()),
      }
      localStorage.setItem('mock_db_data', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving to storage:', error)
    }
  }

  private initializeMockData() {
    // Solo inicializar si no hay datos guardados
    if (this.organizations.size > 0) return

    // Usuario de ejemplo
    const user1: User = {
      id: 'user-1',
      email: 'admin@restaurante.com',
      full_name: 'Admin Principal',
      created_at: new Date().toISOString(),
    }
    this.users.set(user1.id, user1)

    // Restaurante de ejemplo
    const org1: Organization = {
      id: 'org-1',
      name: 'Restaurante El Buen Sabor',
      address: 'Calle Principal 123, Madrid',
      latitude: 40.4168,
      longitude: -3.7038,
      allowed_radius: 75,
      timezone: 'Europe/Madrid',
      created_at: new Date().toISOString(),
      created_by: user1.id,
    }
    this.organizations.set(org1.id, org1)

    // Miembro de la organización
    const member1: OrganizationMember = {
      id: 'member-1',
      organization_id: org1.id,
      user_id: user1.id,
      role: 'ADMIN',
      created_at: new Date().toISOString(),
    }
    this.organizationMembers.set(member1.id, member1)
    
    this.saveToStorage()
  }

  // Crear restaurante de prueba para un usuario
  async ensureUserHasOrganization(userId: string): Promise<Organization> {
    const existingOrgs = await this.getUserOrganizations(userId)
    if (existingOrgs.length > 0) {
      return existingOrgs[0]
    }

    // Crear restaurante de prueba automáticamente
    const testOrg = await this.createOrganization(
      {
        name: 'Restaurante de Prueba',
        address: 'Calle de Prueba 123, Madrid',
        latitude: 40.4168,
        longitude: -3.7038,
        allowed_radius: 75,
        timezone: 'Europe/Madrid',
      },
      userId
    )

    return testOrg
  }

  // ============ USERS ============
  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user
    }
    return null
  }

  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    }
    this.users.set(newUser.id, newUser)
    this.saveToStorage()
    return newUser
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
    const user = this.users.get(userId)
    if (!user) return null

    const updated: User = { ...user, ...updates }
    this.users.set(userId, updated)
    this.saveToStorage()
    return updated
  }

  async deleteUser(userId: string): Promise<boolean> {
    if (!this.users.has(userId)) return false
    
    // Eliminar también los miembros de organizaciones
    const members = Array.from(this.organizationMembers.values())
      .filter(m => m.user_id === userId)
    members.forEach(m => this.organizationMembers.delete(m.id))
    
    // Eliminar fichajes del usuario
    const userEntries = Array.from(this.timeEntries.values())
      .filter(e => e.user_id === userId)
    userEntries.forEach(e => this.timeEntries.delete(e.id))
    
    // Eliminar incidencias del usuario
    const userIncidents = Array.from(this.incidents.values())
      .filter(i => i.user_id === userId)
    userIncidents.forEach(i => this.incidents.delete(i.id))
    
    // Eliminar horarios programados del usuario
    const userScheduled = Array.from(this.scheduledTimes.values())
      .filter(s => s.user_id === userId)
    userScheduled.forEach(s => this.scheduledTimes.delete(s.id))
    
    this.users.delete(userId)
    this.saveToStorage()
    return true
  }

  // ============ ORGANIZATIONS ============
  async getOrganizationById(id: string): Promise<Organization | null> {
    return this.organizations.get(id) || null
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const memberIds = Array.from(this.organizationMembers.values())
      .filter(m => m.user_id === userId)
      .map(m => m.organization_id)
    
    return Array.from(this.organizations.values())
      .filter(org => memberIds.includes(org.id))
  }

  async createOrganization(
    org: Omit<Organization, 'id' | 'created_at' | 'created_by'>,
    creatorUserId: string
  ): Promise<Organization> {
    const newOrg: Organization = {
      ...org,
      id: `org-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      created_by: creatorUserId,
    }
    this.organizations.set(newOrg.id, newOrg)

    // Crear miembro ADMIN automáticamente
    const member: OrganizationMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      organization_id: newOrg.id,
      user_id: creatorUserId,
      role: 'ADMIN',
      created_at: new Date().toISOString(),
    }
    this.organizationMembers.set(member.id, member)
    
    this.saveToStorage()
    return newOrg
  }

  async updateOrganization(
    organizationId: string,
    updates: Partial<Omit<Organization, 'id' | 'created_at' | 'created_by'>>
  ): Promise<Organization | null> {
    const org = this.organizations.get(organizationId)
    if (!org) return null

    const updatedOrg: Organization = {
      ...org,
      ...updates,
    }
    this.organizations.set(organizationId, updatedOrg)
    this.saveToStorage()
    return updatedOrg
  }

  async deleteOrganization(organizationId: string): Promise<boolean> {
    if (!this.organizations.has(organizationId)) return false
    
    // Eliminar miembros de la organización
    const members = Array.from(this.organizationMembers.values())
      .filter(m => m.organization_id === organizationId)
    members.forEach(m => this.organizationMembers.delete(m.id))
    
    // Eliminar fichajes de la organización
    const orgEntries = Array.from(this.timeEntries.values())
      .filter(e => e.organization_id === organizationId)
    orgEntries.forEach(e => this.timeEntries.delete(e.id))
    
    // Eliminar incidencias de la organización
    const orgIncidents = Array.from(this.incidents.values())
      .filter(i => i.organization_id === organizationId)
    orgIncidents.forEach(i => this.incidents.delete(i.id))
    
    // Eliminar horarios programados de la organización
    const orgScheduled = Array.from(this.scheduledTimes.values())
      .filter(s => s.organization_id === organizationId)
    orgScheduled.forEach(s => this.scheduledTimes.delete(s.id))
    
    // Eliminar la organización
    this.organizations.delete(organizationId)
    this.saveToStorage()
    return true
  }

  // ============ ORGANIZATION MEMBERS ============
  async getOrganizationMembers(organizationId: string): Promise<OrganizationMember[]> {
    return Array.from(this.organizationMembers.values())
      .filter(m => m.organization_id === organizationId)
  }

  async getUserRoleInOrganization(
    userId: string,
    organizationId: string
  ): Promise<UserRole | null> {
    const member = Array.from(this.organizationMembers.values())
      .find(m => m.user_id === userId && m.organization_id === organizationId)
    return member?.role || null
  }

  async updateMemberRole(
    userId: string,
    organizationId: string,
    newRole: UserRole
  ): Promise<boolean> {
    const member = Array.from(this.organizationMembers.values()).find(
      m => m.user_id === userId && m.organization_id === organizationId
    )
    if (!member) return false

    const updated: OrganizationMember = { ...member, role: newRole }
    this.organizationMembers.set(member.id, updated)
    this.saveToStorage()
    return true
  }

  async addMemberToOrganization(
    organizationId: string,
    userId: string,
    role: UserRole
  ): Promise<OrganizationMember> {
    const member: OrganizationMember = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      organization_id: organizationId,
      user_id: userId,
      role,
      created_at: new Date().toISOString(),
    }
    this.organizationMembers.set(member.id, member)
    this.saveToStorage()
    return member
  }

  // ============ TIME ENTRIES ============
  async createTimeEntry(
    entry: Omit<TimeEntry, 'id' | 'created_at'>
  ): Promise<TimeEntry> {
    const newEntry: TimeEntry = {
      ...entry,
      id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    }
    this.timeEntries.set(newEntry.id, newEntry)
    this.saveToStorage()
    return newEntry
  }

  async getTimeEntries(
    organizationId: string,
    userId?: string,
    startDate?: string,
    endDate?: string
  ): Promise<TimeEntry[]> {
    let entries = Array.from(this.timeEntries.values())
      .filter(e => e.organization_id === organizationId)

    if (userId) {
      entries = entries.filter(e => e.user_id === userId)
    }

    if (startDate) {
      entries = entries.filter(e => e.timestamp >= startDate)
    }

    if (endDate) {
      entries = entries.filter(e => e.timestamp <= endDate)
    }

    return entries.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }

  async getLastTimeEntry(
    organizationId: string,
    userId: string
  ): Promise<TimeEntry | null> {
    const entries = await this.getTimeEntries(organizationId, userId)
    return entries[0] || null
  }

  // ============ INCIDENTS ============
  async createIncident(
    incident: Omit<Incident, 'id' | 'created_at' | 'status' | 'reviewed_by' | 'reviewed_at'>
  ): Promise<Incident> {
    // Validar que la descripción no esté vacía
    if (!incident.description || !incident.description.trim()) {
      throw new Error('La descripción es obligatoria')
    }

    const newIncident: Incident = {
      ...incident,
      description: incident.description.trim(), // Asegurar que no tenga espacios al inicio/final
      id: `incident-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'PENDING',
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
    }
    this.incidents.set(newIncident.id, newIncident)
    this.saveToStorage()
    return newIncident
  }

  async getIncidents(
    organizationId: string,
    userId?: string,
    status?: IncidentStatus
  ): Promise<Incident[]> {
    let incidents = Array.from(this.incidents.values())
      .filter(i => i.organization_id === organizationId)

    if (userId) {
      incidents = incidents.filter(i => i.user_id === userId)
    }

    if (status) {
      incidents = incidents.filter(i => i.status === status)
    }

    // Asegurar que todas las incidencias tengan descripción (migración de datos antiguos)
    incidents = incidents.map(incident => ({
      ...incident,
      description: incident.description || 'Sin descripción',
    }))

    return incidents.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  async updateIncident(
    incidentId: string,
    updates: Partial<Incident>
  ): Promise<Incident | null> {
    const incident = this.incidents.get(incidentId)
    if (!incident) return null

    const updated: Incident = {
      ...incident,
      ...updates,
      reviewed_at: updates.status && updates.status !== 'PENDING' ? new Date().toISOString() : incident.reviewed_at,
    }
    this.incidents.set(incidentId, updated)
    this.saveToStorage()
    return updated
  }

  async updateIncidentStatus(
    incidentId: string,
    status: IncidentStatus,
    reviewedBy: string
  ): Promise<Incident | null> {
    return this.updateIncident(incidentId, {
      status,
      reviewed_by: reviewedBy,
    })
  }

  // ============ SCHEDULED TIMES ============
  async createScheduledTime(
    scheduledTime: Omit<ScheduledTime, 'id' | 'created_at'>
  ): Promise<ScheduledTime> {
    const newScheduled: ScheduledTime = {
      ...scheduledTime,
      id: `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
    }
    this.scheduledTimes.set(newScheduled.id, newScheduled)
    this.saveToStorage()
    return newScheduled
  }

  async getScheduledTimes(
    userId: string,
    organizationId: string
  ): Promise<ScheduledTime[]> {
    return Array.from(this.scheduledTimes.values())
      .filter(st => st.user_id === userId && st.organization_id === organizationId && st.is_active)
      .sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) {
          return a.day_of_week - b.day_of_week
        }
        return a.entry_time.localeCompare(b.entry_time)
      })
  }

  async deleteScheduledTime(scheduledTimeId: string): Promise<boolean> {
    if (!this.scheduledTimes.has(scheduledTimeId)) return false
    this.scheduledTimes.delete(scheduledTimeId)
    this.saveToStorage()
    return true
  }

  async updateScheduledTime(
    scheduledTimeId: string,
    updates: Partial<ScheduledTime>
  ): Promise<ScheduledTime | null> {
    const scheduled = this.scheduledTimes.get(scheduledTimeId)
    if (!scheduled) return null

    const updated: ScheduledTime = { ...scheduled, ...updates }
    this.scheduledTimes.set(scheduledTimeId, updated)
    this.saveToStorage()
    return updated
  }
}

// Singleton instance
export const mockDb = new MockDatabase()

