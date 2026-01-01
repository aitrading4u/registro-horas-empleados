-- ============================================
-- SOLUCIÓN: Agregar columna device_info a time_entries
-- ============================================
-- Este SQL agrega la columna device_info que falta en la tabla time_entries
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver la estructura actual de la tabla time_entries
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'time_entries'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 2: Agregar TODAS las columnas que faltan
ALTER TABLE time_entries
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS device_info TEXT;

-- Paso 3: Verificar que todas las columnas están presentes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'time_entries'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 4: Actualizar el schema cache de Supabase (IMPORTANTE!)
NOTIFY pgrst, 'reload schema';

