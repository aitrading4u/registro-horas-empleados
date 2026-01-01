-- ============================================
-- SOLUCIÓN: Agregar columna time_entry_id a incidents
-- ============================================
-- Este SQL agrega la columna time_entry_id que falta en la tabla incidents
-- Copia y pega TODO este SQL en Supabase SQL Editor

-- Paso 1: Ver la estructura actual de la tabla incidents
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'incidents'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 2: Agregar TODAS las columnas que faltan
ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS time_entry_id UUID REFERENCES time_entries(id) ON DELETE SET NULL;

-- Verificar que approved_by y approved_at existen (deberían existir según el schema)
-- Si no existen, agregarlas
DO $$
BEGIN
  -- Verificar y agregar approved_by si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' 
    AND column_name = 'approved_by'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE incidents ADD COLUMN approved_by UUID REFERENCES users(id);
  END IF;
  
  -- Verificar y agregar approved_at si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'incidents' 
    AND column_name = 'approved_at'
    AND table_schema = 'public'
  ) THEN
    ALTER TABLE incidents ADD COLUMN approved_at TIMESTAMPTZ;
  END IF;
END $$;

-- Paso 3: Verificar que todas las columnas están presentes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'incidents'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Paso 4: Actualizar el schema cache de Supabase (IMPORTANTE!)
NOTIFY pgrst, 'reload schema';

