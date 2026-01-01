'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserMock } from '@/lib/auth-mock'
import { getUserOrganizations } from '@/lib/organizations'
import { mockDb } from '@/lib/db'
import { getCurrentRole, canManageOrganization } from '@/lib/role-context'
import type { User, Organization, UserRole } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDate, getRoleLabel } from '@/lib/utils'
import { UserPlus, Edit, Trash2, Mail, User as UserIcon, Clock, Plus, X, Users } from 'lucide-react'
import type { ScheduledTime } from '@/types'
import { getAllUsers } from '@/lib/db'

export default function StaffPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [staff, setStaff] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<User | null>(null)
  const [currentRole, setCurrentRole] = useState<UserRole>('EMPLOYEE')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      loadStaff()
    }
  }, [selectedOrg])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUserMock()
      if (!currentUser) {
        router.push('/login')
        return
      }

      const role = await getCurrentRole()
      setCurrentRole(role)

      // Solo ADMIN y MANAGER pueden ver esta página
      if (!canManageOrganization(role)) {
        router.push('/dashboard')
        return
      }

      setUser(currentUser)
      const orgs = await getUserOrganizations(currentUser.id)
      setOrganizations(orgs)
      
      if (orgs.length > 0) {
        setSelectedOrg(orgs[0])
      }
    } catch (error) {
      console.error('Error loading data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadStaff = async () => {
    if (!selectedOrg) return

    try {
      // Obtener todos los usuarios que pertenecen a esta organización
      const members = await mockDb.getOrganizationMembers(selectedOrg.id)
      const userIds = members.map(m => m.user_id)
      
      // Obtener información de cada usuario
      const users = await Promise.all(
        userIds.map(id => mockDb.getUserById(id))
      )
      
      const validUsers = users.filter(u => u !== null) as User[]
      setStaff(validUsers)
    } catch (error) {
      console.error('Error loading staff:', error)
      setStaff([])
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este trabajador?\n\nEsta acción eliminará:\n- Todos los fichajes del trabajador\n- Todas las incidencias del trabajador\n- Todos los horarios programados\n- La relación con el restaurante\n\nEsta acción NO se puede deshacer.')) {
      return
    }

    try {
      const success = await mockDb.deleteUser(userId)
      if (success) {
        await loadStaff()
        alert('Trabajador eliminado correctamente')
      } else {
        alert('Error al eliminar el trabajador')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Error al eliminar el trabajador')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    )
  }

  if (organizations.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <p className="text-center text-gray-600 py-8">
            No tienes restaurantes asignados.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Personal</h1>
          <p className="text-sm text-gray-600 mt-1">
            Gestiona los empleados de tu restaurante
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <UserPlus className="w-4 h-4 mr-2" />
          {showCreateForm ? 'Cancelar' : 'Nuevo Empleado'}
        </Button>
      </div>

      {organizations.length > 1 && (
        <Card className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurante
          </label>
          <select
            value={selectedOrg?.id || ''}
            onChange={(e) => {
              const org = organizations.find(o => o.id === e.target.value)
              setSelectedOrg(org || null)
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </Card>
      )}

      {showCreateForm && selectedOrg && (
        <CreateStaffForm
          organizationId={selectedOrg.id}
          onSuccess={() => {
            setShowCreateForm(false)
            loadStaff()
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingStaff && selectedOrg && (
        <EditStaffForm
          staffMember={editingStaff}
          organizationId={selectedOrg.id}
          onSuccess={() => {
            setEditingStaff(null)
            loadStaff()
          }}
          onCancel={() => setEditingStaff(null)}
        />
      )}

      {staff.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            No hay empleados en este restaurante. Crea uno nuevo o asigna empleados existentes.
          </p>
          {selectedOrg && (
            <div className="text-center mt-4">
              <AssignExistingUsersButton
                organizationId={selectedOrg.id}
                onSuccess={loadStaff}
              />
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staff.map((staffMember) => (
            <StaffCard
              key={staffMember.id}
              staffMember={staffMember}
              organizationId={selectedOrg!.id}
              onDelete={handleDeleteUser}
              onUpdate={loadStaff}
              onEdit={setEditingStaff}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function StaffCard({
  staffMember,
  organizationId,
  onDelete,
  onUpdate,
  onEdit,
}: {
  staffMember: User
  organizationId: string
  onDelete: (userId: string) => void
  onUpdate: () => void
  onEdit: (user: User) => void
}) {
  const [memberRole, setMemberRole] = useState<UserRole | null>(null)

  useEffect(() => {
    loadRole()
  }, [])

  const loadRole = async () => {
    const role = await mockDb.getUserRoleInOrganization(staffMember.id, organizationId)
    setMemberRole(role)
  }

  return (
    <Card>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{staffMember.full_name || 'Sin nombre'}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-3 h-3 mr-1" />
              <span>{staffMember.email}</span>
            </div>
          </div>
        </div>
      </div>

      {memberRole && (
        <div className="mb-3">
          <Badge variant="info">{getRoleLabel(memberRole)}</Badge>
        </div>
      )}

      <div className="text-xs text-gray-500 mb-4">
        Registrado: {formatDate(staffMember.created_at)}
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(staffMember)}
        >
          <Edit className="w-3 h-3 mr-1" />
          Editar
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => onDelete(staffMember.id)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </Card>
  )
}

function CreateStaffForm({
  organizationId,
  onSuccess,
  onCancel,
}: {
  organizationId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    role: 'EMPLOYEE' as UserRole,
  })
  const [schedules, setSchedules] = useState<Array<{ day_of_week: number; entry_time: string }>>([])
  const [loading, setLoading] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [newSchedule, setNewSchedule] = useState({ day_of_week: 1, entry_time: '09:00' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Verificar que el email no exista
      const existingUser = await mockDb.getUserByEmail(formData.email)
      if (existingUser) {
        alert('Este email ya está registrado')
        setLoading(false)
        return
      }

      // Crear usuario con contraseña (en producción esto será un hash)
      const newUser = await mockDb.createUser({
        email: formData.email,
        full_name: formData.full_name,
        password_hash: formData.password, // En producción esto será un hash
      })

      // Agregar usuario a la organización con el rol especificado
      await mockDb.addMemberToOrganization(organizationId, newUser.id, formData.role)

      // Crear horarios programados si los hay
      for (const schedule of schedules) {
        await mockDb.createScheduledTime({
          user_id: newUser.id,
          organization_id: organizationId,
          day_of_week: schedule.day_of_week,
          entry_time: schedule.entry_time,
          is_active: true,
        })
      }

      onSuccess()
    } catch (error) {
      console.error('Error creating staff:', error)
      alert('Error al crear el empleado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold mb-4">Nuevo Empleado</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="juan@restaurante.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña (3 números) *
          </label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]{3}"
            value={formData.password}
            onChange={(e) => {
              // Solo permitir números y máximo 3 dígitos
              const value = e.target.value.replace(/\D/g, '').slice(0, 3)
              setFormData({ ...formData, password: value })
            }}
            required
            minLength={3}
            maxLength={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="123"
          />
          <p className="text-xs text-gray-500 mt-1">
            El empleado usará estos 3 números para iniciar sesión la primera vez
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="EMPLOYEE">Empleado</option>
            <option value="MANAGER">Encargado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        {/* Programación de horarios */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Horarios de Entrada Programados
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowScheduleForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Añadir Horario
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Programa las horas de entrada. Puedes añadir múltiples entradas por día (ej: turno mañana y tarde).
          </p>

          {schedules.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              No hay horarios programados
            </p>
          ) : (
            <div className="space-y-2">
              {schedules.map((schedule, index) => {
                const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{dayNames[schedule.day_of_week]}</span>
                      <span className="text-gray-600">{schedule.entry_time}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSchedules(schedules.filter((_, i) => i !== index))
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {showScheduleForm && (
            <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Día de la Semana
                  </label>
                  <select
                    value={newSchedule.day_of_week}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, day_of_week: parseInt(e.target.value) })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>Domingo</option>
                    <option value={1}>Lunes</option>
                    <option value={2}>Martes</option>
                    <option value={3}>Miércoles</option>
                    <option value={4}>Jueves</option>
                    <option value={5}>Viernes</option>
                    <option value={6}>Sábado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hora de Entrada
                  </label>
                  <input
                    type="time"
                    value={newSchedule.entry_time}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, entry_time: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setSchedules([...schedules, newSchedule])
                    setNewSchedule({ day_of_week: 1, entry_time: '09:00' })
                    setShowScheduleForm(false)
                  }}
                  className="flex-1"
                >
                  Añadir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creando...' : 'Crear Empleado'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}

function EditStaffForm({
  staffMember,
  organizationId,
  onSuccess,
  onCancel,
}: {
  staffMember: User
  organizationId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    email: staffMember.email,
    full_name: staffMember.full_name || '',
    password: '', // Opcional, solo se actualiza si se proporciona
    role: 'EMPLOYEE' as UserRole,
  })
  const [schedules, setSchedules] = useState<Array<{ day_of_week: number; entry_time: string }>>([])
  const [loading, setLoading] = useState(false)
  const [showScheduleForm, setShowScheduleForm] = useState(false)
  const [newSchedule, setNewSchedule] = useState({ day_of_week: 1, entry_time: '09:00' })

  useEffect(() => {
    loadCurrentData()
  }, [])

  const loadCurrentData = async () => {
    // Cargar rol actual
    const currentRole = await mockDb.getUserRoleInOrganization(staffMember.id, organizationId)
    if (currentRole) {
      setFormData(prev => ({ ...prev, role: currentRole }))
    }

    // Cargar horarios programados actuales
    const scheduledTimes = await mockDb.getScheduledTimes(staffMember.id, organizationId)
    setSchedules(
      scheduledTimes.map(st => ({
        day_of_week: st.day_of_week,
        entry_time: st.entry_time,
      }))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Actualizar datos del usuario
      const updates: Partial<User> = {
        email: formData.email,
        full_name: formData.full_name,
      }
      
      // Solo actualizar contraseña si se proporciona
      if (formData.password && formData.password.length === 3) {
        updates.password_hash = formData.password
      }

      await mockDb.updateUser(staffMember.id, updates)

      // Actualizar rol si cambió
      const currentRole = await mockDb.getUserRoleInOrganization(staffMember.id, organizationId)
      if (currentRole !== formData.role) {
        await mockDb.updateMemberRole(staffMember.id, organizationId, formData.role)
      }

      // Eliminar horarios programados antiguos
      const oldScheduledTimes = await mockDb.getScheduledTimes(staffMember.id, organizationId)
      for (const oldSchedule of oldScheduledTimes) {
        await mockDb.deleteScheduledTime(oldSchedule.id)
      }

      // Crear nuevos horarios programados
      for (const schedule of schedules) {
        await mockDb.createScheduledTime({
          user_id: staffMember.id,
          organization_id: organizationId,
          day_of_week: schedule.day_of_week,
          entry_time: schedule.entry_time,
          is_active: true,
        })
      }

      onSuccess()
    } catch (error) {
      console.error('Error updating staff:', error)
      alert('Error al actualizar el empleado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold mb-4">Editar Empleado</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="juan@restaurante.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nueva Contraseña (3 números) - Opcional
          </label>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]{3}"
            value={formData.password}
            onChange={(e) => {
              // Solo permitir números y máximo 3 dígitos
              const value = e.target.value.replace(/\D/g, '').slice(0, 3)
              setFormData({ ...formData, password: value })
            }}
            minLength={3}
            maxLength={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Dejar vacío para no cambiar"
          />
          <p className="text-xs text-gray-500 mt-1">
            Deja vacío si no quieres cambiar la contraseña
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rol *
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="EMPLOYEE">Empleado</option>
            <option value="MANAGER">Encargado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        {/* Programación de horarios */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-gray-700">
              Horarios de Entrada Programados
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowScheduleForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Añadir Horario
            </Button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            Programa las horas de entrada. Puedes añadir múltiples entradas por día (ej: turno mañana y tarde).
          </p>

          {schedules.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-2">
              No hay horarios programados
            </p>
          ) : (
            <div className="space-y-2">
              {schedules.map((schedule, index) => {
                const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{dayNames[schedule.day_of_week]}</span>
                      <span className="text-gray-600">{schedule.entry_time}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSchedules(schedules.filter((_, i) => i !== index))
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {showScheduleForm && (
            <div className="mt-3 p-3 bg-primary-50 rounded-lg border border-primary-200">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Día de la Semana
                  </label>
                  <select
                    value={newSchedule.day_of_week}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, day_of_week: parseInt(e.target.value) })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={0}>Domingo</option>
                    <option value={1}>Lunes</option>
                    <option value={2}>Martes</option>
                    <option value={3}>Miércoles</option>
                    <option value={4}>Jueves</option>
                    <option value={5}>Viernes</option>
                    <option value={6}>Sábado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Hora de Entrada
                  </label>
                  <input
                    type="time"
                    value={newSchedule.entry_time}
                    onChange={(e) =>
                      setNewSchedule({ ...newSchedule, entry_time: e.target.value })
                    }
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setSchedules([...schedules, newSchedule])
                    setNewSchedule({ day_of_week: 1, entry_time: '09:00' })
                    setShowScheduleForm(false)
                  }}
                  className="flex-1"
                >
                  Añadir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowScheduleForm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}

function AssignExistingUsersButton({
  organizationId,
  onSuccess,
}: {
  organizationId: string
  onSuccess: () => void
}) {
  const [showModal, setShowModal] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

  const loadAllUsers = async () => {
    setLoading(true)
    try {
      const users = await getAllUsers()
      // Obtener usuarios que NO están en esta organización
      const members = await mockDb.getOrganizationMembers(organizationId)
      const memberUserIds = new Set(members.map(m => m.user_id))
      const unassignedUsers = users.filter(u => !memberUserIds.has(u.id))
      setAllUsers(unassignedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      setAllUsers([])
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async () => {
    if (selectedUsers.size === 0) {
      alert('Selecciona al menos un usuario para asignar')
      return
    }

    setLoading(true)
    try {
      for (const userId of selectedUsers) {
        await mockDb.addMemberToOrganization(organizationId, userId, 'EMPLOYEE')
      }
      setSelectedUsers(new Set())
      setShowModal(false)
      onSuccess()
      alert(`${selectedUsers.size} usuario(s) asignado(s) correctamente`)
    } catch (error) {
      console.error('Error assigning users:', error)
      alert('Error al asignar usuarios')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setShowModal(true)
          loadAllUsers()
        }}
      >
        <Users className="w-4 h-4 mr-2" />
        Asignar Empleados Existentes
      </Button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Asignar Empleados Existentes</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowModal(false)
                  setSelectedUsers(new Set())
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {loading ? (
              <p className="text-center py-8">Cargando usuarios...</p>
            ) : allUsers.length === 0 ? (
              <p className="text-center py-8 text-gray-600">
                No hay usuarios disponibles para asignar. Todos los usuarios ya están en esta organización.
              </p>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
                  {allUsers.map((user) => (
                    <label
                      key={user.id}
                      className="flex items-center space-x-3 p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedUsers)
                          if (e.target.checked) {
                            newSelected.add(user.id)
                          } else {
                            newSelected.delete(user.id)
                          }
                          setSelectedUsers(newSelected)
                        }}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{user.full_name || 'Sin nombre'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAssign}
                    disabled={loading || selectedUsers.size === 0}
                    className="flex-1"
                  >
                    {loading ? 'Asignando...' : `Asignar ${selectedUsers.size} usuario(s)`}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedUsers(new Set())
                    }}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
