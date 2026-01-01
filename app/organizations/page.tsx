'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserMock } from '@/lib/auth-mock'
import { getUserOrganizations } from '@/lib/organizations'
import { mockDb } from '@/lib/db'
import type { User, Organization } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDate, getRoleLabel } from '@/lib/utils'
import { MapPin, Users, Settings, Trash2, Edit } from 'lucide-react'
import { getCurrentRole, canCreateOrganization } from '@/lib/role-context'
import type { UserRole } from '@/types'
import dynamic from 'next/dynamic'

// Cargar el mapa solo en el cliente (Leaflet requiere navegador)
const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">Cargando mapa...</div>
})

export default function OrganizationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingOrganization, setEditingOrganization] = useState<Organization | null>(null)
  const [currentRole, setCurrentRole] = useState<UserRole>('EMPLOYEE')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUserMock()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)
      
      // Asegurar que el usuario tenga al menos un restaurante
      await mockDb.ensureUserHasOrganization(currentUser.id)
      
      const orgs = await getUserOrganizations(currentUser.id)
      setOrganizations(orgs)
      
      const role = await getCurrentRole()
      setCurrentRole(role)
    } catch (error) {
      console.error('Error loading data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Cargando...</p>
      </div>
    )
  }

  const canCreate = canCreateOrganization(currentRole)

  const handleDeleteOrganization = async (organizationId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este restaurante?\n\nEsta acción eliminará:\n- Todos los empleados asociados\n- Todos los fichajes\n- Todas las incidencias\n- Todos los horarios programados\n\nEsta acción NO se puede deshacer.')) {
      return
    }

    try {
      const success = await mockDb.deleteOrganization(organizationId)
      if (success) {
        await loadData()
        alert('Restaurante eliminado correctamente')
      } else {
        alert('Error al eliminar el restaurante')
      }
    } catch (error) {
      console.error('Error deleting organization:', error)
      alert('Error al eliminar el restaurante')
    }
  }

  const handleEditOrganization = (organization: Organization) => {
    setEditingOrganization(organization)
    setShowCreateForm(false)
  }

  const handleUpdateSuccess = () => {
    setEditingOrganization(null)
    loadData()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Restaurantes</h1>
          <p className="text-sm text-gray-600 mt-1">
            {currentRole === 'EMPLOYEE' 
              ? 'Vista de empleado - Solo puedes ver tus restaurantes asignados'
              : currentRole === 'MANAGER'
              ? 'Vista de encargado - Puedes gestionar empleados y aprobar incidencias'
              : 'Vista de administrador - Control total del sistema'}
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancelar' : 'Crear Restaurante'}
          </Button>
        )}
      </div>

      {showCreateForm && user && (
        <CreateOrganizationForm
          userId={user.id}
          onSuccess={() => {
            setShowCreateForm(false)
            loadData()
          }}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {editingOrganization && user && (
        <EditOrganizationForm
          organization={editingOrganization}
          onSuccess={handleUpdateSuccess}
          onCancel={() => setEditingOrganization(null)}
        />
      )}

      {organizations.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            No tienes restaurantes asignados. Crea uno nuevo para comenzar.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizations.map((org) => (
            <OrganizationCard 
              key={org.id} 
              organization={org} 
              currentRole={currentRole}
              onDelete={handleDeleteOrganization}
              onEdit={handleEditOrganization}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrganizationCard({ 
  organization, 
  currentRole,
  onDelete,
  onEdit
}: { 
  organization: Organization
  currentRole: UserRole
  onDelete: (organizationId: string) => void
  onEdit: (organization: Organization) => void
}) {
  const canDelete = currentRole === 'ADMIN'
  const canEdit = currentRole === 'ADMIN'

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <h3 className="text-xl font-bold mb-3">{organization.name}</h3>
      
      {organization.address && (
        <div className="flex items-start text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <span className="text-sm">{organization.address}</span>
        </div>
      )}

      <div className="space-y-2 text-sm text-gray-600">
        <div>
          <span className="font-medium">Radio permitido:</span> {organization.allowed_radius}m
        </div>
        <div>
          <span className="font-medium">Zona horaria:</span> {organization.timezone}
        </div>
        <div>
          <span className="font-medium">Creado:</span> {formatDate(organization.created_at)}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => window.location.href = '/dashboard'}
        >
          Ir a Fichaje
        </Button>
        <div className="flex space-x-2">
          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onEdit(organization)}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
          )}
          {canDelete && (
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => onDelete(organization.id)}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function CreateOrganizationForm({
  userId,
  onSuccess,
  onCancel,
}: {
  userId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    allowed_radius: '75',
    timezone: 'Europe/Madrid',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.latitude || !formData.longitude) {
      alert('Por favor, selecciona una ubicación en el mapa o usa el buscador de direcciones')
      setLoading(false)
      return
    }

    try {
      console.log('🔵 Intentando crear restaurante en Supabase...')
      console.log('🔵 Datos:', {
        name: formData.name,
        address: formData.address || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        allowed_radius: parseInt(formData.allowed_radius),
        timezone: formData.timezone,
        userId
      })
      
      const newOrg = await mockDb.createOrganization(
        {
          name: formData.name,
          address: formData.address || null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          allowed_radius: parseInt(formData.allowed_radius),
          timezone: formData.timezone,
        },
        userId
      )
      
      console.log('✅ Restaurante creado exitosamente:', newOrg)
      console.log('✅ ID del restaurante:', newOrg.id)
      alert('✅ Restaurante creado correctamente. ID: ' + newOrg.id)
      onSuccess()
    } catch (error) {
      console.error('❌ Error creando organización:', error)
      console.error('❌ Detalles del error:', {
        message: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      })
      alert('❌ Error al crear el restaurante: ' + (error instanceof Error ? error.message : 'Error desconocido') + '\n\nRevisa la consola para más detalles.')
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      address: address || formData.address,
    })
  }

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold mb-4">Crear Nuevo Restaurante</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Restaurante *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación del Restaurante *
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Busca una dirección, haz clic en el mapa o usa tu ubicación actual
          </p>
          <LocationPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={handleLocationChange}
          />
          {formData.address && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
              <strong>Dirección:</strong> {formData.address}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Radio Permitido (metros) *
          </label>
          <select
            value={formData.allowed_radius}
            onChange={(e) => setFormData({ ...formData, allowed_radius: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="50">50m</option>
            <option value="75">75m</option>
            <option value="100">100m</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zona Horaria *
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Europe/Madrid">Europe/Madrid (España)</option>
            <option value="Europe/London">Europe/London (Reino Unido)</option>
            <option value="Europe/Paris">Europe/Paris (Francia)</option>
          </select>
        </div>

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creando...' : 'Crear Restaurante'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}

function EditOrganizationForm({
  organization,
  onSuccess,
  onCancel,
}: {
  organization: Organization
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: organization.name,
    address: organization.address || '',
    latitude: organization.latitude,
    longitude: organization.longitude,
    allowed_radius: organization.allowed_radius.toString(),
    timezone: organization.timezone,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.latitude || !formData.longitude) {
      alert('Por favor, selecciona una ubicación en el mapa o usa el buscador de direcciones')
      setLoading(false)
      return
    }

    try {
      const updatedOrg = await mockDb.updateOrganization(organization.id, {
        name: formData.name,
        address: formData.address || null,
        latitude: formData.latitude,
        longitude: formData.longitude,
        allowed_radius: parseInt(formData.allowed_radius),
        timezone: formData.timezone,
      })
      
      if (updatedOrg) {
        console.log('Restaurante actualizado:', updatedOrg)
        onSuccess()
      } else {
        alert('Error al actualizar el restaurante')
      }
    } catch (error) {
      console.error('Error updating organization:', error)
      alert('Error al actualizar el restaurante: ' + (error instanceof Error ? error.message : 'Error desconocido'))
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (lat: number, lng: number, address?: string) => {
    setFormData({
      ...formData,
      latitude: lat,
      longitude: lng,
      address: address || formData.address,
    })
  }

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold mb-4">Editar Restaurante</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Restaurante *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación del Restaurante *
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Busca una dirección, haz clic en el mapa o usa tu ubicación actual
          </p>
          <LocationPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onLocationChange={handleLocationChange}
          />
          {formData.address && (
            <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
              <strong>Dirección:</strong> {formData.address}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Radio Permitido (metros) *
          </label>
          <select
            value={formData.allowed_radius}
            onChange={(e) => setFormData({ ...formData, allowed_radius: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="50">50m</option>
            <option value="75">75m</option>
            <option value="100">100m</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Zona Horaria *
          </label>
          <select
            value={formData.timezone}
            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="Europe/Madrid">Europe/Madrid (España)</option>
            <option value="Europe/London">Europe/London (Reino Unido)</option>
            <option value="Europe/Paris">Europe/Paris (Francia)</option>
          </select>
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

