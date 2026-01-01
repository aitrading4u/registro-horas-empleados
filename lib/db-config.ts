// Configuración para elegir entre Mock DB y Supabase
// Cambia USE_SUPABASE a true para usar Supabase real

export const USE_SUPABASE = process.env.NEXT_PUBLIC_USE_SUPABASE === 'true'

// Exportar las funciones según la configuración
export * from './supabase-db'

// Si quieres usar Supabase, descomenta la siguiente línea y comenta la de mock-db
// export * from './supabase-db'

// Por ahora, mantenemos el mock como fallback
// Para activar Supabase, cambia USE_SUPABASE a true en .env.local


