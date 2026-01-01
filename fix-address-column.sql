-- ============================================
-- SOLUCIÓN: Agregar columna 'address' a la tabla organizations
-- ============================================
-- Copia y pega este SQL completo en Supabase SQL Editor

-- 1. Agregar la columna 'address' si no existe
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS address TEXT;

-- 2. Actualizar el schema cache de Supabase (importante!)
NOTIFY pgrst, 'reload schema';

-- 3. Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND table_schema = 'public'
ORDER BY ordinal_position;

