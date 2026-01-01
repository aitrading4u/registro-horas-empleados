'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserMock } from '@/lib/auth-mock'
import { getUserOrganizations } from '@/lib/organizations'
import { mockDb } from '@/lib/db'
import { getCurrentRole, canManageOrganization } from '@/lib/role-context'
import type { User, Organization, TimeEntry } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDate, formatTime, formatDateTime, calculateHours } from '@/lib/utils'
import { Clock, User as UserIcon, ArrowLeft, ChevronRight } from 'lucide-react'

export default function WorkersReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [workers, setWorkers] = useState<User[]>([])
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null)
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRole, setCurrentRole] = useState<string>('EMPLOYEE')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      loadWorkers()
    }
  }, [selectedOrg])

  useEffect(() => {
    if (selectedWorker && selectedOrg) {
      loadWorkerEntries()
    }
  }, [selectedWorker, selectedOrg, startDate, endDate])

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

  const loadWorkers = async () => {
    if (!selectedOrg) return

    try {
      const members = await mockDb.getOrganizationMembers(selectedOrg.id)
      const workersPromises = members.map(m => mockDb.getUserById(m.user_id))
      const workersData = await Promise.all(workersPromises)
      const validWorkers = workersData.filter(w => w !== null) as User[]
      setWorkers(validWorkers)
    } catch (error) {
      console.error('Error loading workers:', error)
    }
  }

  const loadWorkerEntries = async () => {
    if (!selectedWorker || !selectedOrg) return

    setLoading(true)
    try {
      const start = new Date(startDate + 'T00:00:00').toISOString()
      const end = new Date(endDate + 'T23:59:59').toISOString()

      const entriesData = await mockDb.getTimeEntries(
        selectedOrg.id,
        selectedWorker.id,
        start,
        end
      )
      setEntries(entriesData.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      ))
    } catch (error) {
      console.error('Error loading entries:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !selectedOrg) {
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

  // Si hay un trabajador seleccionado, mostrar sus detalles
  if (selectedWorker) {
    const totalHours = calculateHours(entries)
    const groupedByDate = entries.reduce((acc, entry) => {
      const date = entry.timestamp.split('T')[0]
      if (!acc[date]) acc[date] = []
      acc[date].push(entry)
      return acc
    }, {} as Record<string, TimeEntry[]>)

    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedWorker(null)}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-3xl font-bold">Detalle de Fichajes</h1>
        </div>

        <Card className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{selectedWorker.full_name || selectedWorker.email}</h2>
              <p className="text-gray-600">{selectedWorker.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {organizations.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Restaurante
                </label>
                <select
                  value={selectedOrg?.id || ''}
                  onChange={(e) => {
                    const org = organizations.find(o => o.id === e.target.value)
                    setSelectedOrg(org || null)
                    setSelectedWorker(null)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full bg-primary-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Total de horas</div>
                <div className="text-2xl font-bold text-primary-700">
                  {totalHours !== null ? totalHours.toFixed(1) : '0.0'}h
                </div>
              </div>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="text-center py-8">
            <p>Cargando fichajes...</p>
          </div>
        ) : entries.length === 0 ? (
          <Card>
            <p className="text-center text-gray-600 py-8">
              No hay fichajes en el período seleccionado.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedByDate)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, dateEntries]) => {
                const dayHours = calculateHours(dateEntries)
                return (
                  <Card key={date}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold">{formatDate(date)}</h3>
                      {dayHours !== null && (
                        <Badge variant="info">{dayHours.toFixed(1)} horas</Badge>
                      )}
                    </div>
                    <div className="space-y-2">
                      {dateEntries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                entry.type === 'ENTRY' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            ></div>
                            <div>
                              <span className="font-medium">
                                {entry.type === 'ENTRY' ? 'Entrada' : 'Salida'}
                              </span>
                              <span className="text-sm text-gray-600 ml-2">
                                {formatTime(entry.timestamp)}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDateTime(entry.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )
              })}
          </div>
        )}
      </div>
    )
  }

  // Vista de lista de trabajadores
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Trabajadores</h1>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {organizations.length > 1 && (
            <div>
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
            </div>
          )}
        </div>
      </Card>

      {loading ? (
        <div className="text-center py-8">
          <p>Cargando trabajadores...</p>
        </div>
      ) : workers.length === 0 ? (
        <Card>
          <p className="text-center text-gray-600 py-8">
            No hay trabajadores asignados a este restaurante.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <Card
              key={worker.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedWorker(worker)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-6 h-6 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg truncate">{worker.full_name || worker.email}</h3>
                  <p className="text-sm text-gray-600 truncate">{worker.email}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

