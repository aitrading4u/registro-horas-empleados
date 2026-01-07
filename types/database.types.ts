// Este archivo se generará automáticamente con: npx supabase gen types typescript --project-id <project-id>
// Por ahora, definimos tipos básicos

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      // Se completará después de crear el esquema en Supabase
    }
  }
}



