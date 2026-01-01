'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOutMock, getCurrentRoleMock, setCurrentRoleMock } from '@/lib/auth-mock'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { getCurrentUserMock } from '@/lib/auth-mock'
import { useEffect, useState } from 'react'
import type { User, UserRole } from '@/types'
import Badge from '@/components/ui/Badge'
import { mockDb } from '@/lib/db'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const [actualRole, setActualRole] = useState<UserRole | null>(null) // Rol real del usuario

  useEffect(() => {
    loadUserData()
    
    // Escuchar cambios en el rol desde otras pestañas/componentes
    const handleStorageChange = () => {
      loadUserData()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // También escuchar cambios en la misma pestaña
    const interval = setInterval(() => {
      loadUserData()
    }, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  const loadUserData = async () => {
    const currentUser = await getCurrentUserMock()
    setUser(currentUser)
    
    // Obtener el rol real del usuario en su organización
    if (currentUser) {
      const orgs = await mockDb.getUserOrganizations(currentUser.id)
      if (orgs.length > 0) {
        const realRole = await mockDb.getUserRoleInOrganization(currentUser.id, orgs[0].id)
        setActualRole(realRole || 'EMPLOYEE')
      } else {
        setActualRole('EMPLOYEE')
      }
    }
    
    const role = await getCurrentRoleMock()
    setCurrentRole(role)
  }

  const handleRoleChange = async (role: UserRole) => {
    // Validar que el usuario solo pueda cambiar a roles que realmente tiene
    if (actualRole && actualRole === 'EMPLOYEE' && role === 'ADMIN') {
      // Empleados no pueden cambiar a vista de administrador
      alert('No tienes permisos de administrador. Solo puedes ver la vista de empleado.')
      return
    }
    
    // Solo permitir cambiar a ADMIN si el usuario realmente es ADMIN o MANAGER
    if (role === 'ADMIN' && actualRole && actualRole !== 'ADMIN' && actualRole !== 'MANAGER') {
      alert('No tienes permisos de administrador.')
      return
    }
    
    setCurrentRoleMock(role)
    setCurrentRole(role)
    router.refresh()
  }

  const handleSignOut = async () => {
    await signOutMock()
    router.push('/login')
    router.refresh()
  }

  const getNavItems = () => {
    const allItems = [
      { href: '/dashboard', label: 'Fichaje' },
      { href: '/organizations', label: 'Restaurantes', roles: ['ADMIN', 'MANAGER'] as UserRole[] },
      { href: '/staff', label: 'Personal', roles: ['ADMIN', 'MANAGER'] as UserRole[] },
      { href: '/incidents', label: 'Incidencias' },
      { href: '/calendar', label: 'Calendario' },
      { href: '/reports', label: 'Reportes' },
      { href: '/reports/workers', label: 'Trabajadores', roles: ['ADMIN', 'MANAGER'] as UserRole[] },
    ]

    // Filtrar items según el rol actual
    if (!currentRole) return allItems.filter(item => !item.roles)

    return allItems.filter(item => {
      if (!item.roles) return true // Items sin restricción de roles
      return item.roles.includes(currentRole)
    })
  }

  const navItems = getNavItems()

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Selector de rol */}
        <div className="bg-primary-50 border-b border-primary-200">
          <div className="flex justify-center items-center py-2 space-x-2">
            <span className="text-sm font-medium text-gray-700">Vista:</span>
            <Button
              size="sm"
              variant={currentRole === 'EMPLOYEE' ? 'primary' : 'outline'}
              onClick={() => handleRoleChange('EMPLOYEE')}
            >
              Personal
            </Button>
            {/* Solo mostrar botón de Administrador si el usuario realmente es ADMIN o MANAGER */}
            {(actualRole === 'ADMIN' || actualRole === 'MANAGER') && (
              <Button
                size="sm"
                variant={currentRole === 'ADMIN' ? 'primary' : 'outline'}
                onClick={() => handleRoleChange('ADMIN')}
              >
                Administrador
              </Button>
            )}
            {currentRole && (
              <Badge variant="info" className="ml-2">
                {currentRole === 'EMPLOYEE' ? 'Empleado' : currentRole === 'MANAGER' ? 'Encargado' : 'Admin'}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-primary-600">
                Control Horario
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    pathname === item.href
                      ? 'border-primary-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-sm text-gray-700">
                {user.full_name || user.email}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Salir
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

