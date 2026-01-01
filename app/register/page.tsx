'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUpMock, canRegisterAsAdmin } from '@/lib/auth-mock'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    role: 'EMPLOYEE' as 'ADMIN' | 'EMPLOYEE',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [canBeAdmin, setCanBeAdmin] = useState(false)

  useEffect(() => {
    // Verificar si puede registrarse como admin
    canRegisterAsAdmin().then(setCanBeAdmin)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validaciones
    if (formData.password.length !== 3) {
      setError('La contraseña debe tener exactamente 3 números')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (!formData.fullName.trim()) {
      setError('El nombre completo es obligatorio')
      setLoading(false)
      return
    }

    try {
      const result = await signUpMock(
        formData.email,
        formData.password,
        formData.fullName,
        formData.role
      )
      
      if (result) {
        // Registro exitoso, redirigir al dashboard
        router.push('/dashboard')
        router.refresh()
      } else {
        setError('Error al crear la cuenta. El email puede estar en uso.')
      }
    } catch (err: any) {
      console.error('Error en registro:', err)
      setError(err.message || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Crear Cuenta
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Regístrate para comenzar
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre Completo
            </label>
            <input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Juan Pérez"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña (3 números)
            </label>
            <input
              id="password"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{3}"
              value={formData.password}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                setFormData({ ...formData, password: value })
              }}
              required
              minLength={3}
              maxLength={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="123"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              inputMode="numeric"
              pattern="[0-9]{3}"
              value={formData.confirmPassword}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                setFormData({ ...formData, confirmPassword: value })
              }}
              required
              minLength={3}
              maxLength={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="123"
            />
          </div>

          {canBeAdmin && (
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Cuenta
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'ADMIN' | 'EMPLOYEE' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ADMIN">Administrador (Puede crear restaurantes)</option>
                <option value="EMPLOYEE">Empleado (Será agregado a un restaurante)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {formData.role === 'ADMIN' 
                  ? 'Como administrador podrás crear y gestionar restaurantes.'
                  : 'Como empleado serás agregado a un restaurante por un administrador.'}
              </p>
            </div>
          )}

          {!canBeAdmin && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded text-sm">
              Te registrarás como <strong>Empleado</strong>. Un administrador te agregará a un restaurante.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </div>
  )
}

