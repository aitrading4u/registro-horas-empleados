'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserMock } from '@/lib/auth-mock'
import { mockDb } from '@/lib/db'
import { getUserOrganizations } from '@/lib/organizations'
import type { User, Organization, TimeEntry, ScheduledTime } from '@/types'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDateTime, formatTime } from '@/lib/utils'
import { Clock, MapPin, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { getCurrentRole } from '@/lib/role-context'
import type { UserRole } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null)
  const [lastEntry, setLastEntry] = useState<TimeEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [fichando, setFichando] = useState(false)
  const [currentRole, setCurrentRole] = useState<UserRole>('EMPLOYEE')
  const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([])
  const [scheduledTimes, setScheduledTimes] = useState<ScheduledTime[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (selectedOrg && user) {
      loadLastEntry()
      loadTodayEntries()
      loadScheduledTimes()
    }
  }, [selectedOrg, user])

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

  const loadLastEntry = async () => {
    if (!selectedOrg || !user) return

    const entry = await mockDb.getLastTimeEntry(selectedOrg.id, user.id)
    setLastEntry(entry)
  }

  const loadTodayEntries = async () => {
    if (!selectedOrg || !user) return

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    const entries = await mockDb.getTimeEntries(
      selectedOrg.id,
      user.id,
      startOfDay.toISOString(),
      endOfDay.toISOString()
    )
    setTodayEntries(entries)
  }

  const loadScheduledTimes = async () => {
    if (!selectedOrg || !user) return

    const scheduled = await mockDb.getScheduledTimes(user.id, selectedOrg.id)
    setScheduledTimes(scheduled)
  }

  // Verificar si falta fichar entrada o salida basándose en horarios programados
  const checkMissingTimeEntry = () => {
    // Si no hay horarios programados, no mostrar botón
    if (!scheduledTimes || scheduledTimes.length === 0) {
      return { missing: false, type: null }
    }

    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado

    // Obtener horarios programados para hoy
    const todayScheduledTimes = scheduledTimes.filter(
      st => st.day_of_week === dayOfWeek && st.is_active
    )

    // Si no hay horarios programados para hoy, no mostrar botón de incidencias
    if (todayScheduledTimes.length === 0) {
      return { missing: false, type: null }
    }

    // Ordenar horarios por hora (más temprano primero)
    const sortedScheduled = [...todayScheduledTimes].sort((a, b) => 
      a.entry_time.localeCompare(b.entry_time)
    )

    // Obtener el primer horario programado de hoy (el más temprano)
    const firstScheduledTime = sortedScheduled[0]
    
    // Validar que existe el horario
    if (!firstScheduledTime || !firstScheduledTime.entry_time) {
      return { missing: false, type: null }
    }

    const [scheduledHour, scheduledMinute] = firstScheduledTime.entry_time.split(':').map(Number)
    
    // Validar que la hora es válida
    if (isNaN(scheduledHour) || isNaN(scheduledMinute)) {
      return { missing: false, type: null }
    }
    
    // Crear fecha con la hora programada de hoy
    const scheduledDateTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      scheduledHour,
      scheduledMinute
    )

    // Si ya pasó la hora programada, verificar si ha fichado
    if (now >= scheduledDateTime) {
      // Buscar fichajes de entrada de hoy
      const todayEntryTimes = todayEntries
        .filter(e => e.type === 'ENTRY')
        .map(e => new Date(e.timestamp))
        .sort((a, b) => a.getTime() - b.getTime())

      // Si no hay fichajes de entrada hoy
      if (todayEntryTimes.length === 0) {
        return { missing: true, type: 'FORGOT_ENTRY' as const }
      }

      // Verificar si fichó antes o a la hora programada
      const hasFichadoOnTime = todayEntryTimes.some(
        entryTime => entryTime <= scheduledDateTime
      )

      // Si no fichó a tiempo, mostrar botón de incidencias
      if (!hasFichadoOnTime) {
        return { missing: true, type: 'LATE_ARRIVAL' as const }
      }
    }

    // Si aún no ha llegado la hora programada, no mostrar botón
    return { missing: false, type: null }
  }

  const handleFichar = async (type: 'ENTRY' | 'EXIT') => {
    if (!selectedOrg || !user || fichando) return

    setFichando(true)

    try {
      // Obtener ubicación GPS
      let position = await getCurrentPosition()
      
      if (!position) {
        // Si no se puede obtener GPS, preguntar si quiere fichar de todas formas
        const confirmar = confirm(
          'No se pudo obtener tu ubicación GPS.\n\n' +
          'Posibles causas:\n' +
          '- GPS desactivado\n' +
          '- Permisos de ubicación denegados\n' +
          '- Problema de conexión\n\n' +
          '¿Deseas fichar de todas formas? (Solo si estás seguro de estar en la ubicación correcta)'
        )
        
        if (!confirmar) {
          setFichando(false)
          return
        }
        
        // Si confirma, usar coordenadas de la organización como fallback
        if (selectedOrg.latitude && selectedOrg.longitude) {
          console.warn('⚠️ [Fichaje] Usando coordenadas de la organización como fallback')
          position = {
            lat: selectedOrg.latitude,
            lon: selectedOrg.longitude,
            accuracy: 0, // Precisión desconocida
          }
        } else {
          alert('No se puede fichar: no hay ubicación GPS y la organización no tiene coordenadas configuradas.')
          setFichando(false)
          return
        }
      }

      // Verificar distancia
      if (selectedOrg.latitude && selectedOrg.longitude) {
        const accuracy = position.accuracy || 0
        const distance = calculateDistance(
          position.lat,
          position.lon,
          selectedOrg.latitude,
          selectedOrg.longitude
        )

        console.log('🔵 [Fichaje] Verificando distancia:', {
          ubicacionUsuario: { lat: position.lat, lon: position.lon },
          ubicacionOrganizacion: { lat: selectedOrg.latitude, lon: selectedOrg.longitude },
          radioPermitido: `${selectedOrg.allowed_radius}m`,
          precisionGPS: `${Math.round(accuracy)}m`,
          distanciaCalculada: `${Math.round(distance)}m`,
        })

        if (distance > selectedOrg.allowed_radius) {
          let mensaje = `Estás fuera del radio permitido (${selectedOrg.allowed_radius}m).\n\n`
          mensaje += `Distancia: ${Math.round(distance)}m\n`
          mensaje += `Precisión GPS: ${Math.round(accuracy)}m\n\n`
          
          if (accuracy > 100) {
            mensaje += `⚠️ La precisión del GPS es baja. Intenta:\n`
            mensaje += `- Activar el GPS del dispositivo\n`
            mensaje += `- Salir al exterior para mejor señal\n`
            mensaje += `- Esperar unos segundos para que el GPS se estabilice\n\n`
          }
          
          mensaje += `¿Deseas fichar de todas formas? (Solo si estás seguro de estar en la ubicación correcta)`
          
          const confirmar = confirm(mensaje)
          if (!confirmar) {
            setFichando(false)
            return
          }
          
          console.warn('⚠️ [Fichaje] Fichaje permitido manualmente a pesar de estar fuera del radio')
        } else {
          console.log('✅ [Fichaje] Distancia válida, procediendo con el fichaje')
        }
      } else {
        console.warn('⚠️ [Fichaje] La organización no tiene coordenadas configuradas')
      }

      await mockDb.createTimeEntry({
        organization_id: selectedOrg.id,
        user_id: user.id,
        type,
        timestamp: new Date().toISOString(),
        latitude: position.lat,
        longitude: position.lon,
        device_info: navigator.userAgent,
      })

      // Recargar datos después del fichaje
      await Promise.all([
        loadLastEntry(),
        loadTodayEntries(),
        loadScheduledTimes()
      ])
      alert(`Fichaje de ${type === 'ENTRY' ? 'entrada' : 'salida'} registrado correctamente`)
    } catch (error) {
      console.error('Error al fichar:', error)
      alert('Error al registrar el fichaje')
    } finally {
      setFichando(false)
    }
  }

  const handleCreateIncident = () => {
    const missing = checkMissingTimeEntry()
    if (missing.missing && missing.type) {
      // Redirigir a incidencias con el tipo pre-seleccionado
      const params = new URLSearchParams({
        type: missing.type,
        date: new Date().toISOString().split('T')[0],
      })
      router.push(`/incidents?${params.toString()}`)
    }
  }

  const getCurrentPosition = (): Promise<{ lat: number; lon: number; accuracy?: number } | null> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.warn('⚠️ [GPS] Geolocalización no disponible')
        resolve(null)
        return
      }

      console.log('🔵 [GPS] Obteniendo ubicación GPS...')
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
          }
          console.log('✅ [GPS] Ubicación obtenida:', {
            lat: coords.lat,
            lon: coords.lon,
            accuracy: coords.accuracy ? `${Math.round(coords.accuracy)}m` : 'desconocida',
          })
          resolve(coords)
        },
        (error) => {
          console.error('❌ [GPS] Error obteniendo ubicación:', error)
          resolve(null)
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
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
          <h2 className="text-xl font-bold mb-4">No tienes restaurantes asignados</h2>
          <p className="text-gray-600 mb-4">
            Contacta con un administrador para que te asigne a un restaurante.
          </p>
          <Button onClick={() => router.push('/organizations')}>
            Ver Restaurantes
          </Button>
        </Card>
      </div>
    )
  }

  const canFicharEntrada = !lastEntry || lastEntry.type === 'EXIT'
  const canFicharSalida = lastEntry?.type === 'ENTRY'
  const missingEntry = checkMissingTimeEntry()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Fichaje</h1>
        <p className="text-sm text-gray-600 mt-1">
          {currentRole === 'EMPLOYEE' 
            ? 'Registra tu entrada y salida'
            : currentRole === 'MANAGER'
            ? 'Vista de encargado - Puedes ver fichajes de tu equipo'
            : 'Vista de administrador - Control total'}
        </p>
      </div>

      {/* Selector de restaurante */}
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

      {selectedOrg && (
        <>
          {/* Información del restaurante */}
          <Card className="mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">{selectedOrg.name}</h2>
                {selectedOrg.address && (
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{selectedOrg.address}</span>
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  Radio permitido: {selectedOrg.allowed_radius}m
                </div>
              </div>
            </div>
          </Card>

          {/* Último fichaje */}
          {lastEntry && (
            <Card className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Último fichaje</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {lastEntry.type === 'ENTRY' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <div className="font-medium">
                      {lastEntry.type === 'ENTRY' ? 'Entrada' : 'Salida'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatDateTime(lastEntry.timestamp)}
                    </div>
                  </div>
                </div>
                <Badge variant={lastEntry.type === 'ENTRY' ? 'success' : 'danger'}>
                  {lastEntry.type === 'ENTRY' ? 'Dentro' : 'Fuera'}
                </Badge>
              </div>
            </Card>
          )}

          {/* Botones de fichaje */}
          <Card>
            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => handleFichar('ENTRY')}
                disabled={!canFicharEntrada || fichando}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>FICHAR ENTRADA</span>
                </div>
              </Button>

              <Button
                variant="danger"
                size="lg"
                className="w-full"
                onClick={() => handleFichar('EXIT')}
                disabled={!canFicharSalida || fichando}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>FICHAR SALIDA</span>
                </div>
              </Button>

              {/* Botón de incidencias - Siempre visible, solo funciona cuando no ha fichado a su hora */}
              <Button
                variant="outline"
                size="lg"
                className={`w-full ${
                  missingEntry.missing && (missingEntry.type === 'FORGOT_ENTRY' || missingEntry.type === 'LATE_ARRIVAL')
                    ? 'border-yellow-400 text-yellow-700 hover:bg-yellow-50'
                    : 'border-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                }`}
                onClick={handleCreateIncident}
                disabled={!missingEntry.missing || (missingEntry.type !== 'FORGOT_ENTRY' && missingEntry.type !== 'LATE_ARRIVAL')}
              >
                <div className="flex items-center justify-center space-x-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span>
                    {missingEntry.missing && (missingEntry.type === 'FORGOT_ENTRY' || missingEntry.type === 'LATE_ARRIVAL')
                      ? `REGISTRAR INCIDENCIA - ${
                          missingEntry.type === 'FORGOT_ENTRY' 
                            ? 'Olvidé fichar mi entrada'
                            : 'Llegué tarde'
                        }`
                      : 'REGISTRAR INCIDENCIA'}
                  </span>
                </div>
              </Button>
            </div>

            {(!canFicharEntrada || !canFicharSalida) && !missingEntry.missing && (
              <p className="mt-4 text-sm text-gray-600 text-center">
                {!canFicharEntrada && 'Ya tienes una entrada registrada. Ficha salida primero.'}
                {!canFicharSalida && 'Debes fichar entrada antes de fichar salida.'}
              </p>
            )}

            {missingEntry.missing && (missingEntry.type === 'FORGOT_ENTRY' || missingEntry.type === 'LATE_ARRIVAL') && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ {
                    missingEntry.type === 'FORGOT_ENTRY'
                      ? 'No has fichado entrada hoy. Usa el botón de arriba para registrar una incidencia.'
                      : 'No has fichado entrada a tu hora programada. Usa el botón de arriba para registrar una incidencia.'
                  }
                </p>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}

