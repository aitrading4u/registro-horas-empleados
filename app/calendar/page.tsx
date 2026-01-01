'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserMock } from '@/lib/auth-mock'
import { getUserOrganizations } from '@/lib/organizations'
import { mockDb } from '@/lib/db'
import type { User, Organization, TimeEntry } from '@/types'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { formatDate, formatTime, calculateHours, formatDateTime } from '@/lib/utils'
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle, User as UserIcon, X } from 'lucide-react'
import { getCurrentRole, canManageOrganization } from '@/lib/role-context'
import type { UserRole } from '@/types'

export default function CalendarPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dayDetails, setDayDetails] = useState<Array<{
    worker: User
    entries: TimeEntry[]
    totalHours: number | null
    status: 'complete' | 'incomplete' | 'no-entry'
  }>>([])
  const [currentRole, setCurrentRole] = useState<UserRole>('EMPLOYEE')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedOrg) {
      loadEntries()
    }
  }, [selectedOrg, currentDate])

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

  const loadEntries = async () => {
    if (!selectedOrg || !user) return

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const startDate = new Date(year, month, 1).toISOString()
    const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString()

    // Si es ADMIN o MANAGER, cargar todos los fichajes del restaurante
    // Si es EMPLOYEE, solo los suyos
    const canManage = canManageOrganization(currentRole)
    const userId = canManage ? undefined : user.id

    const entriesData = await mockDb.getTimeEntries(
      selectedOrg.id,
      userId, // This will be undefined for admins/managers, which is handled by mockDb
      startDate,
      endDate
    )
    setEntries(entriesData)
  }

  const handleDayClick = async (day: number) => {
    if (!day || !selectedOrg) return

    setSelectedDay(day)
    
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    const startOfDay = new Date(dateStr + 'T00:00:00').toISOString()
    const endOfDay = new Date(dateStr + 'T23:59:59').toISOString()

    // Si es ADMIN o MANAGER, mostrar todos los trabajadores
    if (canManageOrganization(currentRole)) {
      const members = await mockDb.getOrganizationMembers(selectedOrg.id)
      
      const workersDataPromises = members.map(async (member) => {
        const worker = await mockDb.getUserById(member.user_id)
        if (!worker) return null

        const workerEntries = await mockDb.getTimeEntries(
          selectedOrg.id,
          worker.id,
          startOfDay,
          endOfDay
        )

        const totalHours = calculateHours(workerEntries)
        
        let status: 'complete' | 'incomplete' | 'no-entry' = 'no-entry'
        if (workerEntries.length > 0) {
          const hasEntry = workerEntries.some(e => e.type === 'ENTRY')
          const hasExit = workerEntries.some(e => e.type === 'EXIT')
          status = hasEntry && hasExit ? 'complete' : 'incomplete'
        }

        return {
          worker,
          entries: workerEntries.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          ),
          totalHours,
          status,
        }
      })

      const results = await Promise.all(workersDataPromises)
      const validResults = results.filter(r => r !== null) as typeof dayDetails
      setDayDetails(validResults)
    } else {
      // Si es EMPLOYEE, solo mostrar sus propios datos
      if (!user) return
      
      const userEntries = await mockDb.getTimeEntries(
        selectedOrg.id,
        user.id,
        startOfDay,
        endOfDay
      )

      const totalHours = calculateHours(userEntries)
      
      let status: 'complete' | 'incomplete' | 'no-entry' = 'no-entry'
      if (userEntries.length > 0) {
        const hasEntry = userEntries.some(e => e.type === 'ENTRY')
        const hasExit = userEntries.some(e => e.type === 'EXIT')
        status = hasEntry && hasExit ? 'complete' : 'incomplete'
      }

      setDayDetails([{
        worker: user,
        entries: userEntries.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
        totalHours,
        status,
      }])
    }
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Días vacíos al inicio
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Días del mes
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const getDayEntries = (day: number) => {
    if (!day) return []
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const date = new Date(year, month, day)
    const dateStr = date.toISOString().split('T')[0]
    
    return entries.filter(entry => {
      const entryDate = entry.timestamp.split('T')[0]
      return entryDate === dateStr
    })
  }

  const getDayStatus = (day: number): 'complete' | 'incomplete' | 'pending' | null => {
    if (!day) return null
    const dayEntries = getDayEntries(day)
    
    if (dayEntries.length === 0) return null
    
    const hasEntry = dayEntries.some(e => e.type === 'ENTRY')
    const hasExit = dayEntries.some(e => e.type === 'EXIT')
    
    if (hasEntry && hasExit) {
      return 'complete'
    } else if (hasEntry || hasExit) {
      return 'incomplete'
    }
    
    return null
  }

  const getDayHours = (day: number): number | null => {
    if (!day) return null
    const dayEntries = getDayEntries(day)
    return calculateHours(dayEntries)
  }

  const changeMonth = (delta: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1))
  }

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

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

  const days = getDaysInMonth()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Calendario</h1>
        {organizations.length > 1 && (
          <select
            value={selectedOrg?.id || ''}
            onChange={(e) => {
              const org = organizations.find(o => o.id === e.target.value)
              setSelectedOrg(org || null)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <Card>
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="text-center font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const status = getDayStatus(day || 0)
            const hours = getDayHours(day || 0)
            const dayEntries = getDayEntries(day || 0)

            return (
              <div
                key={index}
                onClick={() => day && handleDayClick(day)}
                className={`min-h-24 p-2 border rounded transition-all ${
                  day
                    ? `cursor-pointer hover:shadow-md ${
                        status === 'complete'
                          ? 'bg-green-50 border-green-200 hover:bg-green-100'
                          : status === 'incomplete'
                          ? 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`
                    : 'bg-gray-50 border-transparent cursor-default'
                }`}
              >
                {day && (
                  <>
                    <div className="font-medium mb-1">{day}</div>
                    {status && (
                      <div className="text-xs space-y-1">
                        {status === 'complete' && (
                          <div className="flex items-center text-green-700">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            <span>Completo</span>
                          </div>
                        )}
                        {status === 'incomplete' && (
                          <div className="flex items-center text-yellow-700">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            <span>Incompleto</span>
                          </div>
                        )}
                        {hours !== null && (
                          <div className="text-gray-600">
                            {hours.toFixed(1)}h
                          </div>
                        )}
                        {dayEntries.length > 0 && (
                          <div className="text-gray-500 text-xs">
                            {dayEntries.filter(e => e.type === 'ENTRY').length}E /{' '}
                            {dayEntries.filter(e => e.type === 'EXIT').length}S
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-50 border border-green-200 rounded mr-2"></div>
            <span>Completo</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-50 border border-yellow-200 rounded mr-2"></div>
            <span>Incompleto</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-2"></div>
            <span>Sin fichaje</span>
          </div>
        </div>
      </Card>

      {/* Modal de detalles del día */}
      {selectedDay !== null && (
        <DayDetailsModal
          day={selectedDay}
          month={currentDate.getMonth()}
          year={currentDate.getFullYear()}
          dayDetails={dayDetails}
          onClose={() => {
            setSelectedDay(null)
            setDayDetails([])
          }}
        />
      )}
    </div>
  )
}

function DayDetailsModal({
  day,
  month,
  year,
  dayDetails,
  onClose,
}: {
  day: number
  month: number
  year: number
  dayDetails: Array<{
    worker: User
    entries: TimeEntry[]
    totalHours: number | null
    status: 'complete' | 'incomplete' | 'no-entry'
  }>
  onClose: () => void
}) {
  const date = new Date(year, month, day)
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {day} de {monthNames[month]} {year}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {dayDetails.length === 0 ? (
          <p className="text-center text-gray-600 py-8">
            No hay datos para este día
          </p>
        ) : (
          <div className="space-y-4">
            {dayDetails.map(({ worker, entries, totalHours, status }) => (
              <div key={worker.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-bold">{worker.full_name || worker.email}</h3>
                      <p className="text-sm text-gray-600">{worker.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        status === 'complete'
                          ? 'success'
                          : status === 'incomplete'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {status === 'complete'
                        ? 'Completo'
                        : status === 'incomplete'
                        ? 'Incompleto'
                        : 'Sin fichaje'}
                    </Badge>
                    {totalHours !== null && (
                      <p className="text-sm font-medium text-gray-700 mt-1">
                        {totalHours.toFixed(1)} horas
                      </p>
                    )}
                  </div>
                </div>

                {entries.length === 0 ? (
                  <p className="text-sm text-gray-500 pl-13">No hay fichajes registrados</p>
                ) : (
                  <div className="space-y-2 pl-13">
                    {entries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              entry.type === 'ENTRY' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></div>
                          <span className="font-medium">
                            {entry.type === 'ENTRY' ? 'Entrada' : 'Salida'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {formatTime(entry.timestamp)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDateTime(entry.timestamp)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

