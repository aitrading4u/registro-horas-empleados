-- ============================================
-- SOLUCIÓN: Agregar TODAS las columnas faltantes a la tabla organizations
-- ============================================
-- Copia y pega este SQL completo en Supabase SQL Editor

-- Agregar las columnas que faltan
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS allowed_radius INTEGER DEFAULT 75,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Madrid',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Hacer que latitude y longitude sean NOT NULL (si no tienen datos, usar valores por defecto)
-- Primero actualizar filas existentes si hay alguna
UPDATE organizations 
SET latitude = 40.4168, longitude = -3.7038 
WHERE latitude IS NULL OR longitude IS NULL;

-- Ahora hacer que sean NOT NULL
ALTER TABLE organizations 
ALTER COLUMN latitude SET NOT NULL,
ALTER COLUMN longitude SET NOT NULL;

-- Actualizar el schema cache de Supabase (importante!)
NOTIFY pgrst, 'reload schema';

-- Verificar que todas las columnas están presentes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'organizations' 
AND table_schema = 'public'
ORDER BY ordinal_position;


