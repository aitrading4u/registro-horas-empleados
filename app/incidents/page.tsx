'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserMock } from '@/lib/auth-mock'
import { getUserOrganizations } from '@/lib/organizations'
import { mockDb, getIncidents, updateIncident, createIncident } from '@/lib/db'
import type { User, Organization, Incident } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDate, getIncidentTypeLabel, getIncidentStatusLabel } from '@/lib/utils'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'
import { getCurrentRole, canApproveIncidents } from '@/lib/role-context'
import type { UserRole } from '@/types'

export default function IncidentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [currentRole, setCurrentRole] = useState<UserRole>('EMPLOYEE')
  const [preselectedType, setPreselectedType] = useState<Incident['type'] | null>(null)
  const [preselectedDate, setPreselectedDate] = useState<string | null>(null)

  useEffect(() => {
    // Verificar si hay parámetros en la URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const type = params.get('type')
      const date = params.get('date')
      
      // Validar que el tipo sea uno de los tipos válidos
      const validTypes: Incident['type'][] = ['FORGOT_ENTRY', 'LATE_ARRIVAL', 'NOT_WORKING']
      if (type && validTypes.includes(type as Incident['type']) && date) {
        setPreselectedType(type as Incident['type'])
        setPreselectedDate(date)
        setShowCreateForm(true)
      }
    }
    
    loadData()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      loadIncidents()
    }
  }, [selectedOrg, currentRole])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUserMock()
      if (!currentUser) {
        router.push('/login')
        return
      }

      setUser(currentUser)
      const orgs = await getUserOrganizations(currentUser.id)
      setOrganizations(orgs)
      
      if (orgs.length > 0) {
        setSelectedOrg(orgs[0])
      }
      
      const role = await getCurrentRole()
      setCurrentRole(role)
    } catch (error) {
      console.error('Error loading data:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }

  const loadIncidents = async () => {
    if (!selectedOrg || !user) return

    // Si es ADMIN o MANAGER, mostrar todas las incidencias (pasar null para userId)
    // Si es EMPLOYEE, solo las suyas (pasar user.id)
    const canApprove = canApproveIncidents(currentRole)
    const userId: string | null = canApprove ? null : user.id
    const incs = await getIncidents(selectedOrg.id, userId)
    setIncidents(incs)
  }

  const handleApprove = async (incidentId: string) => {
    if (!user) return

    try {
      await updateIncident(incidentId, {
        status: 'APPROVED',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      await loadIncidents()
    } catch (error) {
      console.error('Error approving incident:', error)
      alert('Error al aprobar la incidencia')
    }
  }

  const handleReject = async (incidentId: string) => {
    if (!user) return

    try {
      await updateIncident(incidentId, {
        status: 'REJECTED',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      await loadIncidents()
    } catch (error) {
      console.error('Error rejecting incident:', error)
      alert('Error al rechazar la incidencia')
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

  const canApprove = canApproveIncidents(currentRole)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Incidencias</h1>
          <p className="text-sm text-gray-600 mt-1">
            {currentRole === 'EMPLOYEE' 
              ? 'Vista de empleado - Puedes crear y ver tus incidencias'
              : 'Vista de administrador/encargado - Puedes aprobar o rechazar incidencias'}
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancelar' : 'Nueva Incidencia'}
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

      {showCreateForm && selectedOrg && user && (
        <CreateIncidentForm
          organizationId={selectedOrg.id}
          userId={user.id}
          onSuccess={() => {
            setShowCreateForm(false)
            setPreselectedType(null)
            setPreselectedDate(null)
            // Limpiar parámetros de URL
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, '', '/incidents')
            }
            loadIncidents()
          }}
          onCancel={() => {
            setShowCreateForm(false)
            setPreselectedType(null)
            setPreselectedDate(null)
            // Limpiar parámetros de URL
            if (typeof window !== 'undefined') {
              window.history.replaceState({}, '', '/incidents')
            }
          }}
          preselectedType={preselectedType}
          preselectedDate={preselectedDate}
        />
      )}

      {incidents.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            No hay incidencias registradas.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {incidents.map((incident) => (
            <Card key={incident.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge
                      variant={
                        incident.status === 'APPROVED'
                          ? 'success'
                          : incident.status === 'REJECTED'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {getIncidentStatusLabel(incident.status)}
                    </Badge>
                    <span className="text-sm font-medium">
                      {getIncidentTypeLabel(incident.type)}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDate(incident.date)}
                    </span>
                  </div>
                  {incident.description && (
                    <p className="text-gray-700 mb-2">{incident.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Creada: {formatDate(incident.created_at)}
                  </p>
                </div>
                {incident.status === 'PENDING' && canApprove && (
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleApprove(incident.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Aprobar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleReject(incident.id)}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                )}
                {incident.status === 'PENDING' && !canApprove && (
                  <Badge variant="warning">Esperando aprobación</Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function CreateIncidentForm({
  organizationId,
  userId,
  onSuccess,
  onCancel,
  preselectedType,
  preselectedDate,
}: {
  organizationId: string
  userId: string
  onSuccess: () => void
  onCancel: () => void
  preselectedType?: Incident['type'] | null
  preselectedDate?: string | null
}) {
  // La fecha siempre es automática (hoy)
  const today = new Date().toISOString().split('T')[0]
  
  // Validar que el tipo preseleccionado sea válido
  const validTypes: Incident['type'][] = ['FORGOT_ENTRY', 'LATE_ARRIVAL', 'NOT_WORKING']
  const defaultType: Incident['type'] = preselectedType && validTypes.includes(preselectedType) 
    ? preselectedType 
    : 'FORGOT_ENTRY'
  
  const [formData, setFormData] = useState({
    type: defaultType,
    date: today, // Siempre la fecha de hoy
    description: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // La descripción es obligatoria para todas las incidencias
    if (!formData.description.trim()) {
      alert('Debes proporcionar una descripción de la incidencia')
      return
    }

    setLoading(true)

    try {
      await createIncident({
        organization_id: organizationId,
        user_id: userId,
        type: formData.type,
        date: formData.date,
        description: formData.description.trim(), // Descripción obligatoria
        time_entry_id: null,
        status: 'PENDING',
        reviewed_by: null,
        reviewed_at: null,
      })
      onSuccess()
    } catch (error) {
      console.error('Error creating incident:', error)
      alert('Error al crear la incidencia')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-bold mb-4">Nueva Incidencia</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Incidencia *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as Incident['type'] })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="FORGOT_ENTRY">Olvidé fichar mi entrada</option>
            <option value="LATE_ARRIVAL">Llegué Tarde</option>
            <option value="NOT_WORKING">No voy a trabajar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={formData.date}
            disabled
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-gray-500 mt-1">
            La fecha se establece automáticamente (hoy)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Describe la incidencia..."
          />
          <p className="text-xs text-gray-500 mt-1">
            La descripción es obligatoria
          </p>
        </div>

        <div className="flex space-x-3">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Creando...' : 'Crear Incidencia'}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  )
}

