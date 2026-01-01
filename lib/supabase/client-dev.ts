// Cliente de Supabase para desarrollo que usa service_role_key
// Esto bypass RLS completamente - SOLO PARA DESARROLLO

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Variable global para cachear el cliente
let cachedClient: ReturnType<typeof createSupabaseClient> | null = null

export function createClient() {
  // Si ya tenemos un cliente cacheado, usarlo
  if (cachedClient) {
    return cachedClient
  }

  // Usar service_role_key para desarrollo (bypass RLS)
  const serviceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('🔍 [Supabase Client] Configuración:', {
    hasServiceRoleKey: !!serviceRoleKey,
    hasUrl: !!supabaseUrl,
    hasAnonKey: !!anonKey,
    serviceRoleKeyLength: serviceRoleKey?.length || 0
  })
  
  if (serviceRoleKey && supabaseUrl) {
    // Usar service_role_key que bypass RLS completamente
    console.log('✅ [Supabase Client] Usando SERVICE_ROLE_KEY (bypass RLS)')
    cachedClient = createSupabaseClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`
          }
        }
      }
    )
    return cachedClient
  }
  
  // Fallback a anon key (puede fallar con RLS)
  console.warn('⚠️ [Supabase Client] Service role key no encontrada, usando anon key (puede fallar con RLS)')
  if (!supabaseUrl || !anonKey) {
    throw new Error('Faltan variables de entorno de Supabase')
  }
  cachedClient = createSupabaseClient(
    supabaseUrl,
    anonKey
  )
  return cachedClient
}

