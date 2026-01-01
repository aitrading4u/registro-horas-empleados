'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { signInMock } from '@/lib/auth-mock'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  useEffect(() => {
    // Cargar email guardado si existe
    const savedEmail = localStorage.getItem('saved_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signInMock(email, password)
      if (result) {
        // Guardar email si "recordar usuario" está activado
        if (rememberMe) {
          localStorage.setItem('saved_email', email)
        } else {
          localStorage.removeItem('saved_email')
        }
        
        router.push('/dashboard')
        router.refresh()
      } else {
        setError('Credenciales incorrectas')
      }
    } catch (err) {
      setError('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">
          Control Horario
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Inicia sesión para continuar
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="tu@email.com"
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
              value={password}
              onChange={(e) => {
                // Solo permitir números y máximo 3 dígitos
                const value = e.target.value.replace(/\D/g, '').slice(0, 3)
                setPassword(value)
              }}
              required
              minLength={3}
              maxLength={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="123"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Recordar usuario
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </Button>
        </form>

        <p className="mt-4 text-xs text-center text-gray-500">
          Modo desarrollo: Cualquier email funciona
        </p>
      </Card>
    </div>
  )
}

