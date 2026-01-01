'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentUserMock } from '@/lib/auth-mock'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const user = await getCurrentUserMock()
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <p className="text-center">Cargando...</p>
      </div>
    </main>
  )
}

