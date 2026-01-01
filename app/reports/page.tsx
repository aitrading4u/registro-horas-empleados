'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserMock } from '@/lib/auth-mock'
import { getUserOrganizations } from '@/lib/organizations'
import { mockDb } from '@/lib/db'
import { getCurrentRole, canManageOrganization } from '@/lib/role-context'
import type { User, Organization, TimeEntry, UserRole } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatDate, formatTime, calculateHours } from '@/lib/utils'
import { Download, FileText, FileSpreadsheet } from 'lucide-react'

export default function ReportsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [workers, setWorkers] = useState<User[]>([])
  const [selectedWorker, setSelectedWorker] = useState<User | null>(null)
  const [currentRole, setCurrentRole] = useState<UserRole>('EMPLOYEE')
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      if (canManageOrganization(currentRole)) {
        loadWorkers()
      } else {
        // Si es EMPLOYEE, seleccionar automáticamente el usuario actual
        if (user) {
          setSelectedWorker(user)
        }
      }
    }
  }, [selectedOrg, currentRole])

  useEffect(() => {
    if (selectedOrg && selectedWorker) {
      loadEntries()
    }
  }, [selectedOrg, selectedWorker, startDate, endDate])

  const loadData = async () => {
    try {
      const currentUser = await getCurrentUserMock()
      if (!currentUser) {
        router.push('/login')
        return
      }

      const role = await getCurrentRole()
      setCurrentRole(role)
      setUser(currentUser)
      const orgs = await getUserOrganizations(currentUser.id)
      setOrganizations(orgs)
      
      if (orgs.length > 0) {
        setSelectedOrg(orgs[0])
      }

      // Si es EMPLOYEE, seleccionar automáticamente el usuario actual
      if (!canManageOrganization(role) && currentUser) {
        setSelectedWorker(currentUser)
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
      
      // Si no hay trabajador seleccionado, seleccionar el primero
      if (!selectedWorker && validWorkers.length > 0) {
        setSelectedWorker(validWorkers[0])
      }
    } catch (error) {
      console.error('Error loading workers:', error)
    }
  }

  const loadEntries = async () => {
    if (!selectedOrg || !selectedWorker) return

    const start = new Date(startDate).toISOString()
    const end = new Date(endDate + 'T23:59:59').toISOString()

    const entriesData = await mockDb.getTimeEntries(
      selectedOrg.id,
      selectedWorker.id,
      start,
      end
    )
    setEntries(entriesData)
  }

  const groupEntriesByDate = () => {
    const grouped: Record<string, TimeEntry[]> = {}
    
    entries.forEach(entry => {
      const date = entry.timestamp.split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(entry)
    })

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .reverse()
  }

  const getTotalHours = () => {
    return calculateHours(entries) || 0
  }

  const exportToPDF = () => {
    // En producción, esto generará un PDF real
    alert('Exportación a PDF: Funcionalidad en desarrollo')
  }

  const exportToExcel = () => {
    // En producción, esto generará un Excel real
    alert('Exportación a Excel: Funcionalidad en desarrollo')
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

  const groupedEntries = groupEntriesByDate()
  const totalHours = getTotalHours()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reportes</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportToPDF}>
            <FileText className="w-4 h-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {organizations.length > 1 && (
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Restaurante
              </label>
              <select
                value={selectedOrg?.id || ''}
                onChange={(e) => {
                  const org = organizations.find(o => o.id === e.target.value)
                  setSelectedOrg(org || null)
                  setSelectedWorker(null) // Reset worker selection when org changes
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
          {canManageOrganization(currentRole) && (
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empleado
              </label>
              <select
                value={selectedWorker?.id || ''}
                onChange={(e) => {
                  const worker = workers.find(w => w.id === e.target.value)
                  setSelectedWorker(worker || null)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleccionar empleado...</option>
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.full_name || worker.email}
                  </option>
                ))}
              </select>
            </div>
          )}
          {selectedWorker && (
            <div className="md:col-span-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Reporte de:</div>
                <div className="font-semibold text-gray-900">
                  {selectedWorker.full_name || selectedWorker.email}
                </div>
              </div>
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
          <div className="md:col-span-2 flex items-end">
            <div className="w-full bg-primary-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Total de horas</div>
              <div className="text-2xl font-bold text-primary-700">
                {totalHours.toFixed(1)}h
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-4">Detalle de Fichajes</h2>
        
        {groupedEntries.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No hay fichajes en el período seleccionado.
          </p>
        ) : (
          <div className="space-y-4">
            {groupedEntries.map(([date, dateEntries]) => {
              const dayHours = calculateHours(dateEntries)
              const sortedEntries = [...dateEntries].sort(
                (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
              )

              return (
                <div key={date} className="border-b pb-4 last:border-b-0">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">{formatDate(date)}</h3>
                    {dayHours !== null && (
                      <span className="text-sm font-medium text-gray-600">
                        {dayHours.toFixed(1)} horas
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {sortedEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              entry.type === 'ENTRY'
                                ? 'bg-green-500'
                                : 'bg-red-500'
                            }`}
                          ></span>
                          <span className="font-medium">
                            {entry.type === 'ENTRY' ? 'Entrada' : 'Salida'}
                          </span>
                        </div>
                        <span className="text-gray-600">
                          {formatTime(entry.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

